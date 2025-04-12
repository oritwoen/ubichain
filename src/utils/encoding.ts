import { sha256 } from '@noble/hashes/sha256'
import { base58check } from '@scure/base'

/**
 * Encode data with Base58Check
 * @param data - The data to encode
 * @returns Base58Check encoded string
 */
export function encodeBase58Check(data: Uint8Array): string {
  return base58check(sha256).encode(data)
}

/**
 * Decode a Base58Check string
 * @param address - The Base58Check string to decode
 * @returns Decoded bytes
 */
export function decodeBase58Check(address: string): Uint8Array {
  return base58check(sha256).decode(address)
}

/**
 * Validate a Base58Check address with specific version byte
 * @param address - The address to validate
 * @param bytesVersion - The expected version byte
 * @param expectedPrefix - The expected prefix character(s)
 * @param expectedLength - Expected length of decoded bytes (default: 21)
 * @returns Whether the address is valid
 */
export function validateBase58Check(
  address: string, 
  bytesVersion: number,
  expectedPrefix?: string,
  expectedLength: number = 21
): boolean {
  // Quick format check before trying to decode
  if (!address || typeof address !== 'string') {
    return false
  }
  
  // Check if the address has the expected prefix if provided
  if (expectedPrefix && !address.startsWith(expectedPrefix)) {
    return false
  }
  
  // Most blockchain addresses are within this length range
  if (address.length < 26 || address.length > 35) {
    return false
  }
  
  try {
    // Try to decode the address with Base58Check
    const decoded = decodeBase58Check(address)
    
    // Check length (typically 21 bytes: 1 byte version + 20 bytes hash)
    if (decoded.length !== expectedLength) {
      return false
    }
    
    // Check version byte
    if (decoded[0] !== bytesVersion) {
      return false
    }
    
    return true
  } catch {
    // If decoding fails, the address is invalid
    return false
  }
}