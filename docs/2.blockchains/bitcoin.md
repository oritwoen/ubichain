----
icon: simple-icons:bitcoin
---

# Bitcoin

## Introduction

Bitcoin implementation using the secp256k1 curve, supporting legacy (P2PKH), P2SH, and SegWit (bech32) addresses.

## Usage

**Driver name:** `bitcoin`

```js
import { useBlockchain } from 'ubichain';
import bitcoin from 'ubichain/blockchains/bitcoin';

const bitcoinChain = useBlockchain(bitcoin());
```

## Features

- **Curve**: secp256k1
- **Address Types**:
  - Legacy (P2PKH) - addresses starting with '1'
  - P2SH - addresses starting with '3'
  - SegWit (bech32) - addresses starting with 'bc1'
- **Public Key Formats**:
  - Compressed (default) - 33 bytes (66 hex chars)
  - Uncompressed - 65 bytes (130 hex chars)

## Examples

### Generate a Wallet

```js
const wallet = bitcoinChain.generateWallet();
console.log('Private Key:', wallet.keys.private);
console.log('Public Key:', wallet.keys.public);
console.log('Address:', wallet.address); // Legacy address starting with '1'
```

### Generate P2SH Address

```js
// Generate a P2SH wallet
const p2shWallet = bitcoinChain.generateWallet({}, 'p2sh');
console.log('P2SH Address:', p2shWallet.address); // Starts with '3'

// Or get a P2SH address from a public key
const publicKey = bitcoinChain.getKeyPublic(privateKey);
const p2shAddress = bitcoinChain.getAddress(publicKey, 'p2sh');
```

### Generate SegWit Address

```js
// Generate a SegWit wallet
const segwitWallet = bitcoinChain.generateWallet({}, 'segwit');
console.log('SegWit Address:', segwitWallet.address); // Starts with 'bc1'

// Or get a SegWit address from a public key
const publicKey = bitcoinChain.getKeyPublic(privateKey);
const segwitAddress = bitcoinChain.getAddress(publicKey, 'segwit');
```

### Validate an Address

```js
// Validate a legacy address
const isValidLegacy = bitcoinChain.validateAddress?.('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2');

// Validate a P2SH address
const isValidP2SH = bitcoinChain.validateAddress?.('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy');

// Validate a SegWit address
const isValidSegWit = bitcoinChain.validateAddress?.('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');
```

## Technical Details

### Address Generation

Bitcoin addresses are generated as follows:

1. **Legacy (P2PKH)**:
   ```
   address = Base58Check(0x00 + RIPEMD160(SHA256(publicKey)))
   ```

2. **P2SH**:
   ```
   redeemScript = 0x00 + 0x14 + RIPEMD160(SHA256(publicKey))
   address = Base58Check(0x05 + RIPEMD160(SHA256(redeemScript)))
   ```

3. **SegWit (bech32)**:
   ```
   keyHash = RIPEMD160(SHA256(publicKey))
   address = bech32Encode('bc', 0, keyHash)
   ```

The version bytes are:
- `0x00` for legacy addresses (prefix '1')
- `0x05` for P2SH addresses (prefix '3')
- Witness version `0` for SegWit addresses (prefix 'bc1')

### Key Generation

- **Private Key**: 32 random bytes (256 bits), represented as a 64-character hex string
- **Public Key**: Derived from the private key using the secp256k1 elliptic curve
  - Compressed: 33 bytes (66 hex chars), starting with 02 or 03
  - Uncompressed: 65 bytes (130 hex chars), starting with 04

## Source Code

The Bitcoin implementation is located in `src/blockchains/bitcoin.ts`.

```js
// Core functions
function getAddress(keyPublic, type) {
  // Check for segwit address type
  if (type === 'segwit') {
    return generateAddressSegWit(keyPublic, { hrp: 'bc', witnessVersion: 0 });
  }
  
  // Check for p2sh address type
  if (type === 'p2sh') {
    return generateAddressP2SH(keyPublic, { bytesVersion: 0x05 });
  }
  
  // Default to legacy (P2PKH)
  return generateAddressLegacy(keyPublic, { bytesVersion: 0x00 });
}

function validateAddress(address) {
  // Check for SegWit address
  if (address.startsWith('bc1')) {
    return validateAddressSegWit(address, { hrp: 'bc', witnessVersion: 0 });
  }
  
  // Check for P2SH address
  if (address.startsWith('3')) {
    return validateAddressP2SH(address, { bytesVersion: 0x05 });
  }
  
  // Default to legacy (P2PKH)
  return validateAddressLegacy(address, { bytesVersion: 0x00 });
}
```

## Future Plans

Future updates may include support for:
- SegWit P2WSH addresses for multisig
- SegWit v1 addresses (bech32m)
- Testnet addresses
- BIP39 mnemonic phrases
- HD wallet support (BIP32/BIP44)
- Transaction creation and signing