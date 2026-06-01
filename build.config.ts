import { defineBuildConfig } from "obuild/config";

export default defineBuildConfig({
  entries: [
    {
      type: "bundle",
      input: [
        "./src/index.ts",
        "./src/blockchains/aptos.ts",
        "./src/blockchains/base.ts",
        "./src/blockchains/bitcoin.ts",
        "./src/blockchains/cardano.ts",
        "./src/blockchains/ethereum.ts",
        "./src/blockchains/solana.ts",
        "./src/blockchains/sui.ts",
        "./src/blockchains/tron.ts",
      ],
      license: false,
    },
  ],
});
