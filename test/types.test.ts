import { describe, it, expect } from 'vitest'
import type { Blockchain, BlockchainResponse } from '../src/types'

// Helper function to check proper implementation of interfaces
function isBlockchain(obj: any): obj is Blockchain {
  return (
    typeof obj.name === 'string' &&
    (typeof obj.curve === 'string' || Array.isArray(obj.curve)) &&
    typeof obj.getKeyPublic === 'function' &&
    typeof obj.getAddress === 'function' &&
    (obj.validateAddress === undefined || typeof obj.validateAddress === 'function')
  )
}

function isBlockchainResponse(obj: any): obj is BlockchainResponse {
  return (
    typeof obj.name === 'string' &&
    (typeof obj.curve === 'string' || Array.isArray(obj.curve)) &&
    typeof obj.generateKeyPrivate === 'function' &&
    typeof obj.getKeyPublic === 'function' &&
    typeof obj.getAddress === 'function' &&
    (obj.validateAddress === undefined || typeof obj.validateAddress === 'function')
  )
}

describe('Types', () => {
  describe('Blockchain interface', () => {
    it('should detect valid Blockchain implementation', () => {
      const validBlockchain = {
        name: 'test-chain',
        curve: 'secp256k1',
        getKeyPublic: (keyPrivate: string) => `pub-${keyPrivate}`,
        getAddress: (keyPublic: string) => `addr-${keyPublic}`
      }
      
      expect(isBlockchain(validBlockchain)).toBe(true)
    })
    
    it('should detect valid Blockchain implementation with validateAddress', () => {
      const validBlockchain = {
        name: 'test-chain',
        curve: 'secp256k1',
        getKeyPublic: (keyPrivate: string) => `pub-${keyPrivate}`,
        getAddress: (keyPublic: string) => `addr-${keyPublic}`,
        validateAddress: (address: string) => address.startsWith('addr-')
      }
      
      expect(isBlockchain(validBlockchain)).toBe(true)
    })
    
    it('should reject invalid Blockchain implementations', () => {
      const missingName = {
        getKeyPublic: (keyPrivate: string) => `pub-${keyPrivate}`,
        getAddress: (keyPublic: string) => `addr-${keyPublic}`
      }
      
      const missingGenerateKeyPublic = {
        name: 'test-chain',
        getAddress: (keyPublic: string) => `addr-${keyPublic}`
      }
      
      const missingGenerateAddress = {
        name: 'test-chain',
        getKeyPublic: (keyPrivate: string) => `pub-${keyPrivate}`
      }
      
      const validateAddressWrongType = {
        name: 'test-chain',
        getKeyPublic: (keyPrivate: string) => `pub-${keyPrivate}`,
        getAddress: (keyPublic: string) => `addr-${keyPublic}`,
        validateAddress: 'not-a-function'
      }
      
      expect(isBlockchain(missingName)).toBe(false)
      expect(isBlockchain(missingGenerateKeyPublic)).toBe(false)
      expect(isBlockchain(missingGenerateAddress)).toBe(false)
      expect(isBlockchain(validateAddressWrongType)).toBe(false)
    })
  })
  
  describe('BlockchainResponse interface', () => {
    it('should detect valid BlockchainResponse implementation', () => {
      const validResponse = {
        name: 'test-chain',
        curve: 'secp256k1',
        generateKeyPrivate: () => 'priv-key',
        getKeyPublic: (keyPrivate: string) => `pub-${keyPrivate}`,
        getAddress: (keyPublic: string) => `addr-${keyPublic}`
      }
      
      expect(isBlockchainResponse(validResponse)).toBe(true)
      
      // Create an instance that looks like the interface to test type safety
      const usedResponse: BlockchainResponse = {
        name: 'test-chain-2',
        curve: 'ed25519',
        generateKeyPrivate: () => 'private-key',
        getKeyPublic: (keyPrivate: string) => `public-${keyPrivate}`, 
        getAddress: (keyPublic: string) => `address-${keyPublic}`,
        validateAddress: (address: string) => address.startsWith('address-')
      }
      
      expect(usedResponse.name).toBe('test-chain-2')
      expect(usedResponse.generateKeyPrivate()).toBe('private-key')
      expect(usedResponse.getKeyPublic('test')).toBe('public-test')
      expect(usedResponse.getAddress('pub-key')).toBe('address-pub-key')
      expect(usedResponse.validateAddress?.('address-xyz')).toBe(true)
      expect(usedResponse.validateAddress?.('invalid')).toBe(false)
    })
    
    it('should detect valid BlockchainResponse with validateAddress', () => {
      const validResponse = {
        name: 'test-chain',
        curve: 'secp256k1',
        generateKeyPrivate: () => 'priv-key',
        getKeyPublic: (keyPrivate: string) => `pub-${keyPrivate}`,
        getAddress: (keyPublic: string) => `addr-${keyPublic}`,
        validateAddress: (address: string) => address.startsWith('addr-')
      }
      
      expect(isBlockchainResponse(validResponse)).toBe(true)
    })
    
    it('should reject invalid BlockchainResponse implementations', () => {
      const missingName = {
        generateKeyPrivate: () => 'priv-key',
        getKeyPublic: (keyPrivate: string) => `pub-${keyPrivate}`,
        getAddress: (keyPublic: string) => `addr-${keyPublic}`
      }
      
      const missingGenerateKeyPrivate = {
        name: 'test-chain',
        getKeyPublic: (keyPrivate: string) => `pub-${keyPrivate}`,
        getAddress: (keyPublic: string) => `addr-${keyPublic}`
      }
      
      const missingGenerateKeyPublic = {
        name: 'test-chain',
        generateKeyPrivate: () => 'priv-key',
        getAddress: (keyPublic: string) => `addr-${keyPublic}`
      }
      
      const missingGenerateAddress = {
        name: 'test-chain',
        generateKeyPrivate: () => 'priv-key',
        getKeyPublic: (keyPrivate: string) => `pub-${keyPrivate}`
      }
      
      expect(isBlockchainResponse(missingName)).toBe(false)
      expect(isBlockchainResponse(missingGenerateKeyPrivate)).toBe(false)
      expect(isBlockchainResponse(missingGenerateKeyPublic)).toBe(false)
      expect(isBlockchainResponse(missingGenerateAddress)).toBe(false)
    })
  })
})