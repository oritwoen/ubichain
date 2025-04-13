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
});