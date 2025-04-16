import { createEVMBlockchain } from '../utils/evm'
import type { Options, BlockchainImplementation } from '../types'
import { BIP44 } from '../utils/bip44'

/**
 * Ethereum blockchain implementation
 * Uses the EVM implementation for address generation and validation
 * 
 * @param options - Optional configuration parameters
 * @param options.network - Network to use (mainnet, testnet, etc.)
 * @returns An object implementing the Blockchain interface for Ethereum
 */
export default function ethereum(options?: Options) {
  const name = "ethereum";
  const bip44 = BIP44.ETHEREUM;
  const network = options?.network || 'mainnet';
  
  return createEVMBlockchain(name, {
    network,
    bip44
  }) satisfies BlockchainImplementation;
}