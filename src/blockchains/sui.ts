import { base58 } from '@scure/base'
import { blake2b } from '@noble/hashes/blake2b'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { generateKeyPublic as generateEd25519KeyPublic } from '../utils/ed25519'
import { generateKeyPublic as generateSecp256k1KeyPublic } from '../utils/secp256k1'
import type { Curve } from '../types'

export default function sui() {
  const name = "sui";
  const curve: Curve[] = ["ed25519", "secp256k1"];
  
  /**
   * Flag bytes for different signature schemes in Sui
   */
  const SIGNATURE_SCHEME_FLAGS = {
    ED25519: 0x00,
    SECP256K1: 0x01,
    SECP256R1: 0x02,
    MULTISIG: 0x03
  };

  /**
   * Generate Sui public key with specified scheme (defaults to Ed25519)
   * 
   * @param keyPrivate - The private key as a hex string
   * @param scheme - Signature scheme (ed25519, secp256k1)
   * @returns Public key as hex string
   */
  function generateKeyPublic(keyPrivate: string, scheme: string = 'ed25519'): string {
    if (scheme.toLowerCase() === 'secp256k1') {
      return generateSecp256k1KeyPublic(keyPrivate, { compressed: true })
    }
    
    // Default to Ed25519
    return generateEd25519KeyPublic(keyPrivate)
  }
  
  /**
   * Generate Sui address from public key
   * Sui address is derived by hashing signature scheme flag + public key bytes using BLAKE2b
   * 
   * @param keyPublic - The public key as a hex string
   * @param scheme - Signature scheme (ed25519, secp256k1)
   * @returns Sui address (base58 encoded BLAKE2b hash)
   */
  function generateAddress(keyPublic: string, scheme: string = 'ed25519'): string {
    // Convert public key to bytes
    const keyPublicBytes = hexToBytes(keyPublic)
    
    // Determine flag byte based on scheme
    let flagByte: number
    if (scheme.toLowerCase() === 'secp256k1') {
      flagByte = SIGNATURE_SCHEME_FLAGS.SECP256K1
    } else {
      // Default to Ed25519
      flagByte = SIGNATURE_SCHEME_FLAGS.ED25519
    }
    
    // Create input for hashing: flag byte + public key
    const input = new Uint8Array(keyPublicBytes.length + 1)
    input[0] = flagByte
    input.set(keyPublicBytes, 1)
    
    // Hash with BLAKE2b-256
    const hash = blake2b(input, { dkLen: 32 }) // 32 bytes = 256 bits
    
    // Sui address is just the hex representation of the hash
    return '0x' + bytesToHex(hash)
  }

  /**
   * Validate a Sui address
   * Valid Sui addresses:
   * - Start with '0x'
   * - Are 66 characters long (0x + 64 hex chars)
   * - Contain only valid hex characters
   * 
   * @param address - The address to validate
   * @returns Whether the address is valid
   */
  function validateAddress(address: string): boolean {
    if (!address.startsWith('0x')) {
      return false
    }
    
    // Remove '0x' prefix
    const addressWithoutPrefix = address.slice(2)
    
    // Check if it's 32 bytes (64 hex chars)
    if (addressWithoutPrefix.length !== 64) {
      return false
    }
    
    // Check if it's valid hex
    const hexRegex = /^[0-9a-fA-F]+$/
    return hexRegex.test(addressWithoutPrefix)
  }

  return {
    name,
    curve,
    generateKeyPublic,
    generateAddress,
    validateAddress,
  }
}