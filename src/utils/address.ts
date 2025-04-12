import { sha256 } from '@noble/hashes/sha256'
import { ripemd160 } from '@noble/hashes/ripemd160'
import { hexToBytes } from '@noble/hashes/utils'
import { encodeBase58Check, validateBase58Check } from './encoding'

/**
 * Create RIPEMD160(SHA256(input)) hash - commonly used in Bitcoin-like blockchains
 * @param data - Input bytes
 * @returns Hash160 result
 */
export function hash160(data: Uint8Array): Uint8Array {
  return ripemd160(sha256(data))
}

// Base address options type
export type OptionsAddress = {
  bytesVersion: number
}

// Legacy (P2PKH) address options
export type OptionsAddressLegacy = OptionsAddress

// P2SH address options
export type OptionsAddressP2SH = OptionsAddress

/**
 * Create a versioned hash with a version byte
 * @param hash - The hash to version
 * @param bytesVersion - The version byte to use
 * @returns Versioned hash with version byte prepended
 */
export function createVersionedHash(hash: Uint8Array, bytesVersion: number): Uint8Array {
  const hashVersioned = new Uint8Array(hash.length + 1)
  hashVersioned[0] = bytesVersion
  hashVersioned.set(hash, 1)
  return hashVersioned
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
  
  // Create versioned hash
  const hashVersioned = createVersionedHash(hashPubKey, options.bytesVersion)
  
  // Encode with Base58Check
  return encodeBase58Check(hashVersioned)
}

/**
 * Validate a Bitcoin-like Legacy (P2PKH) address
 * @param address - The address to validate
 * @param options - Options for address validation with version byte
 * @returns Whether the address is valid
 */
export function validateAddressLegacy(address: string, options: OptionsAddressLegacy): boolean {
  // Get expected prefix for this version
  const expectedPrefix = options.bytesVersion === 0x00 ? '1' : undefined
  
  // Use common validation function
  return validateBase58Check(address, options.bytesVersion, expectedPrefix)
}

/**
 * Generate P2SH address for Bitcoin-like blockchains
 * @param keyPublic - The public key as a hex string
 * @param options - Options for address generation with version byte
 * @returns P2SH address
 */
export function generateAddressP2SH(keyPublic: string, options: OptionsAddressP2SH): string {
  // Convert public key to bytes
  const bytesKeyPublic = hexToBytes(keyPublic)
  
  // Hash the public key with hash160 (RIPEMD160(SHA256(pubkey)))
  const hashPubKey = hash160(bytesKeyPublic)
  
  // Create redeem script (simplification, real P2SH would be more complex)
  const redeemScript = new Uint8Array(hashPubKey.length + 3)
  redeemScript[0] = 0x00 // OP_0 
  redeemScript[1] = 0x14 // 20 bytes length
  redeemScript.set(hashPubKey, 2)
  
  // Hash the redeem script
  const hashRedeemScript = hash160(redeemScript)
  
  // Create versioned hash
  const hashVersioned = createVersionedHash(hashRedeemScript, options.bytesVersion)
  
  // Encode with Base58Check
  return encodeBase58Check(hashVersioned)
}

/**
 * Validate a P2SH address
 * @param address - The address to validate
 * @param options - Options for address validation with version byte
 * @returns Whether the address is valid
 */
export function validateAddressP2SH(address: string, options: OptionsAddressP2SH): boolean {
  // Get expected prefix for this version
  const expectedPrefix = options.bytesVersion === 0x05 ? '3' : undefined
  
  // Use common validation function
  return validateBase58Check(address, options.bytesVersion, expectedPrefix)
}