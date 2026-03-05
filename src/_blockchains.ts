import type { Options, BlockchainImplementation } from './types'

type BlockchainFactory = (options?: Options) => BlockchainImplementation
type BlockchainModule = { default: BlockchainFactory }

/**
 * Creates a lazy-loaded blockchain factory.
 * The import is deferred until the returned async function is called.
 */
function lazy(loader: () => Promise<BlockchainModule>) {
  return (options?: Options) => async (): Promise<BlockchainImplementation> => {
    const { default: create } = await loader()
    return create(options)
  }
}

/**
 * Blockchain implementations with lazy loading for improved performance and reduced bundle size
 */
export const blockchains = {
  bitcoin: lazy(() => import('./blockchains/bitcoin')),
  solana: lazy(() => import('./blockchains/solana')),
  aptos: lazy(() => import('./blockchains/aptos')),
  tron: lazy(() => import('./blockchains/tron')),
  sui: lazy(() => import('./blockchains/sui')),
  ethereum: lazy(() => import('./blockchains/ethereum')),
  base: lazy(() => import('./blockchains/base')),
  cardano: lazy(() => import('./blockchains/cardano')),
}