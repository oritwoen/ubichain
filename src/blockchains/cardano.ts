import { blake2b } from '@noble/hashes/blake2b'
import { hexToBytes } from '@noble/hashes/utils'
import { generateKeyPublic as getEd25519KeyPublic } from '../utils/ed25519'
import { ed25519SignMessage, ed25519VerifyMessage } from '../utils/ed25519-chains'
import { base58 } from '@scure/base'
import type { Curve, KeyOptions, Options, BlockchainImplementation } from '../types'

export default function cardano(options?: Options) {
  const name = "cardano";
  const curve: Curve = "ed25519";
  const network = options?.network || 'mainnet';
  const bip44 = 1815; // SLIP-0044 index for Cardano
  
  // Cardano network constants
  const _NETWORK = {
    MAINNET: 1,
    TESTNET: 0
  };
  
  // Cardano address types (simplified for this implementation)
  const ADDRESS_TYPE = {
    PAYMENT: 'payment',
    STAKE: 'stake',
    ENTERPRISE: 'enterprise'
  };

  /**
   * Get public key from private key using Ed25519 curve
   * 
   * @param keyPrivate - The private key as a hex string
   * @param options - Optional parameters
   * @returns Public key as hex string
   */
  function getKeyPublic(keyPrivate: string, _options?: KeyOptions): string {
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
    
    // Determine prefix based on network and address type
    if (network === 'testnet') {
      switch (type) {
        case ADDRESS_TYPE.STAKE: {
          prefix = 'stake_test1';
          break;
        }
        case ADDRESS_TYPE.ENTERPRISE: {
          prefix = 'addr_test1e';
          break;
        }
        default: {
          // Default base payment address for testnet
          prefix = 'addr_test1';
          break;
        }
      }
    } else {
      // Mainnet prefixes
      switch (type) {
        case ADDRESS_TYPE.STAKE: {
          prefix = 'stake1';
          break;
        }
        case ADDRESS_TYPE.ENTERPRISE: {
          prefix = 'addr1e';
          break;
        }
        default: {
          // Default base payment address for mainnet
          prefix = 'addr1';
          break;
        }
      }
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
    // List of valid prefixes based on network
    const mainnetPrefixes = ['addr1', 'addr1e', 'stake1'];
    const testnetPrefixes = ['addr_test1', 'addr_test1e', 'stake_test1'];
    
    // Choose valid prefixes based on current network
    const validPrefixes = network === 'testnet' ? testnetPrefixes : mainnetPrefixes;
    
    // Check if address starts with a valid prefix for the current network
    if (!validPrefixes.some(prefix => address.startsWith(prefix))) {
      return false;
    }
    
    // Extract the encoded part (after the prefix)
    let base58Part = '';
    
    if (address.startsWith('addr1e')) {
      base58Part = address.slice(6);
    } else if (address.startsWith('addr1')) {
      base58Part = address.slice(5);
    } else if (address.startsWith('stake1')) {
      base58Part = address.slice(6);
    } else if (address.startsWith('addr_test1e')) {
      base58Part = address.slice(11);
    } else if (address.startsWith('addr_test1')) {
      base58Part = address.slice(10);
    } else if (address.startsWith('stake_test1')) {
      base58Part = address.slice(11);
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

  /**
   * Signs a message using Ed25519 for Cardano
   * 
   * @param message - The message to sign
   * @param keyPrivate - The private key
   * @param options - Optional parameters
   * @returns The signature as a hex string
   */
  function signMessage(message: string | Uint8Array, keyPrivate: string, options?: KeyOptions): string {
    return ed25519SignMessage(message, keyPrivate, options);
  }

  /**
   * Verifies a message signature for Cardano
   * 
   * @param message - The original message
   * @param signature - The signature to verify
   * @param keyPublic - The public key
   * @param options - Optional parameters
   * @returns Whether the signature is valid
   */
  function verifyMessage(message: string | Uint8Array, signature: string, keyPublic: string, options?: KeyOptions): boolean {
    return ed25519VerifyMessage(message, signature, keyPublic, options);
  }
  
  return {
    name,
    curve,
    network,
    bip44,
    getKeyPublic,
    getAddress,
    validateAddress,
    signMessage,
    verifyMessage
  } satisfies BlockchainImplementation;
}