// Admin configuration for pool creation
// Only these wallets can create liquidity pools

export const ADMIN_WALLETS = [
  // Your parent/project wallet address
  '52xR5CuemRBRv3389vEhAeKcg6bTY9Tss7tm7TenXczm',
  
  // Add additional admin wallets if needed
  // 'ANOTHER_ADMIN_WALLET_ADDRESS',
];

export const PROJECT_CONFIG = {
  // Your project's token details
  QTC_MINT: '6diASnAchdpwsiqvvi7rcfgztXNbA3RbvSzJXa6BX3iE',
  
  // Conservative pricing
  INITIAL_RATES: {
    QTC_SOL: 0.001,  // 1 QTC = 0.001 SOL
    QTC_USDC: 0.10   // 1 QTC = $0.10 USDC
  },
  
  // Initial liquidity amounts (for admin pool creation)
  INITIAL_LIQUIDITY: {
    QTC_SOL: {
      qtc: 20000,  // 20K QTC
      sol: 20      // 20 SOL
    },
    QTC_USDC: {
      qtc: 10000,  // 10K QTC  
      usdc: 1000   // 1000 USDC
    }
  }
};

export function isAdminWallet(walletAddress: string): boolean {
  return ADMIN_WALLETS.includes(walletAddress);
}