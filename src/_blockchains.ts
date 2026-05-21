import type { Options, BlockchainImplementation } from "./types.ts";

type BlockchainFactory = (options?: Options) => BlockchainImplementation;
type BlockchainModule = { default: BlockchainFactory };

/**
 * Creates a lazy-loaded blockchain factory.
 * The import is deferred until the returned async function is called.
 */
function lazy(loader: () => Promise<BlockchainModule>) {
  return (options?: Options) => async (): Promise<BlockchainImplementation> => {
    const { default: create } = await loader();
    return create(options);
  };
}

/**
 * Blockchain implementations with lazy loading for improved performance and reduced bundle size
 */
export const blockchains = {
  bitcoin: lazy(() => import("./blockchains/bitcoin.ts")),
  solana: lazy(() => import("./blockchains/solana.ts")),
  aptos: lazy(() => import("./blockchains/aptos.ts")),
  tron: lazy(() => import("./blockchains/tron.ts")),
  sui: lazy(() => import("./blockchains/sui.ts")),
  ethereum: lazy(() => import("./blockchains/ethereum.ts")),
  base: lazy(() => import("./blockchains/base.ts")),
  cardano: lazy(() => import("./blockchains/cardano.ts")),
};
