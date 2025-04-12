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

// Create a blockchain interface
const blockchain = useBlockchain(bitcoin());

// Generate a new private key
const privateKey = blockchain.generateKeyPrivate();
console.log('Private Key:', privateKey);

// Generate a public key from the private key
const publicKey = blockchain.generateKeyPublic(privateKey);
console.log('Public Key:', publicKey);

// Generate a legacy address from the public key
const legacyAddress = blockchain.generateAddress(publicKey, 'legacy');
console.log('Legacy Address:', legacyAddress);

// Generate a P2SH address from the public key
const p2shAddress = blockchain.generateAddress(publicKey, 'p2sh');
console.log('P2SH Address:', p2shAddress);

// Validate an address
const isValid = blockchain.validateAddress(legacyAddress);
console.log('Is Valid Address:', isValid);
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
- [ ] Add support for more blockchains (Ethereum, Litecoin, etc.)

## License

MIT