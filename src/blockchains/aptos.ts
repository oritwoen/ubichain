import { sha3_256 } from '@noble/hashes/sha3'
import { hexToBytes } from '@noble/hashes/utils'
import { generateKeyPublic as getKeyPublic } from '../utils/ed25519'
import { validateAddressHex, addSchemeByte, createPrefixedAddress } from '../utils/address'
import type { Curve, Options, BlockchainImplementation } from '../types'

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

  return {
    name,
    curve,
    network,
    getKeyPublic,
    getAddress,
    validateAddress,
  } satisfies BlockchainImplementation;
}