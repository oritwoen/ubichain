import * as bip39 from '@scure/bip39';
import * as english from '@scure/bip39/wordlists/english';

// Get English wordlist
const wordlist = english.wordlist;

// Re-export main functionality with default wordlist
export const generateMnemonic = (strength = 128) => bip39.generateMnemonic(wordlist, strength);
export const validateMnemonic = (mnemonic: string) => bip39.validateMnemonic(mnemonic, wordlist);
export const mnemonicToSeed = bip39.mnemonicToSeedSync;
export const mnemonicToEntropy = (mnemonic: string) => bip39.mnemonicToEntropy(mnemonic, wordlist);
export const entropyToMnemonic = (entropy: Uint8Array) => bip39.entropyToMnemonic(entropy, wordlist);

// Re-export original components
export { bip39 };
export { wordlist };
