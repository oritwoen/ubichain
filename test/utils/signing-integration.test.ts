import { describe, it, expect } from 'vitest'
import { Keypair } from '@solana/web3.js'
import { SigningKey, Wallet } from 'ethers'
import { hexToBytes, bytesToHex } from '@noble/hashes/utils'
import { useBlockchain } from '../../src/blockchain'
import ethereum from '../../src/blockchains/ethereum'
import solana from '../../src/blockchains/solana'
import { ed25519 } from '@noble/curves/ed25519'
import { 
  secp256k1TestVectors, 
  testMessages 
} from '../fixtures'

describe('Signing Integration Tests', () => {
  describe('Solana Signature Compatibility', () => {
    it('should generate compatible keys with @solana/web3.js', () => {
      // Generate keys using Solana Web3.js
      const solanaKeypair = Keypair.generate()
      const solanaSecretKey = solanaKeypair.secretKey
      const solanaPrivateKeyHex = bytesToHex(solanaSecretKey.slice(0, 32))
      const solanaPublicKeyHex = bytesToHex(solanaKeypair.publicKey.toBytes())
      
      // Create corresponding keys using ubichain
      const solanaBlockchain = useBlockchain(solana())
      const ubichainPublicKey = solanaBlockchain.getKeyPublic(solanaPrivateKeyHex)
      
      // Verify that public keys match
      expect(ubichainPublicKey).toBe(solanaPublicKeyHex)
      
      // Generate a new address
      const ubichainAddress = solanaBlockchain.getAddress(ubichainPublicKey)
      const solanaAddress = solanaKeypair.publicKey.toBase58()
      
      // Verify that addresses match
      expect(ubichainAddress).toBe(solanaAddress)
      
      // Print keys and addresses for confirmation
      console.log('\nSolana Keys:')
      console.log(`Private Key: ${solanaPrivateKeyHex}`)
      console.log(`Solana Public Key: ${solanaPublicKeyHex}`)
      console.log(`Ubichain Public Key: ${ubichainPublicKey}`)
      console.log(`Solana Address: ${solanaAddress}`)
      console.log(`Ubichain Address: ${ubichainAddress}`)
    })
    
    it('should produce valid signatures for Solana', () => {
      // Create new keys in ubichain
      const solanaBlockchain = useBlockchain(solana())
      const ubichainWallet = solanaBlockchain.generateWallet()
      
      // Sign message using ubichain
      const message = testMessages.medium
      const messageBytes = new TextEncoder().encode(message)
      const ubichainSignature = solanaBlockchain.signMessage(message, ubichainWallet.keys.private)
      const ubichainSignatureBytes = hexToBytes(ubichainSignature)
      
      // Verify signature using @noble/curves/ed25519 (the same library we use internally)
      const publicKeyBytes = hexToBytes(ubichainWallet.keys.public)
      
      // Verify using the library that we use internally
      const verificationResult = ed25519.verify(
        ubichainSignatureBytes,
        messageBytes,
        publicKeyBytes
      )
      
      // Sign message directly using the library
      const privateKeyBytes = hexToBytes(ubichainWallet.keys.private)
      const directSignature = ed25519.sign(messageBytes, privateKeyBytes)
      const directSignatureHex = bytesToHex(directSignature)
      
      // Display results
      console.log('\nSolana Signature Verification:')
      console.log(`Message: "${message}"`)
      console.log(`Ubichain Signature: ${ubichainSignature}`)
      console.log(`Direct Ed25519 Signature: ${directSignatureHex}`)
      console.log(`Noble Curves verification result: ${verificationResult}`)
      
      // Verify direct signature using ubichain
      const ubichainVerificationOfDirect = solanaBlockchain.verifyMessage(
        message, 
        directSignatureHex, 
        ubichainWallet.keys.public
      )
      
      console.log(`Ubichain verification of direct signature: ${ubichainVerificationOfDirect}`)
      
      // Check if verifications succeeded
      expect(verificationResult).toBe(true)
      expect(ubichainVerificationOfDirect).toBe(true)
      expect(ubichainSignature).toBe(directSignatureHex)
    })
  })
  
  describe('Ethereum Signature Compatibility', () => {
    it('should generate compatible keys with ethers.js', () => {
      // Create a private key with 0x prefix (required by ethers)
      const privateKeyHex = secp256k1TestVectors.privateKeyWith0x
      
      // Create instances of both libraries
      const ethersSigningKey = new SigningKey(privateKeyHex)
      const ethereumBlockchain = useBlockchain(ethereum())
      
      // Get public keys
      const ethersPublicKey = ethersSigningKey.publicKey.slice(2) // remove '0x' prefix
      const ubichainPublicKey = ethereumBlockchain.getKeyPublic(privateKeyHex.slice(2), { compressed: false })
      
      // Verify that public keys match (ethers returns without 0x)
      expect(ubichainPublicKey).toBe(ethersPublicKey)
      
      // Display information
      console.log('\nEthereum Keys:')
      console.log(`Private Key: ${privateKeyHex}`)
      console.log(`Ethers Public Key: ${ethersPublicKey}`)
      console.log(`Ubichain Public Key: ${ubichainPublicKey}`)
    })
    
    it('should verify messages between libraries', () => {
      // Private key
      const privateKeyHex = secp256k1TestVectors.privateKeyWith0x
      const _privateKeyNoPrefix = privateKeyHex.slice(2)
      
      // Create Ethereum instance
      const ethereumBlockchain = useBlockchain(ethereum())
      const wallet = ethereumBlockchain.generateWallet({ compressed: false })
      
      // Message to sign
      const message = testMessages.medium
      
      // Sign using ubichain
      const ubichainSignature = ethereumBlockchain.signMessage(message, wallet.keys.private)
      
      // Create ethers.js wallet
      const ethersWallet = new Wallet(privateKeyHex)
      
      // Compare addresses
      const ubichainAddress = wallet.address.toLowerCase()
      const ethersAddress = ethersWallet.address.toLowerCase()
      
      console.log('\nEthereum Addresses:')
      console.log(`Ubichain: ${ubichainAddress}`)
      console.log(`Ethers: ${ethersAddress}`)
      
      // Verify signature using ubichain
      const ubichainVerified = ethereumBlockchain.verifyMessage(
        message, 
        ubichainSignature, 
        wallet.keys.public
      )
      
      console.log('\nEthereum Signatures:')
      console.log(`Message: "${message}"`)
      console.log(`Ubichain Signature: ${ubichainSignature}`)
      console.log(`Verification result: ${ubichainVerified}`)
      
      // Check if verification succeeded
      expect(ubichainVerified).toBe(true)
    })
  })
})