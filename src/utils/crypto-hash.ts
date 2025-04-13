import { hexToBytes } from '@noble/hashes/utils'
import { sha256 } from '@noble/hashes/sha256'
import { ripemd160 } from '@noble/hashes/ripemd160'
import { keccak_256 } from '@noble/hashes/sha3'
import { blake2b } from '@noble/hashes/blake2b'
import { sha3_256 } from '@noble/hashes/sha3'

/**
 * Unified hash function types that are commonly used in blockchains
 */
export type HashFunction = (data: Uint8Array) => Uint8Array;

/**
 * Hash functions available in the library
 */
export const hashFunctions = {
  sha256,
  ripemd160,
  keccak256: keccak_256,
  blake2b: (data: Uint8Array) => blake2b(data, { dkLen: 32 }),
  sha3_256,
  hash160: (data: Uint8Array) => ripemd160(sha256(data))
};

/**
 * Perform a hash operation on a public key or other data
 * 
 * @param data - Input data as hex string
 * @param hashFn - Hash function to use
 * @param slice - Optional start and end positions to slice from result
 * @returns Hashed data as Uint8Array
 */
export function hashData(
  data: string, 
  hashFn: HashFunction,
  slice?: { start?: number, end?: number }
): Uint8Array {
  // Convert hex string to bytes
  const bytes = hexToBytes(data);
  
  // Apply hash function
  const hashed = hashFn(bytes);
  
  // Return sliced or full hash data
  if (!slice) {
    return hashed;
  }
  
  const start = slice.start || 0;
  const end = slice.end ?? hashed.length;
  
  return hashed.slice(start, end);
}

/**
 * Create an address with a prefix byte + data
 * Common operation for many blockchains
 * 
 * @param data - Input bytes
 * @param prefixByte - Prefix byte to add
 * @returns Combined array with prefix byte
 */
export function addPrefixByte(data: Uint8Array, prefixByte: number): Uint8Array {
  const result = new Uint8Array(data.length + 1);
  result[0] = prefixByte;
  result.set(data, 1);
  return result;
}

/**
 * Append a byte to data array
 * 
 * @param data - Input bytes
 * @param appendByte - Byte to append
 * @returns Combined array with appended byte
 */
export function appendByte(data: Uint8Array, appendByte: number): Uint8Array {
  const result = new Uint8Array(data.length + 1);
  result.set(data);
  result[data.length] = appendByte;
  return result;
}