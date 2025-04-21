import { base58 } from '@scure/base'
import { hexToBytes } from '@noble/hashes/utils'
import { generateKeyPublic as getKeyPublic } from '../utils/ed25519'
import { solanaSignMessage, solanaVerifyMessage } from '../utils/ed25519-chains'
import type { Curve, Options, BlockchainImplementation, KeyOptions } from '../types'
import { BIP44 } from '../utils/bip44'

/**
 * Solana blockchain implementation
 * 
 * @param options - Optional configuration parameters
 * @param options.network - Network to use (mainnet, testnet, etc.)
 * @returns An object implementing the Blockchain interface for Solana
 */
export default function solana(options?: Options) {
  const name = "solana";
  const curve: Curve = "ed25519";
  const network = options?.network || 'mainnet';
  const bip44 = BIP44.SOLANA;
  
  /**
   * Get Solana address from public key
   * Solana addresses are just the base58-encoded public key
   * The address format is the same for both mainnet and testnet
   * 
   * @param keyPublic - The public key as a hex string
   * @returns Solana address (base58 encoded public key)
   */
  function getAddress(keyPublic: string): string {
    // For Solana, the address is the same as the public key
    // We just need to convert from hex to base58
    const keyBytes = hexToBytes(keyPublic)
    return base58.encode(keyBytes)
  }

  /**
   * Validate a Solana address
   * Solana addresses are base58-encoded 32-byte Ed25519 public keys
   * The validation is the same for both mainnet and testnet
   * 
   * @param address - The address to validate
   * @returns Whether the address is valid
   */
  function validateAddress(address: string): boolean {
    try {
      // Try to decode as base58
      const decoded = base58.decode(address)
      // Solana addresses are 32 bytes (Ed25519 public key)
      return decoded.length === 32
    } catch {
      return false
    }
  }

  /**
   * Signs a message using Ed25519 for Solana
   * 
   * @param message - The message to sign
   * @param keyPrivate - The private key
   * @param options - Optional parameters
   * @returns The signature as a hex string
   */
  function signMessage(message: string | Uint8Array, keyPrivate: string, _options?: KeyOptions): string {
    return solanaSignMessage(message, keyPrivate);
  }

  /**
   * Verifies a message signature for Solana
   * 
   * @param message - The original message
   * @param signature - The signature to verify
   * @param keyPublic - The public key
   * @param options - Optional parameters
   * @returns Whether the signature is valid
   */
  function verifyMessage(message: string | Uint8Array, signature: string, keyPublic: string, _options?: KeyOptions): boolean {
    return solanaVerifyMessage(message, signature, keyPublic);
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