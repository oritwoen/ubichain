import { expect, describe, it } from 'vitest'
import aptos from '../../src/blockchains/aptos'
import { useBlockchain } from '../../src/blockchain'

describe('Aptos Blockchain', () => {
  const blockchain = useBlockchain(aptos())
  
  // Test private key generation
  it('generates a valid private key', () => {
    const keyPrivate = blockchain.generateKeyPrivate()
    
    expect(keyPrivate).toBeDefined()
    expect(keyPrivate.length).toBe(64) // 32 bytes as hex
    expect(/^[0-9a-f]{64}$/i.test(keyPrivate)).toBe(true)
  })
  
  // Test public key generation
  it('generates a valid public key from a private key', () => {
    const keyPrivate = '0000000000000000000000000000000000000000000000000000000000000001'
    const keyPublic = blockchain.getKeyPublic(keyPrivate)
    
    expect(keyPublic).toBeDefined()
    expect(/^[0-9a-f]+$/i.test(keyPublic)).toBe(true)
  })
  
  // Test address generation
  it('generates a valid Aptos address from a public key', () => {
    const keyPrivate = '0000000000000000000000000000000000000000000000000000000000000001'
    const keyPublic = blockchain.getKeyPublic(keyPrivate)
    const address = blockchain.getAddress(keyPublic)
    
    expect(address).toBeDefined()
    expect(address.startsWith('0x')).toBe(true)
    expect(blockchain.validateAddress?.(address)).toBe(true)
  })
  
  // Test address validation
  it('validates Aptos addresses correctly', () => {
    // Use the address generated in the previous test
    const keyPrivate = '0000000000000000000000000000000000000000000000000000000000000001'
    const keyPublic = blockchain.getKeyPublic(keyPrivate)
    const validAddress = blockchain.getAddress(keyPublic)
    
    expect(blockchain.validateAddress?.(validAddress)).toBe(true)
    
    // Invalid addresses
    expect(blockchain.validateAddress?.('not-a-valid-address')).toBe(false)
    expect(blockchain.validateAddress?.('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(false) // Bitcoin address
    expect(blockchain.validateAddress?.('0x1234')).toBe(false) // Too short
    expect(blockchain.validateAddress?.('')).toBe(false)
  })
})