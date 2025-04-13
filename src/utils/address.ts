import { sha256 } from '@noble/hashes/sha256'
import { ripemd160 } from '@noble/hashes/ripemd160'
import { hexToBytes, bytesToHex } from '@noble/hashes/utils'
import { encodeBase58Check, validateBase58Check } from './encoding'
import { bech32 } from '@scure/base'

/**
 * Create RIPEMD160(SHA256(input)) hash - commonly used in Bitcoin-like blockchains
 * @param data - Input bytes
 * @returns Hash160 result
 */
export function hash160(data: Uint8Array): Uint8Array {
  // Calculate SHA256 hash
  const sha256Hash = sha256(data)
  
  // Calculate RIPEMD160 hash of the SHA256 hash
  // This avoids creating an intermediate array
  return ripemd160(sha256Hash)
}

/**
 * Base Bitcoin address options that use version bytes (legacy P2PKH and P2SH)
 */
export type OptionsAddressVersioned = {
  bytesVersion: number
}

// Use the unified type for both legacy and P2SH addresses
export type OptionsAddressLegacy = OptionsAddressVersioned
export type OptionsAddressP2SH = OptionsAddressVersioned

// SegWit (bech32) address options
export type OptionsAddressSegWit = {
  hrp: string, // Human readable part (prefix)
  witnessVersion: number // Usually 0 for standard P2WPKH
}

/**
 * Options for validating hex addresses
 */
export interface OptionsAddressHex {
  prefix?: string; // Prefix for address (e.g. '0x')
  length?: number; // Expected length without prefix
  caseSensitive?: boolean; // Whether hex is case sensitive
}

/**
 * Create a versioned hash with a version byte
 * @param hash - The hash to version
 * @param bytesVersion - The version byte to use
 * @returns Versioned hash with version byte prepended
 * @deprecated Use addSchemeByte instead
 */
export function createVersionedHash(hash: Uint8Array, bytesVersion: number): Uint8Array {
  return addSchemeByte(hash, bytesVersion, true);
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

/**
 * Generate SegWit (bech32) address for Bitcoin-like blockchains
 * @param keyPublic - The public key as a hex string
 * @param options - Options for SegWit address generation
 * @returns SegWit address (bech32 format)
 */
export function generateAddressSegWit(keyPublic: string, options: OptionsAddressSegWit): string {
  // Convert public key to bytes
  const bytesKeyPublic = hexToBytes(keyPublic)
  
  // Hash the public key with hash160 (RIPEMD160(SHA256(pubkey)))
  const hashPubKey = hash160(bytesKeyPublic)
  
  // For witness version 0, just use the keyHash directly
  const words = bech32.toWords(hashPubKey)
  
  // Add witness version to the beginning of the words array
  const wordsWithVersion = [options.witnessVersion, ...words]
  
  // Encode with bech32
  return bech32.encode(options.hrp, wordsWithVersion)
}

/**
 * Validate a Bitcoin-like SegWit (bech32) address
 * @param address - The address to validate
 * @param options - Options for SegWit address validation
 * @returns Whether the address is valid
 */
export function validateAddressSegWit(address: string, options: OptionsAddressSegWit): boolean {
  try {
    // Try to decode as bech32
    const decoded = bech32.decodeUnsafe(address)
    
    // If decoding failed or hrp doesn't match
    if (!decoded || decoded.prefix !== options.hrp) {
      return false
    }
    
    // Check witness version (first word)
    if (decoded.words[0] !== options.witnessVersion) {
      return false
    }
    
    // Check length (depends on witness version, for v0 should be 20-32 bytes after witness version)
    const data = bech32.fromWordsUnsafe(decoded.words.slice(1))
    if (!data) return false
    
    if (options.witnessVersion === 0) {
      // For v0, program length must be 20 (P2WPKH) or 32 (P2WSH) bytes
      return data.length === 20 || data.length === 32
    }
    
    // For future witness versions
    return true
  } catch {
    // If decoding fails, the address is invalid
    return false
  }
}

/**
 * Validate a hex address with common format like 0x-prefixed addresses
 * Used by Ethereum, Sui, Aptos and others
 * 
 * @param address - Address to validate
 * @param options - Validation options
 * @returns Whether the address is valid
 */
export function validateAddressHex(address: string, options: OptionsAddressHex = {}): boolean {
  // Set defaults
  const prefix = options.prefix || '0x';
  const expectedLength = options.length || 40;
  const caseSensitive = options.caseSensitive || false;
  
  // Check prefix
  if (!address.startsWith(prefix)) {
    return false;
  }
  
  // Remove prefix and check length
  const addressWithoutPrefix = address.slice(prefix.length);
  if (addressWithoutPrefix.length !== expectedLength) {
    return false;
  }
  
  // Create regex pattern based on case sensitivity
  const pattern = caseSensitive 
    ? new RegExp(`^[0-9a-f]{${expectedLength}}$`) 
    : new RegExp(`^[0-9a-fA-F]{${expectedLength}}$`);
  
  // Check if it's valid hex
  return pattern.test(addressWithoutPrefix);
}

/**
 * Create a standard prefixed hash address
 * Used by Ethereum, Sui, Aptos and others
 * 
 * @param hash - Hash bytes to use as address
 * @param prefix - Prefix to add (default: '0x')
 * @returns Prefixed hex address
 */
export function createPrefixedAddress(hash: Uint8Array, prefix: string = '0x'): string {
  return prefix + bytesToHex(hash);
}

/**
 * Helper function to create a byte array with scheme/flag byte and data
 * Used by many blockchains like Sui, Aptos
 * 
 * @param data - The main data bytes
 * @param schemeByte - The scheme or flag byte to prepend/append
 * @param prepend - Whether to prepend (true) or append (false) the scheme byte
 * @returns Combined byte array
 */
export function addSchemeByte(
  data: Uint8Array, 
  schemeByte: number, 
  prepend: boolean = true
): Uint8Array {
  // Create new array with extra byte
  const result = new Uint8Array(data.length + 1);
  
  if (prepend) {
    // Scheme byte at the beginning
    result[0] = schemeByte;
    result.set(data, 1);
  } else {
    // Scheme byte at the end
    result.set(data);
    result[data.length] = schemeByte;
  }
  
  return result;
}