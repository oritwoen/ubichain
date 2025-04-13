import { generateKeyPublic as getKeyPublic } from '../utils/secp256k1'
import { hexToBytes } from '@noble/hashes/utils'
import { keccak_256 } from '@noble/hashes/sha3'
import { createVersionedHash, addSchemeByte } from '../utils/address'
import { encodeBase58Check, validateBase58Check } from '../utils/encoding'
import type { Curve } from '../types'

export default function tron() {
  const name = "tron";
  const curve: Curve = "secp256k1";
  
  /**
   * Get TRON address from public key
   * TRON uses Keccak-256 hash and base58check encoding with version byte 0x41
   * Addresses start with 'T'
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
    const addressBytes = keccakHash.slice(keccakHash.length - 20)
    
    // Create versioned hash with TRON version byte 0x41 (using addSchemeByte)
    const hashVersioned = addSchemeByte(addressBytes, 0x41, true)
    
    // Encode with Base58Check
    return encodeBase58Check(hashVersioned)
  }

  /**
   * Validate a TRON address
   * Valid TRON addresses:
   * - Start with 'T'
   * - Have version byte 0x41
   * - Pass base58check validation
   * 
   * @param address - The address to validate
   * @returns Whether the address is valid
   */
  function validateAddress(address: string): boolean {
    return validateBase58Check(address, 0x41, 'T')
  }

  return {
    name,
    curve,
    getKeyPublic,
    getAddress,
    validateAddress,
  }
}