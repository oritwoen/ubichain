import { hexToBytes, bytesToHex } from '@noble/hashes/utils'
import { keccak_256 } from '@noble/hashes/sha3'
import { secp256k1 } from '@noble/curves/secp256k1'
import { generateKeyPublic as getSecp256k1KeyPublic } from './secp256k1'
import type { BlockchainImplementation } from '../types'

/**
 * Generate an EVM compatible address from a public key
 * The address is the last 20 bytes of the Keccak-256 hash of the public key
 * 
 * @param keyPublic - The public key as a hex string
 * @returns The EVM address (0x-prefixed with EIP-55 checksum)
 */
export function generateAddress(keyPublic: string): string {
  // Convert public key to bytes
  const keyPublicBytes = hexToBytes(keyPublic)
  
  // For EVM addresses, we need to:
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
  const addressBytes = keccakHash.slice(-20)
  
  // Convert to hex string
  const addressHex = bytesToHex(addressBytes)
  
  // Apply EIP-55 checksum and return with 0x prefix
  return '0x' + toChecksumAddress(addressHex)
}

/**
 * Calculate the EIP-55 checksummed version of an EVM address
 * 
 * @param address - The address to checksum (without 0x prefix)
 * @returns The checksummed address (without 0x prefix)
 */
export function toChecksumAddress(address: string): string {
  // Convert address to lowercase
  const lowercaseAddress = address.toLowerCase()
  
  // Hash the lowercase address
  const addressHash = bytesToHex(keccak_256(lowercaseAddress))
  
  // Apply checksum rules - using array for better performance
  const result = Array.from({length: lowercaseAddress.length})
  
  // Use for...of with entries to get both index and character
  for (const [i, char] of [...lowercaseAddress].entries()) {
    const hashChar = addressHash[i]
    if (hashChar === undefined) {
      throw new Error(`Invalid hash character at index ${i}`)
    }
    
    // If the ith character in the hash is 8 or higher, uppercase the ith character in the address
    result[i] = Number.parseInt(hashChar, 16) >= 8 ? char.toUpperCase() : char
  }
  
  return result.join('')
}

/**
 * Validate an EVM address including EIP-55 checksum if mixed case
 * 
 * @param address - The address to validate
 * @returns Whether the address is valid
 */
export function validateAddress(address: string): boolean {
  if (!address.startsWith('0x')) {
    return false
  }
  
  // EVM addresses should be 42 characters (0x + 40 hex chars)
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

/**
 * Factory function that creates a blockchain implementation for an EVM chain
 * 
 * @param name - The name of the blockchain
 * @param options - Optional configuration parameters
 * @returns An object implementing the Blockchain interface for EVM chains
 */
export function createEVMBlockchain(name: string, options: { network?: string, bip44: number }): BlockchainImplementation {
  const network = options.network || 'mainnet';
  const bip44 = options.bip44;
  
  return {
    name,
    curve: "secp256k1" as const,
    network,
    bip44,
    getKeyPublic: getSecp256k1KeyPublic,
    getAddress: generateAddress,
    validateAddress,
  }
}