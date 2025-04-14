import { createEVMBlockchain } from '../utils/evm'
import type { Options, BlockchainImplementation } from '../types'

/**
 * Ethereum blockchain implementation
 * Uses the EVM implementation for address generation and validation
 * 
 * @param options - Optional configuration parameters
 * @param options.network - Network to use (mainnet, testnet, etc.)
 * @returns An object implementing the Blockchain interface for Ethereum
 */
export default function ethereum(options?: Options) {
  return createEVMBlockchain("ethereum", options) satisfies BlockchainImplementation;
}