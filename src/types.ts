/**
 * Cryptographic curve type
 */
export type Curve = 'ed25519' | 'secp256k1';

/**
 * Defines a blockchain interface that allows you to generate keys or addresses
 */
export type Blockchain = {
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
   * Generates a public key from a private key
   */
  generateKeyPublic: (keyPrivate: string, options?: Record<string, any>) => string;

  /**
   * Generates a public address from a public key
   */
  generateAddress: (keyPublic: string, type?: string) => string;
  
  /**
   * Validates a blockchain address
   */
  validateAddress?: (address: string) => boolean;
};

export interface BlockchainResponse {
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
   * Generates a public key from a private key
   */
  generateKeyPublic: (keyPrivate: string, options?: Record<string, any>) => string;
  
  /**
   * Generates a public address from a public key
   */
  generateAddress: (keyPublic: string, type?: string) => string;
  
  /**
   * Validates a blockchain address
   */
  validateAddress?: (address: string) => boolean;
};
