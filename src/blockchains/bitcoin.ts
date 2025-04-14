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
   * - 'segwit' - addresses starting with 'bc1q' with short data (bech32, v0, P2WPKH)
   * - 'p2wsh' - addresses starting with 'bc1q' with longer data (bech32, v0, P2WSH)
   * - 'taproot' - addresses starting with 'bc1p' (bech32m, v1, Taproot)
   * 
   * @param keyPublic - The public key as a hex string
   * @param type - Address type (legacy, p2sh, segwit, p2wsh, or taproot)
   * @returns Bitcoin address
   */
  function getAddress(keyPublic: string, type?: string): string {
    // Check for taproot address type (SegWit v1, bech32m)
    if (type === 'taproot') {
      // Bitcoin mainnet bech32m prefix is 'bc' and witness version is 1
      return generateAddressSegWit(keyPublic, { hrp: 'bc', witnessVersion: 1 })
    }
    
    // Check for p2wsh address type (SegWit v0 P2WSH)
    if (type === 'p2wsh') {
      // Bitcoin mainnet bech32 prefix is 'bc' and witness version is 0
      return generateAddressSegWit(keyPublic, { hrp: 'bc', witnessVersion: 0 }, 'p2wsh')
    }
    
    // Check for segwit address type (bech32, v0, P2WPKH)
    if (type === 'segwit') {
      // Bitcoin mainnet bech32 prefix is 'bc' and witness version is 0
      return generateAddressSegWit(keyPublic, { hrp: 'bc', witnessVersion: 0 }, 'p2wpkh')
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
   * - SegWit v0 P2WPKH (bech32) addresses starting with 'bc1q' (20-byte program)
   * - SegWit v0 P2WSH (bech32) addresses starting with 'bc1q' (32-byte program)
   * - SegWit v1 (bech32m) addresses starting with 'bc1p' (Taproot)
   * 
   * @param address - The address to validate
   * @returns Whether the address is valid
   */
  function validateAddress(address: string): boolean {
    // Check for SegWit address
    if (address.startsWith('bc1')) {
      // Taproot addresses typically start with 'bc1p' (specific to witness v1)
      if (address.startsWith('bc1p')) {
        return validateAddressSegWit(address, { hrp: 'bc', witnessVersion: 1 })
      }
      // Handle typical v0 SegWit addresses (bech32)
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
