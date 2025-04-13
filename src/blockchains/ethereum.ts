import { generateKeyPublic as getKeyPublic } from '../utils/secp256k1'
import { hexToBytes, bytesToHex } from '@noble/hashes/utils'
import { keccak_256 } from '@noble/hashes/sha3'
import { secp256k1 } from '@noble/curves/secp256k1'
import type { Curve } from '../types'

export default function ethereum() {
  const name = "ethereum";
  const curve: Curve = "secp256k1";
  
  /**
   * Get Ethereum address from public key
   * Ethereum addresses are the last 20 bytes of the Keccak-256 hash of the public key
   * 
   * @param keyPublic - The public key as a hex string
   * @returns Ethereum address string (0x-prefixed, lowercase hex)
   */
  function getAddress(keyPublic: string): string {
    // Convert public key to bytes
    const keyPublicBytes = hexToBytes(keyPublic)
    
    // For Ethereum addresses, we need to:
    // 1. Convert to uncompressed format if compressed
    // 2. Remove the first byte (0x04) from uncompressed key
    // 3. Hash with keccak-256
    // 4. Take the last 20 bytes
    let publicKeyForHashing: Uint8Array
    
    if (keyPublicBytes.length === 33) {
      // Compressed format (33 bytes starting with 02 or 03)
      // We need to decompress it manually without trying to regenerate from private key
      const point = secp256k1.ProjectivePoint.fromHex(keyPublicBytes)
      const uncompressedKey = point.toRawBytes(false) // false = uncompressed
      publicKeyForHashing = uncompressedKey.slice(1) // Remove the 0x04 prefix
    } else if (keyPublicBytes.length === 65) {
      // Already uncompressed (65 bytes starting with 04)
      publicKeyForHashing = keyPublicBytes.slice(1) // Remove the 0x04 prefix
    } else {
      throw new Error(`Invalid public key length: ${keyPublicBytes.length} bytes`)
    }
    
    // Apply Keccak-256 hash to the public key
    const keccakHash = keccak_256(publicKeyForHashing)
    
    // Take the last 20 bytes of the hash result
    const addressBytes = keccakHash.slice(keccakHash.length - 20)
    
    // Convert to hex string
    const addressHex = bytesToHex(addressBytes)
    
    // Apply EIP-55 checksum and return with 0x prefix
    return '0x' + toChecksumAddress(addressHex)
  }

  /**
   * Calculate the EIP-55 checksummed version of an Ethereum address
   * 
   * @param address - The address to checksum (without 0x prefix)
   * @returns The checksummed address (without 0x prefix)
   */
  function toChecksumAddress(address: string): string {
    // Convert address to lowercase
    const lowercaseAddress = address.toLowerCase()
    
    // Hash the lowercase address
    const addressHash = bytesToHex(keccak_256(lowercaseAddress))
    
    // Apply checksum rules
    let result = ''
    for (let i = 0; i < lowercaseAddress.length; i++) {
      const hashChar = addressHash[i]
      if (hashChar === undefined) {
        throw new Error(`Invalid hash character at index ${i}`)
      }
      
      // If the ith character in the hash is 8 or higher, uppercase the ith character in the address
      if (parseInt(hashChar, 16) >= 8) {
        const char = lowercaseAddress[i]
        if (char) {
          result += char.toUpperCase()
        }
      } else {
        const char = lowercaseAddress[i]
        if (char) {
          result += char
        }
      }
    }
    
    return result
  }

  /**
   * Validate an Ethereum address
   * Valid Ethereum addresses:
   * - Start with '0x'
   * - Are 42 characters long (including 0x prefix)
   * - Contain valid hex characters
   * - If mixed case, validate EIP-55 checksum
   * 
   * @param address - The address to validate
   * @returns Whether the address is valid
   */
  function validateAddress(address: string): boolean {
    if (!address.startsWith('0x')) {
      return false
    }
    
    // Ethereum addresses should be 42 characters (0x + 40 hex chars)
    if (address.length !== 42) {
      return false
    }
    
    // Check if the address contains only valid hex characters
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return false
    }
    
    // Remove the 0x prefix
    const addressWithoutPrefix = address.slice(2)
    
    // If the address is all lowercase or all uppercase, it's considered valid
    // This is for backward compatibility with pre-EIP-55 addresses
    if (addressWithoutPrefix === addressWithoutPrefix.toLowerCase() || 
        addressWithoutPrefix === addressWithoutPrefix.toUpperCase()) {
      return true
    }
    
    // If mixed case, validate EIP-55 checksum
    return toChecksumAddress(addressWithoutPrefix) === addressWithoutPrefix
  }

  return {
    name,
    curve,
    getKeyPublic,
    getAddress,
    validateAddress,
  }
}