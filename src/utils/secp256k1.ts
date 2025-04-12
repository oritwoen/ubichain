import { secp256k1 } from '@noble/curves/secp256k1'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'

type KeyPublicOptions = {
  compressed?: boolean
}

/**
 * Generates a public key from a private key using secp256k1 elliptic curve
 * Used by Bitcoin, Litecoin, Dogecoin and other similar blockchains
 * 
 * @param keyPrivate - The private key as a hex string
 * @param options - Options for public key generation
 * @returns The public key as a hex string
 */
export function generateKeyPublic(keyPrivate: string, options: KeyPublicOptions = {}): string {
  const { compressed = true } = options
  
  // Convert hex string to Uint8Array
  const keyPrivateBytes = hexToBytes(keyPrivate)
  
  // Get public key point from private key
  const keyPublic = secp256k1.getPublicKey(keyPrivateBytes, compressed)
  
  // Return hex string
  return bytesToHex(keyPublic)
}