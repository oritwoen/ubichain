import { createEVMBlockchain } from '../utils/evm'

/**
 * Base blockchain implementation
 * Uses the EVM implementation for address generation and validation
 * Base is an L2 solution for Ethereum that uses the same address format
 * 
 * @returns An object implementing the Blockchain interface for Base
 */
export default function base() {
  return createEVMBlockchain("base")
}