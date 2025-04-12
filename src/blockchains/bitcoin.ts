import { generateKeyPublic } from '../utils/secp256k1'
import { 
  generateAddressLegacy, validateAddressLegacy,
  generateAddressP2SH, validateAddressP2SH
} from '../utils/address'

export default function bitcoin () {
  const name = "bitcoin";
  
  /**
   * Generate Bitcoin address from public key
   * Supports following formats:
   * - 'legacy' (P2PKH) - addresses starting with '1'
   * - 'p2sh' - addresses starting with '3'
   * 
   * @param keyPublic - The public key as a hex string
   * @param type - Address type (legacy or p2sh)
   * @returns Bitcoin address
   */
  function generateAddress(keyPublic: string, type?: string): string {
    if (type) {
      console.log(`Generating Bitcoin ${type} address...`)
    } else {
      console.log('Generating Bitcoin address...')
    }
    
    // Explicitly check if type is exactly 'p2sh'
    if (type === 'p2sh') {
      // Bitcoin mainnet P2SH version byte is 0x05
      return generateAddressP2SH(keyPublic, { bytesVersion: 0x05 })
    }
    
    // Default to legacy (P2PKH)
    // Bitcoin mainnet P2PKH version byte is 0x00
    return generateAddressLegacy(keyPublic, { bytesVersion: 0x00 })
  }

  /**
   * Validate a Bitcoin address
   * Supports:
   * - Legacy (P2PKH) addresses starting with '1'
   * - P2SH addresses starting with '3'
   * 
   * @param address - The address to validate
   * @returns Whether the address is valid
   */
  function validateAddress(address: string): boolean {
    // Simple prefix check to determine address type
    if (address.startsWith('3')) {
      // Bitcoin mainnet P2SH version byte is 0x05
      return validateAddressP2SH(address, { bytesVersion: 0x05 })
    }
    
    // Default to legacy (P2PKH)
    // Bitcoin mainnet P2PKH version byte is 0x00
    return validateAddressLegacy(address, { bytesVersion: 0x00 })
  }

  return {
    name,
    generateKeyPublic,
    generateAddress,
    validateAddress,
  }
}
