import { ed25519 } from '@noble/curves/ed25519'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'

/**
 * Generates a public key from a private key using Ed25519 elliptic curve
 * Used by Solana, Aptos and other blockchains
 * 
 * @param keyPrivate - The private key as a hex string
 * @returns The public key as a hex string
 */
export function generateKeyPublic(keyPrivate: string): string {
  const keyPrivateBytes = hexToBytes(keyPrivate)
  const keyPublic = ed25519.getPublicKey(keyPrivateBytes)
  return bytesToHex(keyPublic)
}