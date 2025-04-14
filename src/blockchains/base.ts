import { createEVMBlockchain } from '../utils/evm'
import type { Options, BlockchainImplementation } from '../types'

/**
 * Base blockchain implementation
 * Uses the EVM implementation for address generation and validation
 * Base is an L2 solution for Ethereum that uses the same address format
 * 
 * @param options - Optional configuration parameters
 * @param options.network - Network to use (mainnet, testnet, etc.)
 * @returns An object implementing the Blockchain interface for Base
 */
export default function base(options?: Options) {
  return createEVMBlockchain("base", options) satisfies BlockchainImplementation;
}