# ubichain — Pi extension

Pi coding-agent extension exposing the [`ubichain`](../../README.md) library as 6 agent tools for key generation, address derivation, validation, signing, and BIP44 paths across 8 blockchains (Bitcoin, Ethereum, Base, Solana, Aptos, TRON, SUI, Cardano).

> [!WARNING]
> **This extension is experimental.** The package name, public API, provider model, CLI flags, and tool surfaces may change before the first stable release. Pin exact versions if you build on it now.

## Tools

| Tool                        | Purpose                                                 |
| --------------------------- | ------------------------------------------------------- |
| `ubichain_generate_wallet`  | Generate private key + public key + address for a chain |
| `ubichain_get_address`      | Derive an address from a public key                     |
| `ubichain_validate_address` | Check if an address is valid for a chain                |
| `ubichain_sign_message`     | Sign a message with a private key (secp256k1/ed25519)   |
| `ubichain_verify_message`   | Verify a signature against message + public key         |
| `ubichain_bip44_path`       | Generate or parse a BIP44 derivation path               |

## Install

Registered via the `pi.extensions` field in the root `package.json`:

```json
"pi": { "extensions": ["packages/pi/extensions/ubichain.ts"] }
```

Pi loads the extension automatically. It imports the built library from `dist/` (`ubichain`); in dev before a build it falls back to `src/index.ts`.

## Requirements

- A built library (`pnpm build`) for production resolution of the `ubichain` import.
- Dev deps `@earendil-works/pi-coding-agent`, `@earendil-works/pi-tui`, `typebox`.

## Security note

`ubichain_generate_wallet` and `ubichain_sign_message` return the **plaintext private key / signature** in tool output, which lands in the agent transcript.

> [!CAUTION]
> **Never — ever — use this with real funds or with any wallet that has ever been used.** Treat every key it touches as burned the moment it appears in tool output. Generate fresh throwaway keys for testing only; assume anything passing through this extension is compromised and discard it. Real-funds keys belong on a hardware wallet, never in an agent transcript.
