# Cardano Research Notes

## Address Types
Cardano uses several address types:
- Byron legacy addresses (Base58)
- Shelley era addresses
  - Payment addresses
  - Stake addresses
  - Enterprise addresses
  - Reward addresses

## Key Schema
- Ed25519 cryptography
- Two primary key types:
  - Payment keys
  - Staking keys

## Address Format
- Bech32 encoding (similar to SegWit, but with different parameters)
- Format depends on network (mainnet vs testnet) and address type
- Mainnet prefixes: 
  - addr1: Payment address
  - stake1: Stake address 
  - addr_test1: Testnet payment address

## Key Derivation
- Based on Ed25519 cryptographic curve
- Can use both normal and extended (HD) key derivation
- Each address involves a payment key hash and possibly a staking key hash

## Libraries to Consider
- @emurgo/cardano-serialization-lib-nodejs (most complete)
- @stricahq/typhonjs
- cardano-crypto.js

## Implementation Requirements
1. Generate Ed25519 keys
2. Create address from public keys
3. Calculate address components (headers, payment key hash, stake key hash)
4. Encode using Bech32
5. Add validation logic for Cardano addresses