export enum NetworkEnvironment {
  MAINNET = 'mainnet',
  DEVNET = 'devnet'
}

// Current network - change this to switch networks
export const CURRENT_NETWORK = NetworkEnvironment.DEVNET;

export const NETWORK_CONFIG = {
  [NetworkEnvironment.MAINNET]: {
    name: 'Mainnet',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    jupiterQuoteApi: 'https://lite-api.jup.ag/swap/v1/quote',
    jupiterSwapApi: 'https://lite-api.jup.ag/swap/v1/swap',
    explorerUrl: 'https://solscan.io',
    hasJupiterSupport: true
  },
  [NetworkEnvironment.DEVNET]: {
    name: 'Devnet', 
    rpcUrl: 'https://api.devnet.solana.com',
    jupiterQuoteApi: null, // Jupiter doesn't officially support devnet
    jupiterSwapApi: null,
    explorerUrl: 'https://solscan.io/?cluster=devnet',
    hasJupiterSupport: false
  }
};

export const getCurrentNetworkConfig = () => NETWORK_CONFIG[CURRENT_NETWORK];