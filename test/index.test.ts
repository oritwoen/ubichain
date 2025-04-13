import { describe, expect, it } from "vitest";
import { useBlockchain } from "../src";
import bitcoin from "../src/blockchains/bitcoin";
import ethereum from "../src/blockchains/ethereum";

describe("Common blockchain functionality", () => {
  it("should expose useBlockchain function", () => {
    expect(typeof useBlockchain).toBe("function");
  });
  
  describe("generateKeys function", () => {
    it("should generate a valid key pair for Bitcoin", () => {
      const blockchain = useBlockchain(bitcoin());
      const keys = blockchain.generateKeys();
      
      // Verify structure
      expect(keys).toHaveProperty("keys");
      expect(keys.keys).toHaveProperty("private");
      expect(keys.keys).toHaveProperty("public");
      
      // Verify private key format
      expect(keys.keys.private).toMatch(/^[0-9a-f]{64}$/);
      
      // Verify public key format (compressed secp256k1 key)
      expect(keys.keys.public).toMatch(/^[0-9a-f]{66}$/);
      expect(keys.keys.public.startsWith('02') || keys.keys.public.startsWith('03')).toBe(true);
      
      // Verify that public key was correctly derived from private key
      const derivedPublicKey = blockchain.getKeyPublic(keys.keys.private);
      expect(keys.keys.public).toBe(derivedPublicKey);
    });
    
    it("should generate a valid key pair for Ethereum", () => {
      const blockchain = useBlockchain(ethereum());
      const keys = blockchain.generateKeys();
      
      // Verify structure
      expect(keys).toHaveProperty("keys");
      expect(keys.keys).toHaveProperty("private");
      expect(keys.keys).toHaveProperty("public");
      
      // Verify private key format
      expect(keys.keys.private).toMatch(/^[0-9a-f]{64}$/);
      
      // Verify public key format (compressed secp256k1 key)
      expect(keys.keys.public).toMatch(/^[0-9a-f]{66}$/);
      expect(keys.keys.public.startsWith('02') || keys.keys.public.startsWith('03')).toBe(true);
      
      // Verify that public key was correctly derived from private key
      const derivedPublicKey = blockchain.getKeyPublic(keys.keys.private);
      expect(keys.keys.public).toBe(derivedPublicKey);
    });
    
    it("should respect options passed to generateKeys", () => {
      const blockchain = useBlockchain(bitcoin());
      
      // Generate with default options (compressed key)
      const compressedKeys = blockchain.generateKeys();
      expect(compressedKeys.keys.public).toMatch(/^[0-9a-f]{66}$/);
      expect(compressedKeys.keys.public.startsWith('02') || compressedKeys.keys.public.startsWith('03')).toBe(true);
      
      // Generate with uncompressed key option
      const uncompressedKeys = blockchain.generateKeys({ compressed: false });
      expect(uncompressedKeys.keys.public).toMatch(/^[0-9a-f]{130}$/);
      expect(uncompressedKeys.keys.public.startsWith('04')).toBe(true);
    });
    
    it("should generate different key pairs each time", () => {
      const blockchain = useBlockchain(bitcoin());
      const keys1 = blockchain.generateKeys();
      const keys2 = blockchain.generateKeys();
      
      expect(keys1.keys.private).not.toBe(keys2.keys.private);
      expect(keys1.keys.public).not.toBe(keys2.keys.public);
    });
    
    it("should generate a valid wallet with address", () => {
      const blockchain = useBlockchain(bitcoin());
      const wallet = blockchain.generateWallet();
      
      // Verify structure
      expect(wallet).toHaveProperty("keys");
      expect(wallet.keys).toHaveProperty("private");
      expect(wallet.keys).toHaveProperty("public");
      expect(wallet).toHaveProperty("address");
      
      // Verify private key format
      expect(wallet.keys.private).toMatch(/^[0-9a-f]{64}$/);
      
      // Verify public key format (compressed secp256k1 key)
      expect(wallet.keys.public).toMatch(/^[0-9a-f]{66}$/);
      
      // Verify address format for Bitcoin (starts with 1 for default legacy address)
      expect(wallet.address.startsWith('1')).toBe(true);
      
      // Verify that address was correctly derived from public key
      const derivedAddress = blockchain.getAddress(wallet.keys.public);
      expect(wallet.address).toBe(derivedAddress);
    });
    
    it("should respect address type in generateWallet", () => {
      const blockchain = useBlockchain(bitcoin());
      
      // Default legacy address
      const legacyWallet = blockchain.generateWallet();
      expect(legacyWallet.address.startsWith('1')).toBe(true);
      
      // P2SH address
      const p2shWallet = blockchain.generateWallet({}, 'p2sh');
      expect(p2shWallet.address.startsWith('3')).toBe(true);
    });
  });
});