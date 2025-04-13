import { sha3_256 } from '@noble/hashes/sha3'
import { hexToBytes, bytesToHex } from '@noble/hashes/utils'
import { generateKeyPublic } from '../utils/ed25519'
import type { Curve } from '../types'

export default function aptos() {
  const name = "aptos";
  const curve: Curve = "ed25519";
  
  /**
   * Generate Aptos address from public key
   * Aptos address is the 32-byte SHA3-256 hash of the public key concatenated with a single byte 0x00
   * 
   * @param keyPublic - The public key as a hex string
   * @returns Aptos address (hex string)
   */
  function generateAddress(keyPublic: string): string {
    // Convert hex public key to bytes
    const keyPublicBytes = hexToBytes(keyPublic)
    
    // Concatenate with scheme identifier byte (0x00 for single Ed25519)
    const dataToHash = new Uint8Array(keyPublicBytes.length + 1)
    dataToHash.set(keyPublicBytes)
    dataToHash[keyPublicBytes.length] = 0x00 // Single signer scheme identifier
    
    // Hash with SHA3-256
    const addressBytes = sha3_256(dataToHash)
    
    // Return as hex string with 0x prefix
    return '0x' + bytesToHex(addressBytes)
  }

  /**
   * Validate an Aptos address
   * Aptos addresses are hex-encoded 32-byte values starting with '0x'
   * 
   * @param address - The address to validate
   * @returns Whether the address is valid
   */
  function validateAddress(address: string): boolean {
    try {
      // Check if the address starts with '0x'
      if (!address.startsWith('0x')) {
        return false
      }
      
      // Remove the '0x' prefix and check if it's a valid hex string
      const addressHex = address.slice(2)
      if (!/^[0-9a-f]{64}$/i.test(addressHex)) {
        return false
      }
      
      return true
    } catch (error) {
      return false
    }
  }

  return {
    name,
    curve,
    generateKeyPublic,
    generateAddress,
    validateAddress,
  }
}