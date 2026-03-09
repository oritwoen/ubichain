# BLOCKCHAINS

## OVERVIEW

Lazy-loaded factory modules. Each file exports one `default function` returning `BlockchainImplementation`.

## CHAIN FAMILIES

| Family               | Chains                 | Signing                                           | Key Derivation                      |
| -------------------- | ---------------------- | ------------------------------------------------- | ----------------------------------- |
| **EVM**              | ethereum, base         | `evmSignMessage` (preamble + keccak256)           | secp256k1 via `utils/secp256k1`     |
| **secp256k1 custom** | bitcoin, tron          | `evmSignMessage` (same signing, custom addresses) | secp256k1 via `utils/secp256k1`     |
| **ed25519**          | solana, aptos, cardano | `ed25519SignMessage` (raw, no prehash)            | ed25519 via `utils/ed25519`         |
| **dual-curve**       | sui                    | both (selected via `options.scheme`)              | ed25519 default, secp256k1 optional |

## ADDING A NEW CHAIN

1. Create `src/blockchains/<name>.ts` exporting `default function <name>(options?: Options)`
2. Implement: `getKeyPublic`, `getAddress`, `validateAddress`, `signMessage`, `verifyMessage`
3. Return with `satisfies BlockchainImplementation` (not `: BlockchainImplementation`)
4. Register in `src/_blockchains.ts`: `<name>: lazy(() => import('./blockchains/<name>'))`
5. Create `test/blockchains/<name>.test.ts` using fixtures from `test/fixtures.ts`
6. For EVM chains: use `createEVMBlockchain()` from `utils/evm.ts` (3 lines total)

## PATTERNS

- **EVM shortcut** - `ethereum.ts` and `base.ts` are ~20 lines each, delegating to `createEVMBlockchain()`
- **Network params** - chains with testnet support (bitcoin, tron, cardano) define `networkParams` record keyed by network name
- **BIP44 coin type** - every chain sets `bip44` from `BIP44` enum or SLIP-0044 number
- **SUI dual-curve** - `getKeyPublic` and `signMessage` check `options.scheme` to pick ed25519 or secp256k1

## COMPLEXITY

| Chain          | Lines | Why                                                                         |
| -------------- | ----- | --------------------------------------------------------------------------- |
| bitcoin        | 175   | 5 address formats (legacy, p2sh, segwit, p2wsh, taproot) + testnet variants |
| cardano        | 199   | Custom address encoding (prefix + base58 key hash) with 3 address types     |
| sui            | 151   | Dual curve support, scheme-based dispatch in 4 methods                      |
| tron           | 118   | Custom Keccak + base58check encoding                                        |
| solana, aptos  | ~95   | Straightforward single-curve implementations                                |
| ethereum, base | ~22   | EVM factory delegates everything                                            |
