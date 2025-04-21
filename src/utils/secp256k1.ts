import { secp256k1 } from '@noble/curves/secp256k1'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { sha256 } from '@noble/hashes/sha256'

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

/**
 * Signs a message using secp256k1 elliptic curve
 * 
 * @param message - The message to sign as a string or Uint8Array
 * @param keyPrivate - The private key as a hex string
 * @param options - Options for signature generation
 * @returns The signature as a hex string
 */
export function signMessage(message: string | Uint8Array, keyPrivate: string, options: { hash?: boolean } = {}): string {
  const { hash = true } = options
  
  // Convert private key from hex string to Uint8Array
  const keyPrivateBytes = hexToBytes(keyPrivate)
  
  // Convert message to Uint8Array if it's a string
  let messageBytes = typeof message === 'string' 
    ? new TextEncoder().encode(message) 
    : message
  
  // Hash the message with SHA-256 if hash option is true
  if (hash) {
    messageBytes = sha256(messageBytes)
  }
  
  // Sign the message
  const signature = secp256k1.sign(messageBytes, keyPrivateBytes)
  
  // Return hex string
  return signature.toCompactHex()
}

/**
 * Verifies a signature using secp256k1 elliptic curve
 * 
 * @param message - The original message as a string or Uint8Array
 * @param signature - The signature as a hex string
 * @param keyPublic - The public key as a hex string
 * @param options - Options for signature verification
 * @returns True if the signature is valid, false otherwise
 */
export function verifyMessage(
  message: string | Uint8Array, 
  signature: string, 
  keyPublic: string,
  options: { hash?: boolean } = {}
): boolean {
  const { hash = true } = options
  
  // Convert signature from hex string to signature object
  const signatureObj = secp256k1.Signature.fromCompact(hexToBytes(signature))
  
  // Convert public key from hex string to Uint8Array
  const keyPublicBytes = hexToBytes(keyPublic)
  
  // Convert message to Uint8Array if it's a string
  let messageBytes = typeof message === 'string' 
    ? new TextEncoder().encode(message) 
    : message
  
  // Hash the message with SHA-256 if hash option is true
  if (hash) {
    messageBytes = sha256(messageBytes)
  }
  
  // Verify the signature
  return secp256k1.verify(signatureObj, messageBytes, keyPublicBytes)
}