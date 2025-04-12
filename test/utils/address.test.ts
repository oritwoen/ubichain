import { describe, expect, it } from "vitest";
import { 
  hash160, 
  generateAddressLegacy, validateAddressLegacy,
  generateAddressP2SH, validateAddressP2SH 
} from "../../src/utils/address";

describe("Address utilities", () => {
  const testPublicKey = "03a34b99f22c790c4e36b2b3c2c35a36db06226e41c692fc82b8b56ac1c540c5bd";
  
  describe("hash160", () => {
    it("should hash data properly", () => {
      const data = new Uint8Array([1, 2, 3, 4, 5]);
      const hash = hash160(data);
      
      // Result should be 20 bytes (RIPEMD160 output)
      expect(hash.length).toBe(20);
    });
  });
  
  describe("Legacy addresses (P2PKH)", () => {
    it("should generate a valid Legacy address with correct version byte", () => {
      const address = generateAddressLegacy(testPublicKey, { bytesVersion: 0x00 });
      
      // Should start with '1' (for Bitcoin mainnet)
      expect(address.startsWith('1')).toBe(true);
      expect(address.length).toBeGreaterThanOrEqual(26);
      expect(address.length).toBeLessThanOrEqual(35);
    });
    
    it("should validate a correct address", () => {
      const address = generateAddressLegacy(testPublicKey, { bytesVersion: 0x00 });
      const isValid = validateAddressLegacy(address, { bytesVersion: 0x00 });
      
      expect(isValid).toBe(true);
    });
    
    it("should reject an address with wrong version byte", () => {
      const address = generateAddressLegacy(testPublicKey, { bytesVersion: 0x00 });
      const isValid = validateAddressLegacy(address, { bytesVersion: 0x05 });
      
      expect(isValid).toBe(false);
    });
    
    it("should reject invalid addresses", () => {
      expect(validateAddressLegacy("1INVALID$ADDRESS", { bytesVersion: 0x00 })).toBe(false);
      expect(validateAddressLegacy("1Ax", { bytesVersion: 0x00 })).toBe(false);
    });
  });
  
  describe("P2SH addresses", () => {
    it("should generate a valid P2SH address with correct version byte", () => {
      const address = generateAddressP2SH(testPublicKey, { bytesVersion: 0x05 });
      
      // Should start with '3' (for Bitcoin mainnet)
      expect(address.startsWith('3')).toBe(true);
      expect(address.length).toBeGreaterThanOrEqual(26);
      expect(address.length).toBeLessThanOrEqual(35);
    });
    
    it("should validate a correct P2SH address", () => {
      const address = generateAddressP2SH(testPublicKey, { bytesVersion: 0x05 });
      const isValid = validateAddressP2SH(address, { bytesVersion: 0x05 });
      
      expect(isValid).toBe(true);
    });
    
    it("should reject a P2SH address with wrong version byte", () => {
      const address = generateAddressP2SH(testPublicKey, { bytesVersion: 0x05 });
      const isValid = validateAddressP2SH(address, { bytesVersion: 0x00 });
      
      expect(isValid).toBe(false);
    });
  });
});