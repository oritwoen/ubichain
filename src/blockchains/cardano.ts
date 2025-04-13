import { blake2b } from '@noble/hashes/blake2b'
import { hexToBytes, bytesToHex } from '@noble/hashes/utils'
import { generateKeyPublic as getEd25519KeyPublic } from '../utils/ed25519'
import { base58 } from '@scure/base'
import type { Curve, KeyOptions } from '../types'

export default function cardano() {
  const name = "cardano";
  const curve: Curve = "ed25519";
  
  // Cardano network constants
  const NETWORK = {
    MAINNET: 1,
    TESTNET: 0
  };
  
  // Cardano address types (simplified for this implementation)
  const ADDRESS_TYPE = {
    PAYMENT: 'payment',
    STAKE: 'stake',
    ENTERPRISE: 'enterprise',
    TESTNET: 'testnet'
  };

  /**
   * Get public key from private key using Ed25519 curve
   * 
   * @param keyPrivate - The private key as a hex string
   * @param options - Optional parameters
   * @returns Public key as hex string
   */
  function getKeyPublic(keyPrivate: string, options?: KeyOptions): string {
    return getEd25519KeyPublic(keyPrivate);
  }
  
  /**
   * Get Cardano key hash from public key
   * 
   * @param keyPublic - Public key as hex string
   * @returns Hashed key bytes
   */
  function getKeyHash(keyPublic: string): Uint8Array {
    // Convert public key to bytes
    const keyPublicBytes = hexToBytes(keyPublic);
    
    // Hash the public key with blake2b-224 for Cardano addresses
    return blake2b(keyPublicBytes, { dkLen: 28 }); // 28 bytes = 224 bits
  }
  
  /**
   * Generate a simplified Cardano address
   * Note: This is a simplified implementation for demonstration purposes
   * Real Cardano addresses have more complex structures
   * 
   * @param keyPublic - The public key as a hex string
   * @param type - Address type (payment, stake, enterprise, testnet)
   * @returns Cardano-like address
   */
  function getAddress(keyPublic: string, type?: string): string {
    // Get key hash
    const keyHash = getKeyHash(keyPublic);
    
    // Create different address types with prefixes
    let prefix = '';
    
    if (type === ADDRESS_TYPE.STAKE) {
      prefix = 'stake1';
    } else if (type === ADDRESS_TYPE.TESTNET) {
      prefix = 'addr_test1';
    } else if (type === ADDRESS_TYPE.ENTERPRISE) {
      prefix = 'addr1e';
    } else {
      // Default base payment address
      prefix = 'addr1';
    }
    
    // Convert key hash to base58 for shorter addresses that pass validation
    const encodedHash = base58.encode(keyHash);
    
    // Combine prefix and encoded hash
    return prefix + encodedHash;
  }
  
  /**
   * Validate a Cardano address
   * This is a simplified validation that checks format patterns
   * 
   * @param address - The address to validate
   * @returns Whether the address format is valid
   */
  function validateAddress(address: string): boolean {
    // List of valid prefixes
    const validPrefixes = ['addr1', 'addr_test1', 'stake1', 'stake_test1', 'addr1e'];
    
    // Check if address starts with a valid prefix
    if (!validPrefixes.some(prefix => address.startsWith(prefix))) {
      return false;
    }
    
    // Extract the encoded part (after the prefix)
    let base58Part = '';
    
    if (address.startsWith('addr1e')) {
      base58Part = address.substring(6);
    } else if (address.startsWith('addr1')) {
      base58Part = address.substring(5);
    } else if (address.startsWith('stake1')) {
      base58Part = address.substring(6);
    } else if (address.startsWith('addr_test1')) {
      base58Part = address.substring(10);
    } else if (address.startsWith('stake_test1')) {
      base58Part = address.substring(11);
    }
    
    // Check if the base58 part is valid and can be decoded
    try {
      const decoded = base58.decode(base58Part);
      
      // Typical key hash length is 28 bytes
      if (decoded.length !== 28) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }
  
  return {
    name,
    curve,
    getKeyPublic,
    getAddress,
    validateAddress,
  };
}