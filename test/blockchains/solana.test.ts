import { expect, describe, it } from 'vitest'
import solana from '../../src/blockchains/solana'
import { useBlockchain } from '../../src/blockchain'
import type { Options } from '../../src/types'

describe('Solana Blockchain', () => {
  describe('Mainnet', () => {
    const blockchain = useBlockchain(solana())
  
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
  it('generates a valid Solana address from a public key', () => {
    const keyPrivate = '0000000000000000000000000000000000000000000000000000000000000001'
    const keyPublic = blockchain.getKeyPublic(keyPrivate)
    const address = blockchain.getAddress(keyPublic)
    
    expect(address).toBeDefined()
    expect(blockchain.validateAddress?.(address)).toBe(true)
  })
  
  // Test address validation
  it('validates Solana addresses correctly', () => {
    // Use the address generated in the previous test
    const keyPrivate = '0000000000000000000000000000000000000000000000000000000000000001'
    const keyPublic = blockchain.getKeyPublic(keyPrivate)
    const validAddress = blockchain.getAddress(keyPublic)
    
    expect(blockchain.validateAddress?.(validAddress)).toBe(true)
    
    // Invalid addresses
    expect(blockchain.validateAddress?.('not-a-valid-address')).toBe(false)
    expect(blockchain.validateAddress?.('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(false) // Bitcoin address
    expect(blockchain.validateAddress?.('')).toBe(false)
  })
  })
  
  describe('Testnet', () => {
    const options: Options = { network: 'testnet' };
    const testnetBlockchain = useBlockchain(solana(options));
    
    describe('blockchain interface', () => {
      it('has correct name', () => {
        expect(testnetBlockchain.name).toBe('solana')
      })
      
      it('uses Ed25519 curve', () => {
        expect(testnetBlockchain.curve).toBe('ed25519')
      })
      
      it('has network property set to testnet', () => {
        expect(testnetBlockchain.network).toBe('testnet')
      })
    })
    
    describe('address generation', () => {
      it('generates identical addresses for testnet and mainnet', () => {
        // Solana uses the same address format for both networks
        const mainnetBlockchain = useBlockchain(solana())
        const keyPrivate = '0000000000000000000000000000000000000000000000000000000000000001'
        
        const testnetPublicKey = testnetBlockchain.getKeyPublic(keyPrivate)
        const mainnetPublicKey = mainnetBlockchain.getKeyPublic(keyPrivate)
        
        // Public keys should be identical
        expect(testnetPublicKey).toBe(mainnetPublicKey)
        
        // Addresses should be identical
        const testnetAddress = testnetBlockchain.getAddress(testnetPublicKey)
        const mainnetAddress = mainnetBlockchain.getAddress(mainnetPublicKey)
        
        expect(testnetAddress).toBe(mainnetAddress)
        expect(testnetBlockchain.validateAddress?.(testnetAddress)).toBe(true)
      })
    })
  })
})