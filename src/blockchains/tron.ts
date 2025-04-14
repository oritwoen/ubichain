import { generateKeyPublic as getKeyPublic } from '../utils/secp256k1'
import { hexToBytes } from '@noble/hashes/utils'
import { keccak_256 } from '@noble/hashes/sha3'
import { addSchemeByte } from '../utils/address'
import { encodeBase58Check, validateBase58Check } from '../utils/encoding'
import type { Curve, Options } from '../types'

/**
 * Tron blockchain implementation
 * 
 * @param options - Optional configuration parameters
 * @param options.network - Network to use (mainnet, testnet, etc.)
 * @returns An object implementing the Blockchain interface for Tron
 */
export default function tron(options?: Options) {
  const name = "tron";
  const curve: Curve = "secp256k1";
  const network = options?.network || 'mainnet';
  
  // Network-specific parameters for address generation and validation
  const networkParams = {
    mainnet: {
      prefixByte: 0x41, // 65 in decimal, mainnet addresses start with 'T'
      prefixChar: 'T'
    },
    testnet: {
      prefixByte: 0xa0, // 160 in decimal, testnet addresses typically start with a different character
      prefixChar: 'A'  // Testnet addresses often start with 'A'
    }
  };
  
  // Get parameters for the current network
  const params = network === 'testnet' ? networkParams.testnet : networkParams.mainnet;
  
  /**
   * Get TRON address from public key
   * TRON uses Keccak-256 hash and base58check encoding with version byte
   * Mainnet addresses start with 'T' (prefix 0x41)
   * Testnet addresses typically start with 'A' (prefix 0xa0)
   * 
   * @param keyPublic - The public key as a hex string
   * @returns TRON address string
   */
  function getAddress(keyPublic: string): string {
    // Convert public key to bytes
    const keyPublicBytes = hexToBytes(keyPublic)
    
    // Apply Keccak-256 hash to the public key
    const keccakHash = keccak_256(keyPublicBytes)
    
    // Take the last 20 bytes of the hash result
    const addressBytes = keccakHash.slice(-20)
    
    // Create versioned hash with network-specific prefix byte
    const hashVersioned = addSchemeByte(addressBytes, params.prefixByte, true)
    
    // Encode with Base58Check
    return encodeBase58Check(hashVersioned)
  }

  /**
   * Validate a TRON address
   * Valid TRON addresses:
   * - Start with the correct prefix character for the network
   * - Have the correct version byte for the network
   * - Pass base58check validation
   * 
   * @param address - The address to validate
   * @returns Whether the address is valid
   */
  function validateAddress(address: string): boolean {
    return validateBase58Check(address, params.prefixByte, params.prefixChar)
  }

  return {
    name,
    curve,
    network,
    getKeyPublic,
    getAddress,
    validateAddress,
  }
}