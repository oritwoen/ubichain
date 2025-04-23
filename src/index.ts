export { useBlockchain } from './blockchain'

// Export lazy-loaded blockchain implementations
export { blockchains } from './_blockchains'

// Export BIP44 utilities
export { 
  BIP44, 
  BIP44Change, 
  getBIP44Path, 
  parseBIP44Path,
  getBlockchainPath 
} from './utils/bip44'

// Export Signing utilities
export {
  signMessage,
  verifyMessage,
  type SigningOptions
} from './utils/signing'

export type { 
  Blockchain, 
  BlockchainImplementation, 
  Keys, 
  Wallet, 
  KeyOptions, 
  AddressType,
  NetworkType,
  AddressFormat
} from './types'