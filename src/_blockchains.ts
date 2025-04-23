import type { Options } from './types'

/**
 * Blockchain implementations with lazy loading for improved performance and reduced bundle size
 */
export const blockchains = {
  /**
   * Bitcoin blockchain implementation
   */
  bitcoin: (options?: Options) => {
    return async () => {
      const { default: impl } = await import('./blockchains/bitcoin')
      return impl(options)
    }
  },

  /**
   * Solana blockchain implementation
   */
  solana: (options?: Options) => {
    return async () => {
      const { default: impl } = await import('./blockchains/solana')
      return impl(options)
    }
  },

  /**
   * Aptos blockchain implementation
   */
  aptos: (options?: Options) => {
    return async () => {
      const { default: impl } = await import('./blockchains/aptos')
      return impl(options)
    }
  },

  /**
   * Tron blockchain implementation
   */
  tron: (options?: Options) => {
    return async () => {
      const { default: impl } = await import('./blockchains/tron')
      return impl(options)
    }
  },

  /**
   * Sui blockchain implementation
   */
  sui: (options?: Options) => {
    return async () => {
      const { default: impl } = await import('./blockchains/sui')
      return impl(options)
    }
  },

  /**
   * Ethereum blockchain implementation
   */
  ethereum: (options?: Options) => {
    return async () => {
      const { default: impl } = await import('./blockchains/ethereum')
      return impl(options)
    }
  },

  /**
   * Base blockchain implementation
   */
  base: (options?: Options) => {
    return async () => {
      const { default: impl } = await import('./blockchains/base')
      return impl(options)
    }
  },

  /**
   * Cardano blockchain implementation
   */
  cardano: (options?: Options) => {
    return async () => {
      const { default: impl } = await import('./blockchains/cardano')
      return impl(options)
    }
  }
}