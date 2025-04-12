/**
 * Defines a blockchain interface that allows you to generate keys or addresses
 */
export type Blockchain = {
  /**
   * The name of the blockchain.
   */
  name: string;

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
