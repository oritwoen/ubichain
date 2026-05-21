import { blake2b } from "@noble/hashes/blake2.js";
import { hexToBytes } from "@noble/hashes/utils.js";
import { generateKeyPublic as getEd25519KeyPublic } from "../utils/ed25519.ts";
import { ed25519SignMessage, ed25519VerifyMessage } from "../utils/ed25519-chains.ts";
import { bech32 } from "@scure/base";
import type { Curve, KeyOptions, Options, BlockchainImplementation } from "../types.ts";

export default function cardano(options?: Options) {
  const name = "cardano";
  const curve: Curve = "ed25519";
  const network = options?.network || "mainnet";
  const bip44 = 1815; // SLIP-0044 index for Cardano

  const networkId = network === "testnet" ? 0 : 1;

  const ADDRESS_TYPE = {
    BASE_PAYMENT: 0,
    ENTERPRISE_KEY: 6,
    REWARD_KEY: 14,
  };

  /**
   * Get public key from private key using Ed25519 curve
   *
   * @param keyPrivate - The private key as a hex string
   * @param options - Optional parameters
   * @returns Public key as hex string
   */
  function getKeyPublic(keyPrivate: string, _options?: KeyOptions): string {
    return getEd25519KeyPublic(keyPrivate);
  }

  /**
   * Get Cardano key hash from public key
   *
   * @param keyPublic - Public key as hex string
   * @returns Hashed key bytes
   */
  function getKeyHash(keyPublic: string): Uint8Array {
    // Convert public key to bytes
    const keyPublicBytes = hexToBytes(keyPublic);

    // Hash the public key with blake2b-224 for Cardano addresses
    return blake2b(keyPublicBytes, { dkLen: 28 }); // 28 bytes = 224 bits
  }

  function encodeAddress(hrp: string, header: number, payload: Uint8Array): string {
    const bytes = new Uint8Array(1 + payload.length);
    bytes[0] = header;
    bytes.set(payload, 1);
    return bech32.encode(hrp, bech32.toWords(bytes), false);
  }

  function header(addressType: number): number {
    return (addressType << 4) | networkId;
  }

  function getAddress(keyPublic: string, type?: string): string {
    const keyHash = getKeyHash(keyPublic);

    if (type === "stake") {
      return encodeAddress(
        network === "testnet" ? "stake_test" : "stake",
        header(ADDRESS_TYPE.REWARD_KEY),
        keyHash,
      );
    }

    if (type === "enterprise") {
      return encodeAddress(
        network === "testnet" ? "addr_test" : "addr",
        header(ADDRESS_TYPE.ENTERPRISE_KEY),
        keyHash,
      );
    }

    const basePayload = new Uint8Array(keyHash.length * 2);
    basePayload.set(keyHash);
    basePayload.set(keyHash, keyHash.length);
    return encodeAddress(
      network === "testnet" ? "addr_test" : "addr",
      header(ADDRESS_TYPE.BASE_PAYMENT),
      basePayload,
    );
  }

  function validateAddress(address: string): boolean {
    try {
      const decoded = bech32.decode(address, false);
      const bytes = bech32.fromWords(decoded.words);
      if (bytes.length === 0) return false;

      const addressNetwork = bytes[0] & 0x0f;
      const addressType = bytes[0] >> 4;
      if (addressNetwork !== networkId) return false;

      if (decoded.prefix === (network === "testnet" ? "stake_test" : "stake")) {
        return addressType === ADDRESS_TYPE.REWARD_KEY && bytes.length === 29;
      }

      if (decoded.prefix !== (network === "testnet" ? "addr_test" : "addr")) {
        return false;
      }

      if (addressType === ADDRESS_TYPE.BASE_PAYMENT) return bytes.length === 57;
      if (addressType === ADDRESS_TYPE.ENTERPRISE_KEY) return bytes.length === 29;
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Signs a message using Ed25519 for Cardano
   *
   * @param message - The message to sign
   * @param keyPrivate - The private key
   * @param options - Optional parameters
   * @returns The signature as a hex string
   */
  function signMessage(
    message: string | Uint8Array,
    keyPrivate: string,
    options?: KeyOptions,
  ): string {
    return ed25519SignMessage(message, keyPrivate, options);
  }

  /**
   * Verifies a message signature for Cardano
   *
   * @param message - The original message
   * @param signature - The signature to verify
   * @param keyPublic - The public key
   * @param options - Optional parameters
   * @returns Whether the signature is valid
   */
  function verifyMessage(
    message: string | Uint8Array,
    signature: string,
    keyPublic: string,
    options?: KeyOptions,
  ): boolean {
    return ed25519VerifyMessage(message, signature, keyPublic, options);
  }

  return {
    name,
    curve,
    network,
    bip44,
    getKeyPublic,
    getAddress,
    validateAddress,
    signMessage,
    verifyMessage,
  } satisfies BlockchainImplementation;
}
