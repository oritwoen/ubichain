import { generateKeyPublic as getKeyPublic } from '../utils/secp256k1'
import { 
  generateAddressLegacy, validateAddressLegacy,
  generateAddressP2SH, validateAddressP2SH,
  generateAddressSegWit, validateAddressSegWit
} from '../utils/address'
import type { Curve } from '../types'

export default function bitcoin () {
  const name = "bitcoin";
  const curve: Curve = "secp256k1";
  
  /**
   * Get Bitcoin address from public key
   * Supports following formats:
   * - 'legacy' (P2PKH) - addresses starting with '1'
   * - 'p2sh' - addresses starting with '3'
   * - 'segwit' - addresses starting with 'bc1' (bech32)
   * 
   * @param keyPublic - The public key as a hex string
   * @param type - Address type (legacy, p2sh, or segwit)
   * @returns Bitcoin address
   */
  function getAddress(keyPublic: string, type?: string): string {
    // Check for segwit address type
    if (type === 'segwit') {
      // Bitcoin mainnet bech32 prefix is 'bc' and witness version is 0
      return generateAddressSegWit(keyPublic, { hrp: 'bc', witnessVersion: 0 })
    }
    
    // Check for p2sh address type
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
   * - SegWit (bech32) addresses starting with 'bc1'
   * 
   * @param address - The address to validate
   * @returns Whether the address is valid
   */
  function validateAddress(address: string): boolean {
    // Check for SegWit bech32 address
    if (address.startsWith('bc1')) {
      return validateAddressSegWit(address, { hrp: 'bc', witnessVersion: 0 })
    }
    
    // Check for P2SH address
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
    curve,
    getKeyPublic,
    getAddress,
    validateAddress,
  }
}
