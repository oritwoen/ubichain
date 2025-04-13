/**
 * Cryptographic curve type
 */
export type Curve = 'ed25519' | 'secp256k1';

/**
 * Represents a pair of cryptographic keys
 */
export interface Keys {
  /**
   * Cryptographic keys
   */
  keys: {
    /**
     * Private key as a hex string
     */
    private: string;
    
    /**
     * Public key as a hex string
     */
    public: string;
  };
}

/**
 * Represents a complete wallet with keys and address
 */
export interface Wallet extends Keys {
  /**
   * Blockchain address derived from the public key
   */
  address: string;
}

/**
 * Specific options for key derivation
 */
export interface KeyOptions {
  compressed?: boolean;
  encoding?: 'hex' | 'base64' | 'binary';
  scheme?: string; // For blockchain implementations that support multiple signature schemes
  // Extend with more specific options as needed
}

/**
 * Unified blockchain interface that allows you to generate keys or addresses
 */
export interface Blockchain {
  /**
   * The name of the blockchain.
   */
  name: string;
  
  /**
   * The cryptographic curve(s) used by the blockchain.
   * Some blockchains (like SUI) support multiple curves.
   */
  curve: Curve | Curve[];
  
  /**
   * Generates a cryptographically secure random private key
   * Common implementation for all blockchains - 32 bytes (256 bits)
   */
  generateKeyPrivate: () => string;
  
  /**
   * Gets a public key derived from a private key
   */
  getKeyPublic: (keyPrivate: string, options?: KeyOptions) => string;
  
  /**
   * Gets a public address derived from a public key
   */
  getAddress: (keyPublic: string, type?: string) => string;
  
  /**
   * Validates a blockchain address
   */
  validateAddress?: (address: string) => boolean;
  
  /**
   * Generates a key pair (private and public keys)
   * This is a convenience function that combines generateKeyPrivate and getKeyPublic
   */
  generateKeys: (options?: KeyOptions) => Keys;
  
  /**
   * Generates a complete wallet (private key, public key, and address)
   * This is a convenience function that combines generateKeys and getAddress
   */
  generateWallet: (options?: KeyOptions, addressType?: string) => Wallet;
};
