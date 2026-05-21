import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import * as ubichain from "../src";

// Function to convert hex to byte array
function hexToBytes(hex: string): Uint8Array {
  if (hex.startsWith("0x")) hex = hex.slice(2);
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// Function to convert byte array to hex
function bytesToHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

void (async () => {
  const solanaKeypair = Keypair.generate();
  const solanaPrivateKeyHex = bytesToHex(solanaKeypair.secretKey.slice(0, 32));
  const solanaPublicKeyHex = bytesToHex(solanaKeypair.publicKey.toBytes());
  const solanaPublicKeyBase58 = solanaKeypair.publicKey.toBase58();

  console.log("===== Solana Web3.js Keys =====");
  console.log("Private Key (hex):", solanaPrivateKeyHex);
  console.log("Public Key (hex):", solanaPublicKeyHex);
  console.log("Public Key (base58):", solanaPublicKeyBase58);

  const solanaBlockchain = ubichain.useBlockchain(await ubichain.blockchains.solana()());
  const ubichainPublicKey = solanaBlockchain.getKeyPublic(solanaPrivateKeyHex);
  const ubichainAddress = solanaBlockchain.getAddress(ubichainPublicKey);

  console.log("\n===== Ubichain Keys =====");
  console.log("Private Key (hex):", solanaPrivateKeyHex);
  console.log("Public Key (hex):", ubichainPublicKey);
  console.log("Address (base58):", ubichainAddress);

  const message = "Test message for Solana signature";
  const messageBytes = new TextEncoder().encode(message);
  const solanaSignature = nacl.sign.detached(messageBytes, solanaKeypair.secretKey);

  console.log("\n===== Signatures =====");
  console.log("Solana/tweetnacl Signature (hex):", bytesToHex(solanaSignature));

  const ubichainSignature = solanaBlockchain.signMessage(message, solanaPrivateKeyHex);
  console.log("Ubichain Signature (hex):", ubichainSignature);

  const solanaVerified = nacl.sign.detached.verify(
    messageBytes,
    solanaSignature,
    solanaKeypair.publicKey.toBytes(),
  );

  const ubichainVerified = solanaBlockchain.verifyMessage(
    message,
    ubichainSignature,
    ubichainPublicKey,
  );

  console.log("\n===== Verification =====");
  console.log("Solana/tweetnacl verification:", solanaVerified);
  console.log("Ubichain verification:", ubichainVerified);

  console.log("\n===== Cross Verification =====");
  const solanaSignatureVerifiedByUbichain = solanaBlockchain.verifyMessage(
    message,
    bytesToHex(solanaSignature),
    solanaPublicKeyHex,
  );
  const ubichainSignatureVerifiedByNacl = nacl.sign.detached.verify(
    messageBytes,
    hexToBytes(ubichainSignature),
    solanaKeypair.publicKey.toBytes(),
  );
  console.log(
    "Solana/tweetnacl signature verified by ubichain:",
    solanaSignatureVerifiedByUbichain,
  );
  console.log("Ubichain signature verified by tweetnacl:", ubichainSignatureVerifiedByNacl);
})();
