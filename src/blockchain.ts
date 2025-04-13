import type { Blockchain, BlockchainResponse, Keys, Wallet } from "./types"
import { randomBytes } from 'node:crypto'
import { bytesToHex } from '@noble/hashes/utils'

/**
 * Creates and returns a interface using the specified blockchain.
 * This interface allows you to generate keys, addresses,
 * and sign transactions.
 *
 * @param {Blockchain} blockchain - The blockchain used to getters. See {@link Blockchain}.
 * @returns {BlockchainResponse} The blockchain interface that allows cryptocurrency operations.
 */

export function useBlockchain(blockchain: Blockchain): BlockchainResponse {
  /**
   * Generates a cryptographically secure random private key
   * Common implementation for all blockchains - 32 bytes (256 bits) 
   * represented as a 64-character hex string
   */
  function generateKeyPrivate(): string {
    // Generate 32 bytes (256 bits) of random data
    const keyPrivateBytes = randomBytes(32)
    
    // Convert to hex string
    return bytesToHex(keyPrivateBytes)
  }

  /**
   * Generates a key pair (private and public keys)
   * This is a convenience function that combines generateKeyPrivate and getKeyPublic
   * 
   * @param {Record<string, any>} options - Optional parameters for key generation
   * @returns {Keys} A pair of cryptographic keys
   */
  function generateKeys(options?: Record<string, any>): Keys {
    const privateKey = generateKeyPrivate()
    const publicKey = blockchain.getKeyPublic(privateKey, options)
    
    return {
      keys: {
        private: privateKey,
        public: publicKey
      }
    }
  }

  /**
   * Generates a complete wallet (private key, public key, and address)
   * This is a convenience function that combines generateKeys and getAddress
   * 
   * @param {Record<string, any>} options - Optional parameters for key generation
   * @param {string} addressType - Optional address type for blockchains with multiple address formats
   * @returns {Wallet} A complete wallet with keys and address
   */
  function generateWallet(options?: Record<string, any>, addressType?: string): Wallet {
    const keys = generateKeys(options)
    const address = blockchain.getAddress(keys.keys.public, addressType)
    
    return {
      ...keys,
      address
    }
  }

  const response: BlockchainResponse = {
    name: blockchain.name,
    curve: blockchain.curve,
    generateKeyPrivate,
    getKeyPublic: (keyPrivate, options) => blockchain.getKeyPublic(keyPrivate, options),
    getAddress: (keyPublic, type) => blockchain.getAddress(keyPublic, type),
    generateKeys,
    generateWallet
  }
  
  // Add address validation if blockchain implements it
  if (blockchain.validateAddress) {
    response.validateAddress = (address) => blockchain.validateAddress!(address)
  }

  return response
}
