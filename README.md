# ubichain

A TypeScript library for interacting with various blockchains, providing simple and consistent interfaces for generating keys, addresses, and managing crypto wallets.

## Features

- 🛡️ **Secure key generation** - cryptographically secure private keys
- 🔑 **Multiple key formats** - compressed and uncompressed public keys
- 📫 **Address generation** - create addresses for different blockchains
- ✅ **Address validation** - verify address validity and checksums
- 🧩 **Modular design** - easily extendable to support additional blockchains
- 📦 **Zero external dependencies** - only uses Node.js crypto and minimal utilities
- 📐 **Type-safe** - written in TypeScript with full type definitions

## Supported Blockchains

Currently supported blockchains:

- **Bitcoin**
  - Legacy addresses (P2PKH) - addresses starting with '1'
  - P2SH addresses - addresses starting with '3'
- **Solana**
  - Standard addresses (Ed25519 public keys encoded in base58)
- **Aptos**
  - Standard addresses (Ed25519 based)
- **TRON**
  - Standard addresses (Secp256k1 based with Keccak-256 hash)
- **SUI**
  - Standard addresses (Blake2b hash of scheme flag + public key)
  - Supports both Ed25519 and Secp256k1 keys

## Installation

```bash
npm install ubichain
# or
yarn add ubichain
# or
pnpm add ubichain
```

## Usage

### Basic Usage

```typescript
import { useBlockchain } from 'ubichain';
import bitcoin from 'ubichain/blockchains/bitcoin';
import solana from 'ubichain/blockchains/solana';
import sui from 'ubichain/blockchains/sui';

// Create a Bitcoin blockchain interface
const bitcoinChain = useBlockchain(bitcoin());

// Generate a new private key
const privateKey = bitcoinChain.generateKeyPrivate();
console.log('Private Key:', privateKey);

// Generate a public key from the private key
const publicKey = bitcoinChain.generateKeyPublic(privateKey);
console.log('Public Key:', publicKey);

// Generate a legacy address from the public key
const legacyAddress = bitcoinChain.generateAddress(publicKey, 'legacy');
console.log('Bitcoin Legacy Address:', legacyAddress);

// Generate a P2SH address from the public key
const p2shAddress = bitcoinChain.generateAddress(publicKey, 'p2sh');
console.log('Bitcoin P2SH Address:', p2shAddress);

// Validate an address
const isValid = bitcoinChain.validateAddress(legacyAddress);
console.log('Is Valid Bitcoin Address:', isValid);

// Create a Solana blockchain interface
const solanaChain = useBlockchain(solana());

// Generate a new private key
const solPrivateKey = solanaChain.generateKeyPrivate();
console.log('Solana Private Key:', solPrivateKey);

// Generate a public key from the private key (using Ed25519)
const solPublicKey = solanaChain.generateKeyPublic(solPrivateKey);
console.log('Solana Public Key:', solPublicKey);

// Generate a Solana address from the public key
const solAddress = solanaChain.generateAddress(solPublicKey);
console.log('Solana Address:', solAddress);

// Validate a Solana address
const isSolAddressValid = solanaChain.validateAddress(solAddress);
console.log('Is Valid Solana Address:', isSolAddressValid);

// Create a SUI blockchain interface
const suiChain = useBlockchain(sui());

// Generate a public key from private key using Ed25519 (default)
const suiEd25519PublicKey = suiChain.generateKeyPublic(privateKey);
console.log('SUI Ed25519 Public Key:', suiEd25519PublicKey);

// Generate a SUI address from the Ed25519 public key
const suiEd25519Address = suiChain.generateAddress(suiEd25519PublicKey);
console.log('SUI Address (Ed25519):', suiEd25519Address);

// Generate a public key using Secp256k1
const suiSecp256k1PublicKey = suiChain.generateKeyPublic(privateKey, 'secp256k1');
console.log('SUI Secp256k1 Public Key:', suiSecp256k1PublicKey);

// Generate a SUI address from the Secp256k1 public key
const suiSecp256k1Address = suiChain.generateAddress(suiSecp256k1PublicKey, 'secp256k1');
console.log('SUI Address (Secp256k1):', suiSecp256k1Address);

// Validate SUI addresses
console.log('Is Valid SUI Address:', suiChain.validateAddress(suiEd25519Address));
```

### Advanced Usage

#### Generate Uncompressed Public Key

```typescript
// Generate an uncompressed public key
const uncompressedPublicKey = blockchain.generateKeyPublic(privateKey, { compressed: false });
console.log('Uncompressed Public Key:', uncompressedPublicKey);
```

## Architecture

The library is designed to be modular and extensible:

- **Core Utilities** - Hash functions, cryptographic primitives, encoding/decoding
- **Blockchain Implementations** - Specific implementations for each supported blockchain
- **Common Interface** - Consistent API across all blockchain implementations

## Development

### Prerequisites

- Node.js 16+
- pnpm

### Setup

```bash
git clone https://github.com/yourusername/ubichain.git
cd ubichain
pnpm install
```

### Development Commands

```bash
# Run tests
pnpm run dev

# Build the library
pnpm run build

# Lint the code
pnpm run lint
```

## Roadmap

- [ ] Add SegWit (bech32) address support
- [ ] Add Testnet address support
- [ ] Add support for BIP39 mnemonic phrases
- [ ] Add HD wallet support (BIP32/BIP44)
- [ ] Add transaction creation and signing
- [ ] Add support for more blockchains (Ethereum, Polygon, Cardano, etc.)

## License

MIT