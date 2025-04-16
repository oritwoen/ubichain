import { blake2b } from '@noble/hashes/blake2b'
import { hexToBytes } from '@noble/hashes/utils'
import { generateKeyPublic as getEd25519KeyPublic } from '../utils/ed25519'
import { generateKeyPublic as getSecp256k1KeyPublic } from '../utils/secp256k1'
import { validateAddressHex, addSchemeByte, createPrefixedAddress } from '../utils/address'
import type { Curve, Options, BlockchainImplementation } from '../types'

/**
 * Sui blockchain implementation
 * 
 * @param options - Optional configuration parameters
 * @param options.network - Network to use (mainnet, testnet, devnet)
 * @returns An object implementing the Blockchain interface for Sui
 */
export default function sui(options?: Options) {
  const name = "sui";
  const curve: Curve[] = ["ed25519", "secp256k1"];
  const network = options?.network || 'mainnet';
  const bip44 = 784; // SLIP-0044 index for Sui
  
  /**
   * Flag bytes for different signature schemes in Sui
   */
  const SIGNATURE_SCHEME_FLAGS = {
    ED25519: 0x00,
    SECP256K1: 0x01,
    SECP256R1: 0x02,
    MULTISIG: 0x03
  };

  /**
   * Get Sui public key with specified scheme (defaults to Ed25519)
   * 
   * @param keyPrivate - The private key as a hex string
   * @param scheme - Signature scheme (ed25519, secp256k1)
   * @returns Public key as hex string
   */
  function getKeyPublic(keyPrivate: string, options?: Record<string, any>): string {
    // Extract scheme from options or use default 'ed25519'
    const scheme = options?.scheme || 'ed25519';
    
    if (scheme.toLowerCase() === 'secp256k1') {
      return getSecp256k1KeyPublic(keyPrivate, { compressed: true })
    }
    
    // Default to Ed25519
    return getEd25519KeyPublic(keyPrivate)
  }
  
  /**
   * Get Sui address from public key
   * Sui address is derived by hashing signature scheme flag + public key bytes using BLAKE2b
   * The address format is the same for mainnet, testnet, and devnet
   * 
   * @param keyPublic - The public key as a hex string
   * @param scheme - Signature scheme (ed25519, secp256k1)
   * @returns Sui address (hex encoded BLAKE2b hash with 0x prefix)
   */
  function getAddress(keyPublic: string, type?: string): string {
    // Convert public key to bytes
    const keyPublicBytes = hexToBytes(keyPublic)
    
    // Determine flag byte based on scheme
    const flagByte = type?.toLowerCase() === 'secp256k1' 
      ? SIGNATURE_SCHEME_FLAGS.SECP256K1
      : SIGNATURE_SCHEME_FLAGS.ED25519
    
    // Create input for hashing: flag byte + public key
    const input = addSchemeByte(keyPublicBytes, flagByte, true);
    
    // Hash with BLAKE2b-256
    const hash = blake2b(input, { dkLen: 32 }) // 32 bytes = 256 bits
    
    // Sui address is just the hex representation of the hash
    return createPrefixedAddress(hash)
  }

  /**
   * Validate a Sui address
   * Valid Sui addresses:
   * - Start with '0x'
   * - Are 66 characters long (0x + 64 hex chars)
   * - Contain only valid hex characters
   * The validation is the same for mainnet, testnet, and devnet
   * 
   * @param address - The address to validate
   * @returns Whether the address is valid
   */
  function validateAddress(address: string): boolean {
    return validateAddressHex(address, {
      prefix: '0x',
      length: 64,
      caseSensitive: false
    });
  }

  return {
    name,
    curve,
    network,
    bip44,
    getKeyPublic,
    getAddress,
    validateAddress,
  } satisfies BlockchainImplementation;
}