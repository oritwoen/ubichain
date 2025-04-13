import { sha3_256 } from '@noble/hashes/sha3'
import { hexToBytes } from '@noble/hashes/utils'
import { generateKeyPublic as getKeyPublic } from '../utils/ed25519'
import { validateAddressHex, addSchemeByte, createPrefixedAddress } from '../utils/address'
import type { Curve } from '../types'

export default function aptos() {
  const name = "aptos";
  const curve: Curve = "ed25519";
  
  /**
   * Get Aptos address from public key
   * Aptos address is the 32-byte SHA3-256 hash of the public key concatenated with a single byte 0x00
   * 
   * @param keyPublic - The public key as a hex string
   * @returns Aptos address (hex string)
   */
  function getAddress(keyPublic: string): string {
    // Convert hex public key to bytes
    const keyPublicBytes = hexToBytes(keyPublic)
    
    // Concatenate with scheme identifier byte (0x00 for single Ed25519)
    const dataToHash = addSchemeByte(keyPublicBytes, 0x00, false)
    
    // Hash with SHA3-256
    const addressBytes = sha3_256(dataToHash)
    
    // Return as hex string with 0x prefix
    return createPrefixedAddress(addressBytes)
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
      return validateAddressHex(address, {
        prefix: '0x',
        length: 64,
        caseSensitive: false
      });
    } catch (error) {
      return false
    }
  }

  return {
    name,
    curve,
    getKeyPublic,
    getAddress,
    validateAddress,
  }
}