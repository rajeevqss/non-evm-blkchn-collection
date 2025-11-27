import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

interface PoolInfo {
  exists: boolean;
  address?: string;
  tokenA: string;
  tokenB: string;
  liquidity: {
    tokenA: number;
    tokenB: number;
  };
  totalValueLocked: number;
}

interface OrcaPoolsState {
  qtcSolPool: PoolInfo | null;
  qtcUsdcPool: PoolInfo | null;
  loading: boolean;
  error: string | null;
}

const QTC_MINT = '6diASnAchdpwsiqvvi7rcfgztXNbA3RbvSzJXa6BX3iE';
const DEVNET_USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
const SOL_MINT = 'So11111111111111111111111111111111111111112';

// Simulated pool storage for devnet (in real implementation, this would be on-chain)
const DEVNET_POOL_STORAGE_KEY = 'orca_devnet_pools';

interface StoredPool {
  tokenA: string;
  tokenB: string;
  creator: string;
  liquidity: { tokenA: number; tokenB: number };
  created: number;
}

export function useOrcaPools() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  
  const [poolsState, setPoolsState] = useState<OrcaPoolsState>({
    qtcSolPool: null,
    qtcUsdcPool: null,
    loading: false,
    error: null
  });

  // Load pools from local storage (simulating on-chain pool registry)
  const loadStoredPools = () => {
    try {
      const stored = localStorage.getItem(DEVNET_POOL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Save pool to local storage (simulating pool creation on-chain)
  const savePool = (pool: StoredPool) => {
    const pools = loadStoredPools();
    pools.push(pool);
    localStorage.setItem(DEVNET_POOL_STORAGE_KEY, JSON.stringify(pools));
  };

  // Check if pool exists
  const findPool = (tokenA: string, tokenB: string): StoredPool | null => {
    const pools = loadStoredPools();
    return pools.find((pool: StoredPool) => 
      (pool.tokenA === tokenA && pool.tokenB === tokenB) ||
      (pool.tokenA === tokenB && pool.tokenB === tokenA)
    ) || null;
  };

  // Fetch pool information
  const fetchPools = async () => {
    setPoolsState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check for QTC/SOL pool
      const qtcSolStored = findPool(QTC_MINT, SOL_MINT);
      const qtcSolPool: PoolInfo = qtcSolStored ? {
        exists: true,
        address: 'simulated-qtc-sol-pool',
        tokenA: QTC_MINT,
        tokenB: SOL_MINT,
        liquidity: qtcSolStored.liquidity,
        totalValueLocked: (qtcSolStored.liquidity.tokenA * 0.001 + qtcSolStored.liquidity.tokenB) * 100 // Assuming SOL = $100
      } : {
        exists: false,
        tokenA: QTC_MINT,
        tokenB: SOL_MINT,
        liquidity: { tokenA: 0, tokenB: 0 },
        totalValueLocked: 0
      };

      // Check for QTC/USDC pool
      const qtcUsdcStored = findPool(QTC_MINT, DEVNET_USDC_MINT);
      const qtcUsdcPool: PoolInfo = qtcUsdcStored ? {
        exists: true,
        address: 'simulated-qtc-usdc-pool',
        tokenA: QTC_MINT,
        tokenB: DEVNET_USDC_MINT,
        liquidity: qtcUsdcStored.liquidity,
        totalValueLocked: qtcUsdcStored.liquidity.tokenA * 0.10 + qtcUsdcStored.liquidity.tokenB // QTC at $0.10
      } : {
        exists: false,
        tokenA: QTC_MINT,
        tokenB: DEVNET_USDC_MINT,
        liquidity: { tokenA: 0, tokenB: 0 },
        totalValueLocked: 0
      };

      setPoolsState({
        qtcSolPool,
        qtcUsdcPool,
        loading: false,
        error: null
      });

    } catch (error: any) {
      console.error('Error fetching pools:', error);
      setPoolsState(prev => ({
        ...prev,
        loading: false,
        error: `Failed to fetch pools: ${error.message}`
      }));
    }
  };

  // Create a new pool
  const createPool = async (
    tokenA: string, 
    tokenB: string, 
    liquidityA: number, 
    liquidityB: number
  ) => {
    if (!connected || !publicKey) {
      throw new Error('Wallet not connected');
    }

    // Check if pool already exists
    const existing = findPool(tokenA, tokenB);
    if (existing) {
      throw new Error('Pool already exists');
    }

    // Simulate pool creation
    console.log(`Creating pool: ${tokenA.slice(0, 8)}.../${tokenB.slice(0, 8)}...`);
    console.log(`Initial liquidity: ${liquidityA} / ${liquidityB}`);
    
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction time

    // Save pool to storage
    const newPool: StoredPool = {
      tokenA,
      tokenB,
      creator: publicKey.toString(),
      liquidity: { tokenA: liquidityA, tokenB: liquidityB },
      created: Date.now()
    };

    savePool(newPool);
    
    // Refresh pools
    await fetchPools();
    
    return newPool;
  };

  // Add liquidity to existing pool
  const addLiquidity = async (
    tokenA: string,
    tokenB: string,
    amountA: number,
    amountB: number
  ) => {
    if (!connected || !publicKey) {
      throw new Error('Wallet not connected');
    }

    const existingPool = findPool(tokenA, tokenB);
    if (!existingPool) {
      throw new Error('Pool does not exist');
    }

    console.log(`Adding liquidity: +${amountA} ${tokenA.slice(0, 8)}... / +${amountB} ${tokenB.slice(0, 8)}...`);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update liquidity in storage
    existingPool.liquidity.tokenA += amountA;
    existingPool.liquidity.tokenB += amountB;
    
    const pools = loadStoredPools();
    const index = pools.findIndex((p: StoredPool) => 
      (p.tokenA === tokenA && p.tokenB === tokenB) ||
      (p.tokenA === tokenB && p.tokenB === tokenA)
    );
    
    if (index >= 0) {
      pools[index] = existingPool;
      localStorage.setItem(DEVNET_POOL_STORAGE_KEY, JSON.stringify(pools));
    }

    await fetchPools();
  };

  // Perform swap through pool
  const performSwap = async (
    fromToken: string,
    toToken: string,
    fromAmount: number
  ): Promise<number> => {
    if (!connected || !publicKey) {
      throw new Error('Wallet not connected');
    }

    const pool = findPool(fromToken, toToken);
    if (!pool) {
      throw new Error('Pool does not exist');
    }

    // Simple constant product formula calculation (x * y = k)
    const reserveFrom = fromToken === pool.tokenA ? pool.liquidity.tokenA : pool.liquidity.tokenB;
    const reserveTo = fromToken === pool.tokenA ? pool.liquidity.tokenB : pool.liquidity.tokenA;
    
    // Calculate output using AMM formula with 0.3% fee
    const k = reserveFrom * reserveTo;
    const newReserveFrom = reserveFrom + (fromAmount * 0.997); // 0.3% fee
    const newReserveTo = k / newReserveFrom;
    const outputAmount = reserveTo - newReserveTo;

    console.log(`Swap: ${fromAmount} ${fromToken.slice(0, 8)}... → ${outputAmount.toFixed(6)} ${toToken.slice(0, 8)}...`);
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Update pool reserves
    if (fromToken === pool.tokenA) {
      pool.liquidity.tokenA = newReserveFrom;
      pool.liquidity.tokenB = newReserveTo;
    } else {
      pool.liquidity.tokenB = newReserveFrom;
      pool.liquidity.tokenA = newReserveTo;
    }

    // Save updated pool
    const pools = loadStoredPools();
    const index = pools.findIndex((p: StoredPool) => 
      (p.tokenA === fromToken && p.tokenB === toToken) ||
      (p.tokenA === toToken && p.tokenB === fromToken)
    );
    
    if (index >= 0) {
      pools[index] = pool;
      localStorage.setItem(DEVNET_POOL_STORAGE_KEY, JSON.stringify(pools));
    }

    await fetchPools();
    
    return outputAmount;
  };

  // Load pools on component mount
  useEffect(() => {
    fetchPools();
  }, [connected, publicKey]);

  return {
    pools: poolsState,
    createPool,
    addLiquidity,
    performSwap,
    refreshPools: fetchPools
  };
}