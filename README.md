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
- 💼 **Wallet generation** - generate complete crypto wallets in one step 
- 🔄 **Consistent API** - uniform interface across all blockchains
- 🌐 **EVM support** - common implementation for all EVM chains

## Supported Blockchains

Currently supported blockchains:

- **Bitcoin** (secp256k1)
  - Legacy addresses (P2PKH) - addresses starting with '1'
  - P2SH addresses - addresses starting with '3'
- **Ethereum** (secp256k1)
  - Standard addresses (Keccak-256 hash of public key)
  - EIP-55 checksum support
- **Base** (secp256k1)
  - Same format as Ethereum (EVM compatible)
- **Solana** (ed25519)
  - Standard addresses (Ed25519 public keys encoded in base58)
- **Aptos** (ed25519)
  - Standard addresses (Ed25519 based)
- **TRON** (secp256k1)
  - Standard addresses (Secp256k1 based with Keccak-256 hash)
- **SUI** (ed25519, secp256k1)
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
import ethereum from 'ubichain/blockchains/ethereum';
import solana from 'ubichain/blockchains/solana';

// Create blockchain interfaces
const bitcoinChain = useBlockchain(bitcoin());
const ethereumChain = useBlockchain(ethereum());
const solanaChain = useBlockchain(solana());

// Get cryptographic curve used by the blockchain
console.log('Bitcoin uses curve:', bitcoinChain.curve);        // secp256k1
console.log('Ethereum uses curve:', ethereumChain.curve);      // secp256k1
console.log('Solana uses curve:', solanaChain.curve);          // ed25519
```

### Working with Keys

```typescript
import { useBlockchain } from 'ubichain';
import bitcoin from 'ubichain/blockchains/bitcoin';

const chain = useBlockchain(bitcoin());

// Generate a single private key
const privateKey = chain.generateKeyPrivate();
console.log('Private Key:', privateKey);

// Get a public key from a private key
const publicKey = chain.getKeyPublic(privateKey);
console.log('Public Key:', publicKey);

// Generate an uncompressed public key
const uncompressedPublicKey = chain.getKeyPublic(privateKey, { compressed: false });
console.log('Uncompressed Public Key:', uncompressedPublicKey);

// Generate address from public key
const address = chain.getAddress(publicKey);
console.log('Address:', address);

// Generate a different type of address (e.g., Bitcoin P2SH)
const p2shAddress = chain.getAddress(publicKey, 'p2sh');
console.log('P2SH Address:', p2shAddress);

// Validate an address
const isValid = chain.validateAddress?.(address);
console.log('Is Valid Address:', isValid);
```

### Generating Key Pairs and Wallets

```typescript
import { useBlockchain } from 'ubichain';
import ethereum from 'ubichain/blockchains/ethereum';

const chain = useBlockchain(ethereum());

// Generate a key pair (private and public keys)
const keys = chain.generateKeys();
console.log('Private Key:', keys.keys.private);
console.log('Public Key:', keys.keys.public);

// Generate a complete wallet (private key, public key, and address)
const wallet = chain.generateWallet();
console.log('Private Key:', wallet.keys.private);
console.log('Public Key:', wallet.keys.public);
console.log('Address:', wallet.address);

// Generate wallet with specific options
const uncompressedWallet = chain.generateWallet({ compressed: false });
console.log('Uncompressed Public Key:', uncompressedWallet.keys.public);

// Generate Bitcoin wallet with specific address type
import bitcoin from 'ubichain/blockchains/bitcoin';
const bitcoinChain = useBlockchain(bitcoin());
const p2shWallet = bitcoinChain.generateWallet({}, 'p2sh');
console.log('Bitcoin P2SH Address:', p2shWallet.address); // Starts with '3'
```

### Working with EVM Blockchains

```typescript
import { useBlockchain } from 'ubichain';
import ethereum from 'ubichain/blockchains/ethereum';
import base from 'ubichain/blockchains/base';

// EVM blockchains share the same address format
const ethereumChain = useBlockchain(ethereum());
const baseChain = useBlockchain(base());

// Generate wallets for both chains
const ethWallet = ethereumChain.generateWallet();
const baseWallet = baseChain.generateWallet();

console.log('Ethereum Address:', ethWallet.address);
console.log('Base Address:', baseWallet.address);

// Same private key will generate same address on both chains
const privateKey = ethereumChain.generateKeyPrivate();
const ethPublicKey = ethereumChain.getKeyPublic(privateKey);
const basePublicKey = baseChain.getKeyPublic(privateKey);

console.log('Same public key?', ethPublicKey === basePublicKey); // true

const ethAddress = ethereumChain.getAddress(ethPublicKey);
const baseAddress = baseChain.getAddress(basePublicKey);

console.log('Same address?', ethAddress === baseAddress); // true
```

## Architecture

The library is designed to be modular and extensible:

- **Core Utilities** - Hash functions, cryptographic primitives, encoding/decoding
- **Blockchain Implementations** - Specific implementations for each supported blockchain
- **Common Interface** - Consistent API across all blockchain implementations
- **Shared Implementations** - Common code for similar blockchains (e.g., EVM chains)
- **Type Definitions** - Strong TypeScript typing for all interfaces and data structures
- **Hierarchical Data Model** - Structured representation of keys and wallets

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

- [x] Add support for Ethereum and EIP-55 checksums
- [x] Add support for Base (and other EVM chains)
- [x] Add key pair generation in one step
- [x] Add wallet generation in one step
- [x] Create hierarchical data model for keys and wallets
- [ ] Add SegWit (bech32) address support
- [ ] Add Testnet address support
- [ ] Add support for BIP39 mnemonic phrases
- [ ] Add HD wallet support (BIP32/BIP44)
- [ ] Add transaction creation and signing
- [ ] Add support for more EVM blockchains (Polygon, Arbitrum, Optimism, etc.)
- [ ] Add support for additional blockchains (Cardano, Polkadot, etc.)

## License

MIT