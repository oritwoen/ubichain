import { useBlockchain, BIP44, BIP44Change, getBIP44Path, getBlockchainPath } from '../src';
import bitcoin from '../src/blockchains/bitcoin';
import ethereum from '../src/blockchains/ethereum';
import solana from '../src/blockchains/solana';
import cardano from '../src/blockchains/cardano';
import tron from '../src/blockchains/tron';
import aptos from '../src/blockchains/aptos';
import sui from '../src/blockchains/sui';
import base from '../src/blockchains/base';

import { mnemonicToSeed } from '../src/utils/bip39';
import { getMasterKeyFromSeed as bip32MasterKey, deriveHDKey as bip32Derive } from '../src/utils/bip32';
import { getMasterKeyFromSeed as slip10MasterKey, deriveHDKey as slip10Derive } from '../src/utils/slip10';

// Create blockchain instances
const chains = [
  useBlockchain(bitcoin()),
  useBlockchain(ethereum()),
  useBlockchain(solana()),
  useBlockchain(cardano()),
  useBlockchain(tron()),
  useBlockchain(aptos()),
  useBlockchain(sui()),
  useBlockchain(base()),
];

// Display BIP44 codes for each blockchain
console.log('BIP44 Coin Types:');
chains.forEach(chain => {
  console.log(`${chain.name}: ${chain.bip44}`);
});

// Generate BIP44 paths for different blockchains
console.log('\nBIP44 Derivation Paths:');
chains.forEach(chain => {
  const path = getBlockchainPath(chain);
  console.log(`${chain.name}: ${path}`);
});

// Create paths with different accounts and address indexes
console.log('\nBIP44 Paths for Bitcoin with different accounts:');
for (let account = 0; account < 3; account++) {
  const path = getBlockchainPath(chains[0], account);
  console.log(`Account ${account}: ${path}`);
}

// Demonstrate change addresses (external vs internal)
console.log('\nBIP44 Paths for Ethereum with external/internal chains:');
const externalPath = getBlockchainPath(chains[1], 0, BIP44Change.EXTERNAL);
const internalPath = getBlockchainPath(chains[1], 0, BIP44Change.INTERNAL);
console.log(`External (receiving): ${externalPath}`);
console.log(`Internal (change): ${internalPath}`);

// Generate multiple address indexes
console.log('\nBIP44 Paths for Solana with multiple address indexes:');
for (let index = 0; index < 5; index++) {
  const path = getBlockchainPath(chains[2], 0, BIP44Change.EXTERNAL, index);
  console.log(`Address index ${index}: ${path}`);
}

// Demo with a test mnemonic and deriving keys across multiple chains
const testMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
const testSeed = mnemonicToSeed(testMnemonic);

// Generate the master keys
const bipMasterKey = bip32MasterKey(testSeed);
const slipMasterKey = slip10MasterKey(testSeed);

console.log('\nMulti-chain wallet from single seed:');

// Derive keys for each blockchain
chains.forEach(chain => {
  const path = getBlockchainPath(chain);
  if (!path) {
    console.log(`${chain.name}: Path derivation not supported`);
    return;
  }

  try {
    // Use BIP32 for secp256k1 chains and SLIP-10 for ed25519 chains
    const key = chain.curve === 'secp256k1' || (Array.isArray(chain.curve) && chain.curve.includes('secp256k1'))
      ? bip32Derive(bipMasterKey, path)
      : slip10Derive(slipMasterKey, path, true);
    
    const privateKey = Buffer.from(
      chain.curve === 'secp256k1' || (Array.isArray(chain.curve) && chain.curve.includes('secp256k1'))
        ? key.privateKey!
        : key.privateKey
    ).toString('hex');
    
    console.log(`${chain.name} (${path}): ${privateKey}`);
  } catch (error) {
    console.log(`${chain.name}: Error deriving key - ${error.message}`);
  }
});