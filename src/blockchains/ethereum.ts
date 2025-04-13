import { createEVMBlockchain } from '../utils/evm'

/**
 * Ethereum blockchain implementation
 * Uses the EVM implementation for address generation and validation
 * 
 * @returns An object implementing the Blockchain interface for Ethereum
 */
export default function ethereum() {
  return createEVMBlockchain("ethereum")
}