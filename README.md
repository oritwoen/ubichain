# ubichain

[![npm version](https://img.shields.io/npm/v/ubichain?color=black)](https://npmjs.com/package/ubichain)
[![npm downloads](https://img.shields.io/npm/dm/ubichain?color=black)](https://npm.chart.dev/ubichain)
[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/actions/workflow/status/oritwoen/ubichain/ci.yml?branch=main&color=black)](https://github.com/oritwoen/ubichain/actions)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/ubichain?color=black)](https://bundlephobia.com/package/ubichain)

> [!WARNING]
> This library is under active development and the API may change significantly between minor versions until reaching 1.0.0.
> Each release will be documented in the CHANGELOG.md file, but please keep this in mind when integrating the library.

A TypeScript library for interacting with various blockchains, providing simple and consistent interfaces for generating keys, addresses, and managing crypto wallets.

## Features

- 🛡️ **Secure key generation** - cryptographically secure private keys
- 🔑 **Multiple key formats** - compressed and uncompressed public keys
- 📫 **Address generation** - create addresses for different blockchains
- ✅ **Address validation** - verify address validity and checksums
- 🧩 **Modular design** - easily extendable to support additional blockchains
- 📦 **Minimal dependencies** - uses carefully selected crypto libraries with excellent security track records
- 📐 **Type-safe** - written in TypeScript with full type definitions
- 💼 **Wallet generation** - generate complete crypto wallets in one step 
- 🔄 **Consistent API** - uniform interface across all blockchains
- 🌐 **EVM support** - common implementation for all EVM chains
- 🌲 **Hierarchical derivation** - BIP32 & SLIP-0010 support for HD wallets
- 🧪 **Playground examples** - ready-to-run code snippets for common tasks

## Supported Blockchains

Currently supported blockchains:

- **Bitcoin** (secp256k1)
  - Legacy addresses (P2PKH) - addresses starting with '1' (mainnet) or 'm'/'n' (testnet)
  - P2SH addresses - addresses starting with '3' (mainnet) or '2' (testnet)
  - SegWit v0 P2WPKH addresses (bech32) - addresses starting with 'bc1q' (mainnet) or 'tb1q' (testnet)
  - SegWit v0 P2WSH addresses (bech32) - addresses starting with 'bc1q' (mainnet) or 'tb1q' (testnet)
  - SegWit v1 addresses (bech32m/Taproot) - addresses starting with 'bc1p' (mainnet) or 'tb1p' (testnet)
  - Testnet support for all address types
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

> [!TIP] 
> For detailed example code, check the `playground` folder in the repository

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

// Mainnet blockchain instance (default)
const chain = useBlockchain(bitcoin());

// Testnet blockchain instance
const testnet = useBlockchain(bitcoin({ network: 'testnet' }));

// Generate a single private key
const privateKey = chain.generateKeyPrivate();
console.log('Private Key:', privateKey);

// Get a public key from a private key
const publicKey = chain.getKeyPublic(privateKey);
console.log('Public Key:', publicKey);

// Generate an uncompressed public key
const uncompressedPublicKey = chain.getKeyPublic(privateKey, { compressed: false });
console.log('Uncompressed Public Key:', uncompressedPublicKey);

// Generate mainnet addresses
const address = chain.getAddress(publicKey);
console.log('Mainnet Legacy Address:', address);

// Generate different types of Bitcoin mainnet addresses
const p2shAddress = chain.getAddress(publicKey, 'p2sh');
const p2wshAddress = chain.getAddress(publicKey, 'p2wsh');
const taprootAddress = chain.getAddress(publicKey, 'taproot');

console.log('Mainnet P2SH Address:', p2shAddress);
console.log('Mainnet P2WSH Address:', p2wshAddress);
console.log('Mainnet Taproot Address:', taprootAddress);

// Generate testnet addresses
const testnetAddress = testnet.getAddress(publicKey);
console.log('Testnet Legacy Address:', testnetAddress);

const testnetSegwit = testnet.getAddress(publicKey, 'segwit');
console.log('Testnet SegWit Address:', testnetSegwit);

// Validate an address
const isValid = chain.validateAddress?.(address);
console.log('Is Valid Mainnet Address:', isValid);

// Validate testnet address
const isValidTestnet = testnet.validateAddress?.(testnetAddress);
console.log('Is Valid Testnet Address:', isValidTestnet);
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
- **HD Wallet Standards** - Implementation of BIP32/SLIP-0010/BIP39/BIP44 standards
- **Playground Examples** - Ready-to-run code examples showcasing library features

## Development

### Prerequisites

- Node.js 22+ (Latest LTS)
- pnpm 10+

### Setup

```bash
git clone https://github.com/oritwoen/ubichain.git
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

# Run playground examples
pnpm playground:bip32  # Run BIP32 demo
pnpm playground:slip10 # Run SLIP-0010 demo
pnpm playground <file> # Run any TypeScript file in playground folder
```

## Roadmap

- [x] Add support for Ethereum and EIP-55 checksums
- [x] Add support for Base (and other EVM chains)
- [x] Add key pair generation in one step
- [x] Add wallet generation in one step
- [x] Create hierarchical data model for keys and wallets
- [x] Add SegWit (bech32) address support
- [x] Add SegWit v1 (bech32m/Taproot) address support
- [x] Add P2WSH address support
- [x] Add Testnet address support
- [x] Add HD wallet support for secp256k1 chains (BIP32)
- [x] Add SLIP-0010 support for ed25519 chains (Solana, Aptos, etc.)
- [ ] Add support for BIP39 mnemonic phrases
- [ ] Add support for BIP44 derivation paths
- [ ] Add transaction creation and signing
- [ ] Add support for more EVM blockchains (Polygon, Arbitrum, Optimism, etc.)
- [ ] Add support for additional blockchains (Polkadot, Cosmos, etc.)

## Security & Dependencies

This library leverages high-quality, audited cryptographic packages:

- [@noble/hashes](https://github.com/paulmillr/noble-hashes) - Audited, high-performance cryptographic hashing for the web
- [@noble/curves](https://github.com/paulmillr/noble-curves) - Audited implementation of elliptic curves
- [@scure/base](https://github.com/paulmillr/scure-base) - Secure encoding implementations
- [@scure/bip32](https://github.com/paulmillr/scure-bip32) - Audited implementation of BIP32 HD wallets
- [micro-key-producer](https://github.com/paulmillr/micro-key-producer) - Cryptographic key generation including SLIP-0010 for ed25519

These dependencies were chosen for their security, performance, and reliability in cryptographic operations.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT - See LICENSE.md for details
