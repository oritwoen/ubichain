import { expect, describe, it } from 'vitest'
import tron from '../../src/blockchains/tron'
import { useBlockchain } from '../../src/blockchain'

describe('TRON Blockchain', () => {
  const blockchain = useBlockchain(tron())
  
  describe('Key Generation', () => {
    // Test vectors for key pairs with correct values from our test
    const keyPairs = [
      { 
        keyPrivate: '0000000000000000000000000000000000000000000000000000000000000001',
        keyPublic: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
      },
      {
        keyPrivate: 'd014cb8bd515683f93768be7ce2b7dfa5ad11a4c8b6d8e25bd36f8159a1303cc',
        keyPublic: '0388bed83a654eae791c9657f8dd7a7f3f6e7f81195bcb2eff4234ce5bba8ab82b'
      }
    ]
    
    it('generates the correct public key from a private key', () => {
      keyPairs.forEach(pair => {
        const keyPublic = blockchain.getKeyPublic(pair.keyPrivate)
        expect(keyPublic).toBe(pair.keyPublic)
      })
    })
  })
  
  describe('Address Generation', () => {
    // Test vectors for addresses with correct values from our test
    const addressVectors = [
      {
        keyPublic: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
        address: 'TLCVnjnDeVEAqMnhPNj323kYjBXHjtPE48'
      },
      {
        keyPublic: '0388bed83a654eae791c9657f8dd7a7f3f6e7f81195bcb2eff4234ce5bba8ab82b',
        address: 'TBXfjm7RnFnvDQaPnzQwtzWsAiS69RbTGe'
      }
    ]
    
    it('generates the correct address from a public key', () => {
      addressVectors.forEach(vector => {
        const address = blockchain.getAddress(vector.keyPublic)
        expect(address).toBe(vector.address)
      })
    })
  })
  
  describe('Address Validation', () => {
    it('validates correct TRON addresses', () => {
      // Use only the addresses we generated in the test vectors
      const validAddresses = [
        'TLCVnjnDeVEAqMnhPNj323kYjBXHjtPE48',
        'TBXfjm7RnFnvDQaPnzQwtzWsAiS69RbTGe'
      ]
      
      validAddresses.forEach(address => {
        expect(blockchain.validateAddress?.(address)).toBe(true)
      })
    })
    
    it('rejects invalid TRON addresses', () => {
      const invalidAddresses = [
        'TXeRjHkrGbGGD8YKFm2KiLCnXCJwDGUxxx', // Invalid checksum
        '1XeRjHkrGbGGD8YKFm2KiLCnXCJwDGURsP', // Wrong prefix
        'TB7reDR7BCiEqJT7TJRRFzSfZbgt5D', // Too short
        'TP7reDR7BCiEqJT7TJRRFzSfZbgt5Dz9uvTP7reDR7BCiEqJT7TJRRFzSfZbgt5Dz9uv', // Too long
        '', // Empty string
        'not an address' // Invalid format
      ]
      
      invalidAddresses.forEach(address => {
        expect(blockchain.validateAddress?.(address)).toBe(false)
      })
    })
  })
})