import type { Blockchain, BlockchainResponse } from "./types"
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

  const response: BlockchainResponse = {
    name: blockchain.name,
    curve: blockchain.curve,
    generateKeyPrivate,
    getKeyPublic: (keyPrivate, options) => blockchain.getKeyPublic(keyPrivate, options),
    getAddress: (keyPublic, type) => blockchain.getAddress(keyPublic, type)
  }
  
  // Add address validation if blockchain implements it
  if (blockchain.validateAddress) {
    response.validateAddress = (address) => blockchain.validateAddress!(address)
  }

  return response
}
