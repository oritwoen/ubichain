import { describe, expect, it } from "vitest";
import { useBlockchain } from "../../src";
import bitcoin from "../../src/blockchains/bitcoin";

describe("Bitcoin blockchain", () => {
  const blockchain = useBlockchain(bitcoin());
  
  it("should have a name", () => {
    expect(blockchain.name).toBe("bitcoin");
  });
  
  it("should generate a private key", () => {
    const keyPrivate = blockchain.generateKeyPrivate();
    
    // Private key should be a 64-character hex string (32 bytes)
    expect(keyPrivate).toMatch(/^[0-9a-f]{64}$/);
  });
  
  it("should generate different private keys each time", () => {
    const keyPrivate1 = blockchain.generateKeyPrivate();
    const keyPrivate2 = blockchain.generateKeyPrivate();
    
    expect(keyPrivate1).not.toBe(keyPrivate2);
  });
  
  it("should generate a public key from a private key", () => {
    const keyPrivate = blockchain.generateKeyPrivate();
    const keyPublic = blockchain.getKeyPublic(keyPrivate);
    
    // Compressed public key should be a 66-character hex string (33 bytes)
    expect(keyPublic).toMatch(/^[0-9a-f]{66}$/);
    
    // Should start with 02 or 03 (compressed key)
    expect(keyPublic.startsWith('02') || keyPublic.startsWith('03')).toBe(true);
  });
  
  it("should generate an uncompressed public key", () => {
    const keyPrivate = blockchain.generateKeyPrivate();
    const keyPublic = blockchain.getKeyPublic(keyPrivate, { compressed: false });
    
    // Uncompressed public key should be a 130-character hex string (65 bytes)
    expect(keyPublic).toMatch(/^[0-9a-f]{130}$/);
    
    // Should start with 04 (uncompressed key)
    expect(keyPublic.startsWith('04')).toBe(true);
  });
  
  describe("Legacy addresses (P2PKH)", () => {
    it("should generate a legacy address from a public key", () => {
      const keyPrivate = blockchain.generateKeyPrivate();
      const keyPublic = blockchain.getKeyPublic(keyPrivate);
      const address = blockchain.getAddress(keyPublic, 'legacy');
      
      // Legacy address should start with 1
      expect(address.startsWith('1')).toBe(true);
      
      // Legacy address should be 26-35 characters
      expect(address.length).toBeGreaterThanOrEqual(26);
      expect(address.length).toBeLessThanOrEqual(35);
    });
    
    it("should validate a valid legacy address", () => {
      const keyPrivate = blockchain.generateKeyPrivate();
      const keyPublic = blockchain.getKeyPublic(keyPrivate);
      const address = blockchain.getAddress(keyPublic, 'legacy');
      
      expect(blockchain.validateAddress!(address)).toBe(true);
    });
    
    it("should reject an invalid legacy address", () => {
      // Invalid characters
      expect(blockchain.validateAddress!("1INVALID$ADDRESS")).toBe(false);
      
      // Legacy format but with invalid checksum
      expect(blockchain.validateAddress!("1BvBMSEYstWQtqTFn5Au4m4GFg7xJaNVN2")).toBe(false);
      
      // Too short
      expect(blockchain.validateAddress!("1Ax")).toBe(false);
    });
  });
  
  describe("P2SH addresses", () => {
    it("should generate a P2SH address from a public key", () => {
      const keyPrivate = blockchain.generateKeyPrivate();
      const keyPublic = blockchain.getKeyPublic(keyPrivate);
      const address = blockchain.getAddress(keyPublic, 'p2sh');
      
      // P2SH address should start with 3
      expect(address.startsWith('3')).toBe(true);
      
      // P2SH address should be 26-35 characters
      expect(address.length).toBeGreaterThanOrEqual(26);
      expect(address.length).toBeLessThanOrEqual(35);
    });
    
    it("should validate a valid P2SH address", () => {
      const keyPrivate = blockchain.generateKeyPrivate();
      const keyPublic = blockchain.getKeyPublic(keyPrivate);
      const address = blockchain.getAddress(keyPublic, 'p2sh');
      
      expect(blockchain.validateAddress!(address)).toBe(true);
    });
    
    it("should reject an invalid P2SH address", () => {
      // P2SH format but with invalid checksum
      expect(blockchain.validateAddress!("3MbYQMMmSkC3AgWkj9FMo5LsPTW1zBTwX1")).toBe(false);
    });
  });
  
  describe("SegWit v0 (bech32) addresses", () => {
    // Known test vector for SegWit v0
    const segwitTestVector = {
      privateKey: '0000000000000000000000000000000000000000000000000000000000000001',
      publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      segwitAddress: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'
    };
    
    it("should generate a SegWit v0 address from a public key", () => {
      const address = blockchain.getAddress(segwitTestVector.publicKey, 'segwit');
      
      // SegWit address should match expected value
      expect(address).toBe(segwitTestVector.segwitAddress);
      
      // SegWit address should start with bc1
      expect(address.startsWith('bc1')).toBe(true);
    });
    
    it("should generate a valid SegWit v0 address from any key", () => {
      const keyPrivate = blockchain.generateKeyPrivate();
      const keyPublic = blockchain.getKeyPublic(keyPrivate);
      const address = blockchain.getAddress(keyPublic, 'segwit');
      
      // SegWit address should start with bc1q (q is part of the encoding, indicating v0)
      expect(address.startsWith('bc1q')).toBe(true);
      
      // Should be a valid address
      expect(blockchain.validateAddress!(address)).toBe(true);
    });
    
    it("should validate valid SegWit v0 addresses", () => {
      // Test known valid SegWit addresses
      const validAddresses = [
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4', // P2WPKH
        'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3' // P2WSH
      ];
      
      for (const address of validAddresses) {
        expect(blockchain.validateAddress!(address)).toBe(true);
      }
    });
    
    it("should reject invalid SegWit v0 addresses", () => {
      // Test known invalid SegWit addresses
      const invalidAddresses = [
        'tc1qw508d6qejxtdg4y5r3zarvary0c5xw7kg3g4ty', // Wrong hrp
        'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t5', // Invalid checksum
        'bc10w508d6qejxtdg4y5r3zarvary0c5xw7kw508d6q', // Invalid witness version
        'BC1SW50QA3JX3S', // Mixed case not allowed in bech32
        'bc1zw508d6qejxtdg4y5r3zarvaryvg6kdaj', // Invalid program length
        'bc1q' // Too short
      ];
      
      for (const address of invalidAddresses) {
        expect(blockchain.validateAddress!(address)).toBe(false);
      }
    });
  });
  
  describe("SegWit v1 (bech32m/Taproot) addresses", () => {
    it("should generate a Taproot address from a public key", () => {
      const keyPrivate = blockchain.generateKeyPrivate();
      const keyPublic = blockchain.getKeyPublic(keyPrivate);
      const address = blockchain.getAddress(keyPublic, 'taproot');
      
      // Taproot address should start with bc1p (p is part of the encoding, indicating v1)
      expect(address.startsWith('bc1p')).toBe(true);
      
      // Should be a valid address
      expect(blockchain.validateAddress!(address)).toBe(true);
    });
    
    it("should generate different addresses for same key with different types", () => {
      const keyPrivate = blockchain.generateKeyPrivate();
      const keyPublic = blockchain.getKeyPublic(keyPrivate);
      
      const legacyAddress = blockchain.getAddress(keyPublic, 'legacy');
      const p2shAddress = blockchain.getAddress(keyPublic, 'p2sh');
      const segwitAddress = blockchain.getAddress(keyPublic, 'segwit');
      const taprootAddress = blockchain.getAddress(keyPublic, 'taproot');
      
      // All addresses should be different
      expect(new Set([legacyAddress, p2shAddress, segwitAddress, taprootAddress]).size).toBe(4);
      
      // Each address should start with the correct prefix
      expect(legacyAddress.startsWith('1')).toBe(true);
      expect(p2shAddress.startsWith('3')).toBe(true);
      expect(segwitAddress.startsWith('bc1q')).toBe(true);
      expect(taprootAddress.startsWith('bc1p')).toBe(true);
    });
    
    it("should validate a Taproot address", () => {
      // Generate a Taproot address
      const keyPrivate = blockchain.generateKeyPrivate();
      const keyPublic = blockchain.getKeyPublic(keyPrivate);
      const address = blockchain.getAddress(keyPublic, 'taproot');
      
      // Should be valid
      expect(blockchain.validateAddress!(address)).toBe(true);
      
      // Slightly modifying the address should make it invalid
      const invalidAddress = address.slice(0, address.length - 1) + 
                            (address[address.length - 1] === 'a' ? 'b' : 'a');
      expect(blockchain.validateAddress!(invalidAddress)).toBe(false);
    });
  });
});