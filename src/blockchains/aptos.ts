import { sha3_256 } from '@noble/hashes/sha3'
import { hexToBytes } from '@noble/hashes/utils'
import { generateKeyPublic as getKeyPublic } from '../utils/ed25519'
import { validateAddressHex, addSchemeByte, createPrefixedAddress } from '../utils/address'
import { ed25519SignMessage, ed25519VerifyMessage } from '../utils/ed25519-chains'
import type { Curve, Options, BlockchainImplementation, KeyOptions } from '../types'

/**
 * Aptos blockchain implementation
 * 
 * @param options - Optional configuration parameters
 * @param options.network - Network to use (mainnet, testnet, etc.)
 * @returns An object implementing the Blockchain interface for Aptos
 */
export default function aptos(options?: Options) {
  const name = "aptos";
  const curve: Curve = "ed25519";
  const network = options?.network || 'mainnet';
  const bip44 = 637; // SLIP-0044 index for Aptos
  
  /**
   * Get Aptos address from public key
   * Aptos address is the 32-byte SHA3-256 hash of the public key concatenated with a single byte 0x00
   * The address format is the same for both mainnet and testnet
   * 
   * @param keyPublic - The public key as a hex string
   * @returns Aptos address (hex string)
   */
  function getAddress(keyPublic: string): string {
    // Convert hex public key to bytes
    const keyPublicBytes = hexToBytes(keyPublic)
    
    // Concatenate with scheme identifier byte (0x00 for single Ed25519)
    const dataToHash = addSchemeByte(keyPublicBytes, 0x00, false)
    
    // Hash with SHA3-256
    const addressBytes = sha3_256(dataToHash)
    
    // Return as hex string with 0x prefix
    return createPrefixedAddress(addressBytes)
  }

  /**
   * Validate an Aptos address
   * Aptos addresses are hex-encoded 32-byte values starting with '0x'
   * The validation is the same for both mainnet and testnet
   * 
   * @param address - The address to validate
   * @returns Whether the address is valid
   */
  function validateAddress(address: string): boolean {
    try {
      return validateAddressHex(address, {
        prefix: '0x',
        length: 64,
        caseSensitive: false
      });
    } catch {
      return false
    }
  }

  /**
   * Signs a message using Ed25519 for Aptos
   * 
   * @param message - The message to sign
   * @param keyPrivate - The private key
   * @param options - Optional parameters
   * @returns The signature as a hex string
   */
  function signMessage(message: string | Uint8Array, keyPrivate: string, options?: KeyOptions): string {
    return ed25519SignMessage(message, keyPrivate, options);
  }

  /**
   * Verifies a message signature for Aptos
   * 
   * @param message - The original message
   * @param signature - The signature to verify
   * @param keyPublic - The public key
   * @param options - Optional parameters
   * @returns Whether the signature is valid
   */
  function verifyMessage(message: string | Uint8Array, signature: string, keyPublic: string, options?: KeyOptions): boolean {
    return ed25519VerifyMessage(message, signature, keyPublic, options);
  }

  return {
    name,
    curve,
    network,
    bip44,
    getKeyPublic,
    getAddress,
    validateAddress,
    signMessage,
    verifyMessage
  } satisfies BlockchainImplementation;
}