import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

interface TokenBalance {
  sol: number;
  qtc: number;
  usdc: number;
  loading: boolean;
  error: string | null;
}

interface TokenAccount {
  mint: string;
  owner: string;
  amount: string;
  decimals: number;
}

const QTC_MINT = '6diASnAchdpwsiqvvi7rcfgztXNbA3RbvSzJXa6BX3iE';
const DEVNET_USDC_MINT = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';

export function useTokenBalances() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  
  const [balances, setBalances] = useState<TokenBalance>({
    sol: 0,
    qtc: 0,
    usdc: 0,
    loading: false,
    error: null
  });

  const fetchBalances = async () => {
    if (!connected || !publicKey) {
      setBalances({
        sol: 0,
        qtc: 0,
        usdc: 0,
        loading: false,
        error: null
      });
      return;
    }

    setBalances(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('💰 Fetching balances for wallet:', publicKey.toString());
      
      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      const solAmount = solBalance / LAMPORTS_PER_SOL;
      
      console.log('• SOL balance (lamports):', solBalance);
      console.log('• SOL balance (SOL):', solAmount);

      // Fetch SPL token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      let qtcAmount = 0;
      let usdcAmount = 0;

      // Parse token accounts
      tokenAccounts.value.forEach((accountInfo) => {
        const parsedInfo = accountInfo.account.data.parsed.info;
        const mint = parsedInfo.mint;
        const amount = parseFloat(parsedInfo.tokenAmount.uiAmount) || 0;

        if (mint === QTC_MINT) {
          qtcAmount = amount;
        } else if (mint === DEVNET_USDC_MINT) {
          usdcAmount = amount;
        }
      });

      setBalances({
        sol: solAmount,
        qtc: qtcAmount,
        usdc: usdcAmount,
        loading: false,
        error: null
      });

    } catch (error: any) {
      console.error('Error fetching balances:', error);
      setBalances(prev => ({
        ...prev,
        loading: false,
        error: `Failed to fetch balances: ${error.message}`
      }));
    }
  };

  // Fetch balances only on wallet connection change
  useEffect(() => {
    fetchBalances();
  }, [connected, publicKey, connection]);

  return {
    balances,
    refreshBalances: fetchBalances
  };
}