import type { Blockchain, BlockchainImplementation, Keys, Wallet, KeyOptions, AddressType } from "./types"
import { webcrypto } from 'node:crypto'
import { bytesToHex } from '@noble/hashes/utils'

/**
 * Creates and returns an interface using the specified blockchain implementation.
 * This interface allows you to generate keys, addresses,
 * and sign transactions.
 *
 * @param blockchain - The blockchain implementation with the basic required functions.
 * @returns The complete blockchain interface that allows cryptocurrency operations.
 */
export function useBlockchain(blockchain: BlockchainImplementation): Blockchain {
  /**
   * Generates a cryptographically secure random private key
   * Common implementation for all blockchains - 32 bytes (256 bits) 
   * represented as a 64-character hex string
   */
  function generateKeyPrivate(): string {
    // Generate 32 bytes (256 bits) of random data using Web Crypto API
    const keyPrivateBytes = webcrypto.getRandomValues(new Uint8Array(32))
    
    // Convert to hex string
    return bytesToHex(keyPrivateBytes)
  }

  /**
   * Generates a key pair (private and public keys)
   * This is a convenience function that combines generateKeyPrivate and getKeyPublic
   * 
   * @param options - Optional parameters for key generation
   * @returns A pair of cryptographic keys
   */
  function generateKeys(options?: KeyOptions): Keys {
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
   * @param options - Optional parameters for key generation
   * @param addressType - Optional address type for blockchains with multiple address formats
   * @returns A complete wallet with keys and address
   */
  function generateWallet(options?: KeyOptions, addressType?: AddressType): Wallet {
    const keys = generateKeys(options)
    const address = blockchain.getAddress(keys.keys.public, addressType)
    
    return {
      ...keys,
      address
    }
  }

  const response: Blockchain = {
    name: blockchain.name,
    curve: blockchain.curve,
    network: blockchain.network,
    bip44: blockchain.bip44,
    generateKeyPrivate,
    getKeyPublic: blockchain.getKeyPublic,
    getAddress: blockchain.getAddress,
    generateKeys,
    generateWallet
  }
  
  // Add address validation if blockchain implements it
  if (blockchain.validateAddress) {
    response.validateAddress = blockchain.validateAddress
  }

  return response satisfies Blockchain
}