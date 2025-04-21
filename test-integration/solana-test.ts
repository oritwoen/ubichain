import { Keypair } from '@solana/web3.js';
import { webcrypto as _webcrypto } from 'node:crypto';
import * as ubichain from '../src';

// Function to convert hex to byte array
function hexToBytes(hex: string): Uint8Array {
  if (hex.startsWith('0x')) hex = hex.slice(2);
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

// Function to convert byte array to hex
function bytesToHex(bytes: Uint8Array): string {
  return [...bytes]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Create keys using Solana Web3.js
const solanaKeypair = Keypair.generate();
const solanaPrivateKeyHex = bytesToHex(solanaKeypair.secretKey.slice(0, 32));
const solanaPublicKeyHex = bytesToHex(solanaKeypair.publicKey.toBytes());
const solanaPublicKeyBase58 = solanaKeypair.publicKey.toBase58();

console.log('===== Solana Web3.js Keys =====');
console.log('Private Key (hex):', solanaPrivateKeyHex);
console.log('Public Key (hex):', solanaPublicKeyHex);
console.log('Public Key (base58):', solanaPublicKeyBase58);

// Create identical keys using ubichain
const solanaBlockchain = ubichain.blockchains.solana();
const ubichainPublicKey = solanaBlockchain.getKeyPublic(solanaPrivateKeyHex);
const ubichainAddress = solanaBlockchain.getAddress(ubichainPublicKey);

console.log('\n===== Ubichain Keys =====');
console.log('Private Key (hex):', solanaPrivateKeyHex);
console.log('Public Key (hex):', ubichainPublicKey);
console.log('Address (base58):', ubichainAddress);

// Sign message using both libraries
const message = 'Test message for Solana signature';

// Sign using Solana Web3.js
const solanaSignature = Keypair.fromSecretKey(
  new Uint8Array([...hexToBytes(solanaPrivateKeyHex), ...new Uint8Array(32)])
).sign(new TextEncoder().encode(message));

console.log('\n===== Signatures =====');
console.log('Solana Web3.js Signature (hex):', bytesToHex(solanaSignature));

// Sign using ubichain
const ubichainSignature = solanaBlockchain.signMessage(message, solanaPrivateKeyHex);
console.log('Ubichain Signature (hex):', ubichainSignature);

// Verify signatures
const solanaVerified = Keypair.fromSecretKey(
  new Uint8Array([...hexToBytes(solanaPrivateKeyHex), ...new Uint8Array(32)])
).publicKey.verify(
  new TextEncoder().encode(message),
  solanaSignature
);

const ubichainVerified = solanaBlockchain.verifyMessage(
  message,
  ubichainSignature,
  ubichainPublicKey
);

console.log('\n===== Verification =====');
console.log('Solana Web3.js verification:', solanaVerified);
console.log('Ubichain verification:', ubichainVerified);

// Check compatibility between libraries
console.log('\n===== Cross Verification =====');
try {
  const crossVerified = Keypair.fromSecretKey(
    new Uint8Array([...hexToBytes(solanaPrivateKeyHex), ...new Uint8Array(32)])
  ).publicKey.verify(
    new TextEncoder().encode(message),
    hexToBytes(ubichainSignature)
  );
  console.log('Ubichain signature verified by Solana Web3.js:', crossVerified);
} catch (error) {
  console.error('Error during cross verification:', error.message);
}