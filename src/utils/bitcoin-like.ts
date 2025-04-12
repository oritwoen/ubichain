import { sha256 } from '@noble/hashes/sha256'
import { ripemd160 } from '@noble/hashes/ripemd160'
import { hexToBytes } from '@noble/hashes/utils'
import { base58check } from '@scure/base'

/**
 * Create RIPEMD160(SHA256(input)) hash - commonly used in Bitcoin-like blockchains
 * @param data - Input bytes
 * @returns Hash160 result
 */
export function hash160(data: Uint8Array): Uint8Array {
  return ripemd160(sha256(data))
}

type OptionsAddressLegacy = {
  bytesVersion: number
}

/**
 * Generate Legacy (P2PKH) address for Bitcoin-like blockchains
 * @param keyPublic - The public key as a hex string
 * @param options - Options for address generation with version byte
 * @returns Legacy address
 */
export function generateAddressLegacy(keyPublic: string, options: OptionsAddressLegacy): string {
  // Convert public key to bytes
  const bytesKeyPublic = hexToBytes(keyPublic)
  
  // Hash the public key with hash160 (RIPEMD160(SHA256(pubkey)))
  const hashPubKey = hash160(bytesKeyPublic)
  
  // Add version byte
  const hashVersioned = new Uint8Array(21)
  hashVersioned[0] = options.bytesVersion
  hashVersioned.set(hashPubKey, 1)
  
  // Encode with Base58Check
  return base58check(sha256).encode(hashVersioned)
}

/**
 * Validate a Bitcoin-like Legacy (P2PKH) address
 * @param address - The address to validate
 * @param options - Options for address validation with version byte
 * @returns Whether the address is valid
 */
export function validateAddressLegacy(address: string, options: OptionsAddressLegacy): boolean {
  // Quick format check before trying to decode
  if (!address || typeof address !== 'string') {
    return false
  }
  
  // Check if the address has the expected format: starts with expected character and has valid length
  if (options.bytesVersion === 0x00 && !address.startsWith('1')) {
    return false
  }
  
  // Bitcoin addresses are typically 26-35 characters long
  if (address.length < 26 || address.length > 35) {
    return false
  }
  
  try {
    // Try to decode the address with Base58Check
    const decoded = base58check(sha256).decode(address)
    
    // Check length (21 bytes: 1 byte version + 20 bytes hash)
    if (decoded.length !== 21) {
      return false
    }
    
    // Check version byte
    if (decoded[0] !== options.bytesVersion) {
      return false
    }
    
    return true
  } catch {
    // If decoding fails, the address is invalid
    return false
  }
}