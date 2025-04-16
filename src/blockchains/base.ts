import { createEVMBlockchain } from '../utils/evm'
import type { Options, BlockchainImplementation } from '../types'
import { BIP44 } from '../utils/bip44'

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
  const name = "base";
  const bip44 = BIP44.ETHEREUM; // Base uses Ethereum's coin type as an L2
  const network = options?.network || 'mainnet';
  
  return createEVMBlockchain(name, {
    network,
    bip44
  }) satisfies BlockchainImplementation;
}