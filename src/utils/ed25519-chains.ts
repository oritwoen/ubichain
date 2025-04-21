import { ed25519 } from '@noble/curves/ed25519'
import { hexToBytes, bytesToHex } from '@noble/hashes/utils'
import { signMessage, verifyMessage } from './signing'
import type { KeyOptions } from '../types'

/**
 * Signs a message using Ed25519 for Ed25519-based blockchains
 * 
 * @param message - The message to sign
 * @param keyPrivate - The private key
 * @param options - Optional parameters
 * @returns The signature as a hex string
 */
export function ed25519SignMessage(message: string | Uint8Array, keyPrivate: string, options: KeyOptions = {}): string {
  // Ed25519 signatures are simpler than EVM signatures because they don't use a preamble
  // We just directly sign the message with the Ed25519 curve
  return signMessage(message, keyPrivate, {
    curve: 'ed25519',
    ...options
  });
}

/**
 * Verifies a signature for Ed25519-based blockchains
 * 
 * @param message - The original message
 * @param signature - The signature to verify
 * @param keyPublic - The public key
 * @param options - Optional parameters
 * @returns Whether the signature is valid
 */
export function ed25519VerifyMessage(message: string | Uint8Array, signature: string, keyPublic: string, options: KeyOptions = {}): boolean {
  // Just directly verify the signature with the Ed25519 curve
  return verifyMessage(message, signature, keyPublic, {
    curve: 'ed25519',
    ...options
  });
}

/**
 * Signs a message using native Ed25519 for Solana
 * This method creates Solana-compatible signatures for explorers
 * 
 * @param message - The message to sign
 * @param keyPrivate - The private key
 * @returns The signature as a hex string
 */
export function solanaSignMessage(message: string | Uint8Array, keyPrivate: string): string {
  // Convert message to Uint8Array if it's a string
  const messageBytes = typeof message === 'string' 
    ? new TextEncoder().encode(message) 
    : message;
  
  // Convert private key from hex string to Uint8Array
  const keyPrivateBytes = hexToBytes(keyPrivate);
  
  // For Solana, we sign the raw message without any preamble or hashing
  const signature = ed25519.sign(messageBytes, keyPrivateBytes);
  
  // Return hex string
  return bytesToHex(signature);
}

/**
 * Verifies a Solana signature
 * 
 * @param message - The original message
 * @param signature - The signature to verify
 * @param keyPublic - The public key
 * @returns Whether the signature is valid
 */
export function solanaVerifyMessage(message: string | Uint8Array, signature: string, keyPublic: string): boolean {
  // Convert message to Uint8Array if it's a string
  const messageBytes = typeof message === 'string' 
    ? new TextEncoder().encode(message) 
    : message;
  
  // Convert signature and public key from hex strings to Uint8Array
  const signatureBytes = hexToBytes(signature);
  const keyPublicBytes = hexToBytes(keyPublic);
  
  // Verify the signature
  return ed25519.verify(signatureBytes, messageBytes, keyPublicBytes);
}