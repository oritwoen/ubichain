import { generateKeyPublic as getKeyPublic } from '../utils/secp256k1'
import { 
  generateAddressLegacy, validateAddressLegacy,
  generateAddressP2SH, validateAddressP2SH,
  generateAddressSegWit, validateAddressSegWit
} from '../utils/address'
import { evmSignMessage, evmVerifyMessage } from '../utils/evm'
import type { Curve, Options, BlockchainImplementation, KeyOptions } from '../types'

// Define network parameters interface
type NetworkParams = {
  hrpSegWit: string;
  prefixSegWitV0: string;
  prefixSegWitV1: string;
  bytesVersionP2PKH: number;
  bytesVersionP2SH: number;
};

export default function bitcoin (options?: Options) {
  const name = "bitcoin";
  const curve: Curve = "secp256k1";
  const network = options?.network || 'mainnet';
  const bip44 = 0; // SLIP-0044 index for Bitcoin
  
  // Network-specific parameters for address generation and validation
  const networkParams: Record<string, NetworkParams> = {
    mainnet: {
      hrpSegWit: 'bc',
      prefixSegWitV0: 'bc1q',
      prefixSegWitV1: 'bc1p',
      bytesVersionP2PKH: 0x00,
      bytesVersionP2SH: 0x05
    },
    testnet: {
      hrpSegWit: 'tb',
      prefixSegWitV0: 'tb1q',
      prefixSegWitV1: 'tb1p',
      bytesVersionP2PKH: 0x6f, // 111 in decimal
      bytesVersionP2SH: 0xc4    // 196 in decimal
    }
  };
  
  // Get parameters for the current network
  const params = network === 'testnet' ? networkParams.testnet : networkParams.mainnet;
  
  /**
   * Get Bitcoin address from public key
   * Supports following formats:
   * - 'legacy' (P2PKH) - addresses starting with '1' (mainnet) or 'm'/'n' (testnet)
   * - 'p2sh' - addresses starting with '3' (mainnet) or '2' (testnet)
   * - 'segwit' - addresses starting with 'bc1q' (mainnet) or 'tb1q' (testnet) with short data (P2WPKH)
   * - 'p2wsh' - addresses starting with 'bc1q' (mainnet) or 'tb1q' (testnet) with longer data (P2WSH)
   * - 'taproot' - addresses starting with 'bc1p' (mainnet) or 'tb1p' (testnet) (SegWit v1)
   * 
   * @param keyPublic - The public key as a hex string
   * @param type - Address type (legacy, p2sh, segwit, p2wsh, or taproot)
   * @returns Bitcoin address
   */
  function getAddress(keyPublic: string, type = 'legacy'): string {
    const addressType = type;
    
    // Handle SegWit address types
    if (['segwit', 'p2wsh', 'taproot'].includes(addressType)) {
      const segwitOptions = { 
        hrp: params.hrpSegWit,
        witnessVersion: addressType === 'taproot' ? 1 : 0
      };
      
      const segwitType = addressType === 'p2wsh' ? 'p2wsh' : 'p2wpkh';
      return generateAddressSegWit(keyPublic, segwitOptions, segwitType);
    }
    
    // Handle P2SH address type
    if (addressType === 'p2sh') {
      return generateAddressP2SH(keyPublic, { 
        bytesVersion: params.bytesVersionP2SH 
      });
    }
    
    // Default to legacy (P2PKH)
    return generateAddressLegacy(keyPublic, { 
      bytesVersion: params.bytesVersionP2PKH 
    });
  }

  /**
   * Validate a Bitcoin address
   * Supports:
   * - Legacy (P2PKH) addresses starting with '1' (mainnet) or 'm'/'n' (testnet)
   * - P2SH addresses starting with '3' (mainnet) or '2' (testnet)
   * - SegWit v0 P2WPKH (bech32) addresses starting with 'bc1q' (mainnet) or 'tb1q' (testnet) with 20-byte program
   * - SegWit v0 P2WSH (bech32) addresses starting with 'bc1q' (mainnet) or 'tb1q' (testnet) with 32-byte program
   * - SegWit v1 (bech32m) addresses starting with 'bc1p' (mainnet) or 'tb1p' (testnet) (Taproot)
   * 
   * @param address - The address to validate
   * @returns Whether the address is valid
   */
  function validateAddress(address: string): boolean {
    // Check for SegWit addresses
    const hrpSegWit = params.hrpSegWit;
    const segwitPrefix = hrpSegWit + '1';
    
    if (address.startsWith(segwitPrefix)) {
      const prefixV1 = params.prefixSegWitV1;
      
      // Check for Taproot address (witness version 1)
      if (address.startsWith(prefixV1)) {
        return validateAddressSegWit(address, { hrp: hrpSegWit, witnessVersion: 1 });
      }
      
      // Handle SegWit v0 addresses (bech32)
      return validateAddressSegWit(address, { hrp: hrpSegWit, witnessVersion: 0 });
    }
    
    // For mainnet, look for '3' prefix for P2SH
    if (network === 'mainnet' && address.startsWith('3')) {
      return validateAddressP2SH(address, { bytesVersion: params.bytesVersionP2SH });
    }
    
    // For testnet, look for '2' prefix for P2SH
    if (network === 'testnet' && address.startsWith('2')) {
      return validateAddressP2SH(address, { bytesVersion: params.bytesVersionP2SH });
    }
    
    // For mainnet, legacy addresses start with '1'
    if (network === 'mainnet' && address.startsWith('1')) {
      return validateAddressLegacy(address, { bytesVersion: params.bytesVersionP2PKH });
    }
    
    // For testnet, legacy addresses start with 'm' or 'n'
    if (network === 'testnet' && (address.startsWith('m') || address.startsWith('n'))) {
      return validateAddressLegacy(address, { bytesVersion: params.bytesVersionP2PKH });
    }
    
    // If none of the above, address is invalid for the current network
    return false;
  }

  /**
   * Signs a message using secp256k1 for Bitcoin
   * 
   * @param message - The message to sign
   * @param keyPrivate - The private key
   * @param options - Optional parameters
   * @returns The signature as a hex string
   */
  function signMessage(message: string | Uint8Array, keyPrivate: string, options?: KeyOptions): string {
    return evmSignMessage(message, keyPrivate, options);
  }

  /**
   * Verifies a message signature for Bitcoin
   * 
   * @param message - The original message
   * @param signature - The signature to verify
   * @param keyPublic - The public key
   * @param options - Optional parameters
   * @returns Whether the signature is valid
   */
  function verifyMessage(message: string | Uint8Array, signature: string, keyPublic: string, options?: KeyOptions): boolean {
    return evmVerifyMessage(message, signature, keyPublic, options);
  }

  return {
    name,
    curve,
    network,
    bip44,
    getKeyPublic,
    getAddress,
    validateAddress,
    signMessage,
    verifyMessage
  } satisfies BlockchainImplementation;
}