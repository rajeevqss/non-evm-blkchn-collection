'use client';

import { useState, useEffect } from 'react';
import { QTCContractClient, ContractInfo, WalletBalances, TransactionResult } from '@/lib/qtc-contract-client';

// Method information for tooltips
const methodInfo = {
  // Account Management
  getAccountInfo: {
    syntax: 'connection.getAccountInfo(publicKey, options?)',
    params: 'publicKey: PublicKey, options?: GetAccountInfoConfig',
    description: 'Returns account information for a given public key',
    docs: 'https://docs.solana.com/api/http#getaccountinfo'
  },
  getMultipleAccounts: {
    syntax: 'connection.getMultipleAccounts(publicKeys, options?)',
    params: 'publicKeys: PublicKey[], options?: GetMultipleAccountsConfig',
    description: 'Returns account information for multiple accounts',
    docs: 'https://docs.solana.com/api/http#getmultipleaccounts'
  },
  getProgramAccounts: {
    syntax: 'connection.getProgramAccounts(programId, options?)',
    params: 'programId: PublicKey, options?: GetProgramAccountsConfig',
    description: 'Returns all accounts owned by the provided program',
    docs: 'https://docs.solana.com/api/http#getprogramaccounts'
  },
  getBalance: {
    syntax: 'connection.getBalance(publicKey, options?)',
    params: 'publicKey: PublicKey, options?: Commitment',
    description: 'Returns the SOL balance of the account',
    docs: 'https://docs.solana.com/api/http#getbalance'
  },
  getTokenAccountsByOwner: {
    syntax: 'connection.getTokenAccountsByOwner(owner, filter, options?)',
    params: 'owner: PublicKey, filter: TokenAccountsFilter, options?: GetTokenAccountsByOwnerConfig',
    description: 'Returns all SPL token accounts by token owner',
    docs: 'https://docs.solana.com/api/http#gettokenaccountsbyowner'
  },
  // Transaction Operations
  sendTransaction: {
    syntax: 'connection.sendTransaction(transaction, signers, options?)',
    params: 'transaction: Transaction, signers: Signer[], options?: SendOptions',
    description: 'Submits a signed transaction to the network',
    docs: 'https://docs.solana.com/api/http#sendtransaction'
  },
  confirmTransaction: {
    syntax: 'connection.confirmTransaction(signature, options?)',
    params: 'signature: string, options?: ConfirmOptions',
    description: 'Confirms a transaction by signature',
    docs: 'https://docs.solana.com/api/http#getsignaturestatuses'
  },
  getTransaction: {
    syntax: 'connection.getTransaction(signature, options?)',
    params: 'signature: string, options?: GetTransactionConfig',
    description: 'Returns transaction details for a confirmed transaction',
    docs: 'https://docs.solana.com/api/http#gettransaction'
  },
  getSignatureStatuses: {
    syntax: 'connection.getSignatureStatuses(signatures, options?)',
    params: 'signatures: string[], options?: GetSignatureStatusesConfig',
    description: 'Returns the statuses of a list of signatures',
    docs: 'https://docs.solana.com/api/http#getsignaturestatuses'
  },
  getConfirmedSignatures: {
    syntax: 'connection.getSignaturesForAddress(address, options?)',
    params: 'address: PublicKey, options?: SignaturesForAddressOptions',
    description: 'Returns confirmed signatures for transactions involving an address',
    docs: 'https://docs.solana.com/api/http#getsignaturesforaddress'
  },
  // Network & Blockchain
  getSlot: {
    syntax: 'connection.getSlot(options?)',
    params: 'options?: Commitment',
    description: 'Returns the current slot the node is processing',
    docs: 'https://docs.solana.com/api/http#getslot'
  },
  getBlockHeight: {
    syntax: 'connection.getBlockHeight(options?)',
    params: 'options?: Commitment',
    description: 'Returns the current block height',
    docs: 'https://docs.solana.com/api/http#getblockheight'
  },
  getRecentBlockhash: {
    syntax: 'connection.getRecentBlockhash(options?)',
    params: 'options?: Commitment',
    description: 'Returns a recent block hash (DEPRECATED - use getLatestBlockhash)',
    docs: 'https://docs.solana.com/api/http#getlatestblockhash'
  },
  getEpochInfo: {
    syntax: 'connection.getEpochInfo(options?)',
    params: 'options?: Commitment',
    description: 'Returns information about the current epoch',
    docs: 'https://docs.solana.com/api/http#getepochinfo'
  },
  getVersion: {
    syntax: 'connection.getVersion()',
    params: 'None',
    description: 'Returns the current Solana versions running on the node',
    docs: 'https://docs.solana.com/api/http#getversion'
  },
  // Validator & Network
  getClusterNodes: {
    syntax: 'connection.getClusterNodes()',
    params: 'None',
    description: 'Returns information about all nodes in the cluster',
    docs: 'https://docs.solana.com/api/http#getclusternodes'
  },
  getVoteAccounts: {
    syntax: 'connection.getVoteAccounts(options?)',
    params: 'options?: GetVoteAccountsConfig',
    description: 'Returns the account info and associated stake for all vote accounts',
    docs: 'https://docs.solana.com/api/http#getvoteaccounts'
  },
  getInflationRate: {
    syntax: 'connection.getInflationRate()',
    params: 'None',
    description: 'Returns the current inflation rate',
    docs: 'https://docs.solana.com/api/http#getinflationrate'
  },
  getSupply: {
    syntax: 'connection.getSupply(options?)',
    params: 'options?: GetSupplyConfig',
    description: 'Returns information about the current supply',
    docs: 'https://docs.solana.com/api/http#getsupply'
  },
  requestAirdrop: {
    syntax: 'connection.requestAirdrop(publicKey, lamports)',
    params: 'publicKey: PublicKey, lamports: number',
    description: 'Requests an airdrop of lamports to a public key (devnet/testnet only)',
    docs: 'https://docs.solana.com/api/http#requestairdrop'
  },
  // Program & Instruction
  simulateTransaction: {
    syntax: 'connection.simulateTransaction(transaction, options?)',
    params: 'transaction: Transaction, options?: SimulateTransactionConfig',
    description: 'Simulates sending a transaction',
    docs: 'https://docs.solana.com/api/http#simulatetransaction'
  },
  getFeeForMessage: {
    syntax: 'connection.getFeeForMessage(message, options?)',
    params: 'message: Message, options?: Commitment',
    description: 'Returns the fee the network will charge for a particular Message',
    docs: 'https://docs.solana.com/api/http#getfeeformessage'
  },
  getLatestBlockhash: {
    syntax: 'connection.getLatestBlockhash(options?)',
    params: 'options?: Commitment',
    description: 'Returns the latest blockhash',
    docs: 'https://docs.solana.com/api/http#getlatestblockhash'
  },
  isBlockhashValid: {
    syntax: 'connection.isBlockhashValid(blockhash, options?)',
    params: 'blockhash: string, options?: IsBlockhashValidConfig',
    description: 'Returns whether a blockhash is still valid',
    docs: 'https://docs.solana.com/api/http#isblockhashvalid'
  },
  getMinimumBalanceForRent: {
    syntax: 'connection.getMinimumBalanceForRentExemption(dataLength, options?)',
    params: 'dataLength: number, options?: Commitment',
    description: 'Returns minimum balance required to make account rent exempt',
    docs: 'https://docs.solana.com/api/http#getminimumbalanceforrentexemption'
  },
  // Token & Supply
  getTokenSupply: {
    syntax: 'connection.getTokenSupply(tokenMintAddress, options?)',
    params: 'tokenMintAddress: PublicKey, options?: Commitment',
    description: 'Returns the total supply of an SPL Token type',
    docs: 'https://docs.solana.com/api/http#gettokensupply'
  },
  getTokenAccountBalance: {
    syntax: 'connection.getTokenAccountBalance(tokenAccount, options?)',
    params: 'tokenAccount: PublicKey, options?: Commitment',
    description: 'Returns the token balance of an SPL Token account',
    docs: 'https://docs.solana.com/api/http#gettokenaccountbalance'
  },
  getTokenLargestAccounts: {
    syntax: 'connection.getTokenLargestAccounts(tokenMintAddress, options?)',
    params: 'tokenMintAddress: PublicKey, options?: Commitment',
    description: 'Returns the 20 largest accounts for a particular SPL Token type',
    docs: 'https://docs.solana.com/api/http#gettokenlargestaccounts'
  },
  getInflationGovernor: {
    syntax: 'connection.getInflationGovernor(options?)',
    params: 'options?: Commitment',
    description: 'Returns the current inflation governor',
    docs: 'https://docs.solana.com/api/http#getinflationgovernor'
  },
  getInflationReward: {
    syntax: 'connection.getInflationReward(addresses, epoch?, options?)',
    params: 'addresses: PublicKey[], epoch?: number, options?: GetInflationRewardConfig',
    description: 'Returns the inflation reward for a list of addresses for an epoch',
    docs: 'https://docs.solana.com/api/http#getinflationreward'
  }
};

// Method tooltip component
const MethodTooltip = ({ methodName, children }: { methodName: string, children: React.ReactNode }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const info = methodInfo[methodName as keyof typeof methodInfo];
  
  if (!info) return <>{children}</>;

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute z-50 w-80 p-4 mt-2 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 left-0 top-full">
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-yellow-400 mb-1">{methodName}</h4>
              <p className="text-xs text-gray-300">{info.description}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-blue-300 mb-1">Syntax:</p>
              <code className="text-xs bg-gray-800 p-2 rounded block text-green-300 break-all">
                {info.syntax}
              </code>
            </div>
            <div>
              <p className="text-xs font-medium text-blue-300 mb-1">Parameters:</p>
              <code className="text-xs bg-gray-800 p-2 rounded block text-orange-300 break-all">
                {info.params}
              </code>
            </div>
            <div className="pt-2 border-t border-gray-700">
              <a
                href={info.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                📖 View Official Documentation
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Explorer() {
  const [client, setClient] = useState<QTCContractClient | null>(null);
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [balances, setBalances] = useState<WalletBalances>({ solBalance: 0, qtcBalance: 0 });
  const [totalSupply, setTotalSupply] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Transfer state
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  
  // Mint state
  const [mintAmount, setMintAmount] = useState('');
  const [isMinting, setIsMinting] = useState(false);
  
  // Check balance state
  const [checkWallet, setCheckWallet] = useState('');
  const [checkedQTCBalance, setCheckedQTCBalance] = useState<number | null>(null);
  const [checkedSOLBalance, setCheckedSOLBalance] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  // Airdrop state
  const [airdropWallet, setAirdropWallet] = useState('');
  const [airdropAmount, setAirdropAmount] = useState('');
  const [isAirdropping, setIsAirdropping] = useState(false);
  
  // Transaction history
  const [lastTransaction, setLastTransaction] = useState<TransactionResult | null>(null);
  
  // Wallet is automatically loaded via code
  const [isWalletLoaded, setIsWalletLoaded] = useState(true);

  useEffect(() => {
    const initializeClient = async () => {
      try {
        const qtcClient = new QTCContractClient();
        setClient(qtcClient);
        
        const info = qtcClient.getContractInfo();
        setContractInfo(info);
        
        const walletBalances = await qtcClient.getWalletBalances();
        setBalances(walletBalances);
        
        const supply = await qtcClient.getQTCTotalSupply();
        setTotalSupply(supply);
        
      } catch (error) {
        console.error('Error initializing client:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeClient();
  }, []);

  const refreshBalances = async () => {
    if (!client) return;
    
    try {
      const walletBalances = await client.getWalletBalances();
      setBalances(walletBalances);
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  };


  const handleTransfer = async () => {
    if (!client || !transferTo || !transferAmount) {
      alert('Please fill in all fields');
      return;
    }

    setIsTransferring(true);
    try {
      // Use real transfer if wallet is loaded, otherwise simulate
      const result = await client.transferTokens(
        transferTo, 
        parseFloat(transferAmount), 
        isWalletLoaded // realTransfer = true if wallet loaded
      );
      
      if (isWalletLoaded && typeof result === 'object') {
        // Real transfer with detailed result
        setLastTransaction(result);
        alert(`✅ Transfer completed!
        
Transaction: ${result.signature}
From: ${result.fromAddress}
To: ${result.toAddress}
Amount: ${result.amount} QTC
Recipient Balance Before: ${result.recipientBalanceBefore} QTC
Recipient Balance After: ${result.recipientBalanceAfter} QTC
        
Check transaction details below or view on Solana Explorer.`);
      } else {
        // Simulation mode
        alert(`🚨 Simulation complete! Transaction ID: ${result}\nLoad your wallet to make real transfers.`);
      }
      
      setTransferTo('');
      setTransferAmount('');
      await refreshBalances();
    } catch (error: any) {
      alert(`❌ Transfer failed: ${error.message}`);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleMint = async () => {
    if (!client || !mintAmount) {
      alert('Please enter mint amount');
      return;
    }

    setIsMinting(true);
    try {
      const txId = await client.mintTokens(parseFloat(mintAmount));
      alert(`Mint request created! Transaction: ${txId}`);
      setMintAmount('');
      await refreshBalances();
    } catch (error: any) {
      alert(`Mint failed: ${error.message}`);
    } finally {
      setIsMinting(false);
    }
  };

  const handleCheckBalance = async () => {
    if (!client || !checkWallet) {
      alert('Please enter wallet address');
      return;
    }

    setIsChecking(true);
    try {
      const qtcBalance = await client.getQTCBalance(checkWallet);
      const solBalance = await client.getSOLBalance(checkWallet);
      setCheckedQTCBalance(qtcBalance);
      setCheckedSOLBalance(solBalance);
    } catch (error: any) {
      alert(`Balance check failed: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleAirdrop = async () => {
    if (!client || !airdropWallet || !airdropAmount) {
      alert('Please fill in all airdrop fields');
      return;
    }

    const amount = parseFloat(airdropAmount);
    if (amount <= 0 || amount > 2) {
      alert('Airdrop amount must be between 0 and 2 SOL');
      return;
    }

    setIsAirdropping(true);
    try {
      const signature = await client.airdropSOL(airdropWallet, amount);
      alert(`✅ Airdrop successful!
      
Transaction: ${signature}
Amount: ${amount} SOL
Recipient: ${airdropWallet}

Check Solana Explorer for confirmation.`);
      setAirdropWallet('');
      setAirdropAmount('');
    } catch (error: any) {
      alert(`❌ Airdrop failed: ${error.message}`);
    } finally {
      setIsAirdropping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-2xl">Loading QTC Smart Contract...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          QTC Smart Contract Dashboard
        </h1>
        <p className="text-xl text-gray-600">
          Manage your deployed QTC token contract on Solana
        </p>
      </div>

      {/* Contract Information */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-900">
            📋 Contract Details
          </h2>
          {contractInfo && (
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-600">Program ID:</span>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1 break-all">
                  {contractInfo.programId}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Token Mint:</span>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1 break-all">
                  {contractInfo.tokenMint}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Token Account:</span>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1 break-all">
                  {contractInfo.tokenAccount}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Network:</span>
                <p className="text-green-600 font-medium">{contractInfo.network}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Decimals:</span>
                <p>{contractInfo.tokenDecimals}</p>
              </div>
            </div>
          )}
        </div>

        {/* Wallet Balances */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-900">
            💰 Parent Wallet Balances
            <button
              onClick={refreshBalances}
              className="ml-4 text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200 transition-colors"
            >
              Refresh
            </button>
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
              <div>
                <p className="font-medium text-gray-700">SOL Balance</p>
                <p className="text-sm text-gray-500">
                  {isWalletLoaded ? 'Parent wallet SOL' : 'Load wallet to view'}
                </p>
              </div>
              <div className="text-right">
                {isWalletLoaded ? (
                  <p className="text-2xl font-bold text-blue-600">{balances.solBalance.toFixed(4)} SOL</p>
                ) : (
                  <p className="text-lg text-gray-400">-- SOL</p>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg">
              <div>
                <p className="font-medium text-gray-700">QTC Balance</p>
                <p className="text-sm text-gray-500">Your custom token</p>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{balances.qtcBalance.toLocaleString()} QTC</p>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div>
                <p className="font-medium text-gray-700">QTC Total Supply</p>
                <p className="text-sm text-gray-500">All tokens in circulation</p>
              </div>
              <p className="text-2xl font-bold text-purple-600">{totalSupply.toLocaleString()} QTC</p>
            </div>
          </div>
          
          {contractInfo && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-600">Parent Wallet:</p>
              <p className="font-mono text-xs break-all">{contractInfo.parentWallet}</p>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Status */}
      <div className="mb-8">
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            🔑 Wallet Status
            <span className="ml-2 text-green-600 text-sm">✅ Auto-Loaded</span>
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Demo parent wallet automatically loaded
                </p>
                <p className="text-sm text-green-600">
                  Real transfers enabled • SOL and QTC balances available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operations */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Transfer Tokens */}
        <div className="card p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            📤 Transfer QTC Tokens
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Recipient Wallet Address
              </label>
              <input
                type="text"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="Enter Solana wallet address"
                className="input-field"
                disabled={isTransferring}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount (QTC)
              </label>
              <input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Enter amount to transfer"
                className="input-field"
                disabled={isTransferring}
              />
            </div>
            <button
              onClick={handleTransfer}
              disabled={isTransferring || !transferTo || !transferAmount}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                isTransferring || !transferTo || !transferAmount
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {isTransferring ? 'Transferring...' : 'Transfer QTC'}
            </button>
          </div>
        </div>

        {/* Mint Tokens */}
        <div className="card p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            🪙 Mint QTC Tokens
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount to Mint (QTC)
              </label>
              <input
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="Enter amount to mint"
                className="input-field"
                disabled={isMinting}
              />
            </div>
            <button
              onClick={handleMint}
              disabled={isMinting || !mintAmount}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                isMinting || !mintAmount
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'btn-success'
              }`}
            >
              {isMinting ? 'Minting...' : 'Mint QTC'}
            </button>
            <p className="text-xs text-gray-500">
              * Requires mint authority permissions
            </p>
          </div>
        </div>

        {/* Check Balance */}
        <div className="card p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            🔍 Check Wallet Balance
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={checkWallet}
                onChange={(e) => setCheckWallet(e.target.value)}
                placeholder="Enter wallet address to check"
                className="input-field"
                disabled={isChecking}
              />
            </div>
            <button
              onClick={handleCheckBalance}
              disabled={isChecking || !checkWallet}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                isChecking || !checkWallet
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'btn-secondary'
              }`}
            >
              {isChecking ? 'Checking...' : 'Check Balances'}
            </button>
            {checkedQTCBalance !== null && checkedSOLBalance !== null && (
              <div className="mt-4 space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    SOL Balance: {checkedSOLBalance.toFixed(4)} SOL
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    QTC Balance: {checkedQTCBalance.toLocaleString()} QTC
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SOL Airdrop */}
        <div className="card p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center text-gray-900">
            🪂 SOL Airdrop
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Recipient Wallet Address
              </label>
              <input
                type="text"
                value={airdropWallet}
                onChange={(e) => setAirdropWallet(e.target.value)}
                placeholder="Enter Solana wallet address"
                className="input-field"
                disabled={isAirdropping}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount (SOL)
              </label>
              <input
                type="number"
                step="0.1"
                max="2"
                value={airdropAmount}
                onChange={(e) => setAirdropAmount(e.target.value)}
                placeholder="Enter SOL amount (max 2)"
                className="input-field"
                disabled={isAirdropping}
              />
            </div>
            <button
              onClick={handleAirdrop}
              disabled={isAirdropping || !airdropWallet || !airdropAmount}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                isAirdropping || !airdropWallet || !airdropAmount
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              {isAirdropping ? 'Airdropping...' : 'Airdrop SOL'}
            </button>
            <p className="text-xs text-gray-500">
              * Only works on Solana Devnet
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      {lastTransaction && (
        <div className="mt-8">
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-900">
              📋 Latest Transaction Details
            </h2>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Transaction Hash</p>
                    <p className="font-mono text-sm bg-white p-2 rounded border break-all">
                      {lastTransaction.signature}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">From Address</p>
                    <p className="font-mono text-sm bg-white p-2 rounded border break-all">
                      {lastTransaction.fromAddress}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">To Address</p>
                    <p className="font-mono text-sm bg-white p-2 rounded border break-all">
                      {lastTransaction.toAddress}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Amount Transferred</p>
                    <p className="text-2xl font-bold text-green-600">
                      {lastTransaction.amount.toLocaleString()} QTC
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Recipient Balance</p>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm">
                        Before: <span className="font-medium">{lastTransaction.recipientBalanceBefore.toLocaleString()} QTC</span>
                      </p>
                      <p className="text-sm">
                        After: <span className="font-medium text-green-600">{lastTransaction.recipientBalanceAfter.toLocaleString()} QTC</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Change: +{(lastTransaction.recipientBalanceAfter - lastTransaction.recipientBalanceBefore).toLocaleString()} QTC
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Timestamp</p>
                    <p className="text-sm">{new Date(lastTransaction.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <a
                  href={lastTransaction.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔍 View on Solana Explorer
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documentation and Explorer Links */}
      <div className="mt-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Explorer Links */}
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900">
              🔗 Blockchain Explorer
            </h3>
            <div className="space-y-3">
              <a
                href={`https://explorer.solana.com/address/${contractInfo?.programId}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-800 underline text-sm"
              >
                📋 View Contract on Solana Explorer
              </a>
              <a
                href={`https://explorer.solana.com/address/${contractInfo?.tokenMint}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-800 underline text-sm"
              >
                🪙 View QTC Token on Solana Explorer
              </a>
              <a
                href={`https://explorer.solana.com/address/${contractInfo?.parentWallet}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-800 underline text-sm"
              >
                👛 View Parent Wallet on Explorer
              </a>
            </div>
          </div>

          {/* Smart Contract Documentation */}
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center text-gray-900">
              📚 Smart Contract Documentation
            </h3>
            <div className="space-y-3">
              <a
                href="https://docs.solana.com/developing/programming-model/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-800 underline text-sm"
              >
                📖 Solana Programming Model Overview
              </a>
              <a
                href="https://docs.solana.com/developing/runtime-facilities/programs"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-800 underline text-sm"
              >
                🏗️ Solana Program Development
              </a>
              <a
                href="https://spl.solana.com/token"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-800 underline text-sm"
              >
                🪙 SPL Token Program Documentation
              </a>
              <a
                href="https://docs.rs/solana-program/latest/solana_program/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-800 underline text-sm"
              >
                🔧 Solana Program Library (Rust Docs)
              </a>
              <a
                href="https://docs.solana.com/developing/clients/javascript-reference"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-800 underline text-sm"
              >
                ⚡ Solana Web3.js Reference
              </a>
              <a
                href="https://book.anchor-lang.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-800 underline text-sm"
              >
                ⚓ Anchor Framework Documentation
              </a>
            </div>
          </div>
        </div>

        {/* Solana Default Blockchain Methods */}
        <div className="mt-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              ⚡ Solana Default Blockchain Methods
            </h3>
            <p className="text-gray-600 mb-4">
              These are the core built-in methods available on every Solana blockchain program:
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Account Management */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3">📋 Account Management</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getAccountInfo">
                      <code className="bg-orange-100 px-2 py-1 rounded text-xs cursor-help hover:bg-orange-200 transition-colors">
                        getAccountInfo
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getMultipleAccounts">
                      <code className="bg-orange-100 px-2 py-1 rounded text-xs cursor-help hover:bg-orange-200 transition-colors">
                        getMultipleAccounts
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getProgramAccounts">
                      <code className="bg-orange-100 px-2 py-1 rounded text-xs cursor-help hover:bg-orange-200 transition-colors">
                        getProgramAccounts
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getBalance">
                      <code className="bg-orange-100 px-2 py-1 rounded text-xs cursor-help hover:bg-orange-200 transition-colors">
                        getBalance
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getTokenAccountsByOwner">
                      <code className="bg-orange-100 px-2 py-1 rounded text-xs cursor-help hover:bg-orange-200 transition-colors">
                        getTokenAccountsByOwner
                      </code>
                    </MethodTooltip>
                  </li>
                </ul>
              </div>

              {/* Transaction Operations */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-3">🔄 Transaction Operations</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="sendTransaction">
                      <code className="bg-red-100 px-2 py-1 rounded text-xs cursor-help hover:bg-red-200 transition-colors">
                        sendTransaction
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="confirmTransaction">
                      <code className="bg-red-100 px-2 py-1 rounded text-xs cursor-help hover:bg-red-200 transition-colors">
                        confirmTransaction
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getTransaction">
                      <code className="bg-red-100 px-2 py-1 rounded text-xs cursor-help hover:bg-red-200 transition-colors">
                        getTransaction
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getSignatureStatuses">
                      <code className="bg-red-100 px-2 py-1 rounded text-xs cursor-help hover:bg-red-200 transition-colors">
                        getSignatureStatuses
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getConfirmedSignatures">
                      <code className="bg-red-100 px-2 py-1 rounded text-xs cursor-help hover:bg-red-200 transition-colors">
                        getConfirmedSignatures
                      </code>
                    </MethodTooltip>
                  </li>
                </ul>
              </div>

              {/* Network & Blockchain Info */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800 mb-3">🌐 Network & Blockchain</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getSlot">
                      <code className="bg-indigo-100 px-2 py-1 rounded text-xs cursor-help hover:bg-indigo-200 transition-colors">
                        getSlot
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getBlockHeight">
                      <code className="bg-indigo-100 px-2 py-1 rounded text-xs cursor-help hover:bg-indigo-200 transition-colors">
                        getBlockHeight
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getRecentBlockhash">
                      <code className="bg-indigo-100 px-2 py-1 rounded text-xs cursor-help hover:bg-indigo-200 transition-colors">
                        getRecentBlockhash
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getEpochInfo">
                      <code className="bg-indigo-100 px-2 py-1 rounded text-xs cursor-help hover:bg-indigo-200 transition-colors">
                        getEpochInfo
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getVersion">
                      <code className="bg-indigo-100 px-2 py-1 rounded text-xs cursor-help hover:bg-indigo-200 transition-colors">
                        getVersion
                      </code>
                    </MethodTooltip>
                  </li>
                </ul>
              </div>

              {/* Validator & Network Stats */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h4 className="font-semibold text-teal-800 mb-3">🏛️ Validator & Network</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getClusterNodes">
                      <code className="bg-teal-100 px-2 py-1 rounded text-xs cursor-help hover:bg-teal-200 transition-colors">
                        getClusterNodes
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getVoteAccounts">
                      <code className="bg-teal-100 px-2 py-1 rounded text-xs cursor-help hover:bg-teal-200 transition-colors">
                        getVoteAccounts
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getInflationRate">
                      <code className="bg-teal-100 px-2 py-1 rounded text-xs cursor-help hover:bg-teal-200 transition-colors">
                        getInflationRate
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getSupply">
                      <code className="bg-teal-100 px-2 py-1 rounded text-xs cursor-help hover:bg-teal-200 transition-colors">
                        getSupply
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="requestAirdrop">
                      <code className="bg-teal-100 px-2 py-1 rounded text-xs cursor-help hover:bg-teal-200 transition-colors">
                        requestAirdrop
                      </code>
                    </MethodTooltip>
                  </li>
                </ul>
              </div>

              {/* Program & Instruction */}
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <h4 className="font-semibold text-pink-800 mb-3">⚙️ Program & Instruction</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="simulateTransaction">
                      <code className="bg-pink-100 px-2 py-1 rounded text-xs cursor-help hover:bg-pink-200 transition-colors">
                        simulateTransaction
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getFeeForMessage">
                      <code className="bg-pink-100 px-2 py-1 rounded text-xs cursor-help hover:bg-pink-200 transition-colors">
                        getFeeForMessage
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getLatestBlockhash">
                      <code className="bg-pink-100 px-2 py-1 rounded text-xs cursor-help hover:bg-pink-200 transition-colors">
                        getLatestBlockhash
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="isBlockhashValid">
                      <code className="bg-pink-100 px-2 py-1 rounded text-xs cursor-help hover:bg-pink-200 transition-colors">
                        isBlockhashValid
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getMinimumBalanceForRent">
                      <code className="bg-pink-100 px-2 py-1 rounded text-xs cursor-help hover:bg-pink-200 transition-colors">
                        getMinimumBalanceForRent
                      </code>
                    </MethodTooltip>
                  </li>
                </ul>
              </div>

              {/* Token & Supply Methods */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-3">🪙 Token & Supply</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getTokenSupply">
                      <code className="bg-yellow-100 px-2 py-1 rounded text-xs cursor-help hover:bg-yellow-200 transition-colors">
                        getTokenSupply
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getTokenAccountBalance">
                      <code className="bg-yellow-100 px-2 py-1 rounded text-xs cursor-help hover:bg-yellow-200 transition-colors">
                        getTokenAccountBalance
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getTokenLargestAccounts">
                      <code className="bg-yellow-100 px-2 py-1 rounded text-xs cursor-help hover:bg-yellow-200 transition-colors">
                        getTokenLargestAccounts
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getInflationGovernor">
                      <code className="bg-yellow-100 px-2 py-1 rounded text-xs cursor-help hover:bg-yellow-200 transition-colors">
                        getInflationGovernor
                      </code>
                    </MethodTooltip>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    <MethodTooltip methodName="getInflationReward">
                      <code className="bg-yellow-100 px-2 py-1 rounded text-xs cursor-help hover:bg-yellow-200 transition-colors">
                        getInflationReward
                      </code>
                    </MethodTooltip>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Usage:</strong> These methods are accessible via the Solana Web3.js library through your <code>Connection</code> object. 
                Example: <code>connection.getAccountInfo(publicKey)</code>
              </p>
            </div>
          </div>
        </div>

        {/* Available Smart Contract Methods */}
        <div className="mt-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              🛠️ QTC Contract Specific Methods
            </h3>
            <p className="text-gray-600 mb-4">
              Based on your deployed QTC contract, here are the custom smart contract operations available:
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* SPL Token Methods */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">🪙 SPL Token Operations</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <code className="bg-green-100 px-2 py-1 rounded text-xs">transfer</code>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <code className="bg-green-100 px-2 py-1 rounded text-xs">transferChecked</code>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <code className="bg-green-100 px-2 py-1 rounded text-xs">mintTo</code>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <code className="bg-green-100 px-2 py-1 rounded text-xs">burn</code>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <code className="bg-green-100 px-2 py-1 rounded text-xs">approve</code>
                  </li>
                </ul>
              </div>

              {/* Account Operations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">👛 Account Operations</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <code className="bg-blue-100 px-2 py-1 rounded text-xs">createAccount</code>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <code className="bg-blue-100 px-2 py-1 rounded text-xs">closeAccount</code>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <code className="bg-blue-100 px-2 py-1 rounded text-xs">setAuthority</code>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <code className="bg-blue-100 px-2 py-1 rounded text-xs">freezeAccount</code>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <code className="bg-blue-100 px-2 py-1 rounded text-xs">thawAccount</code>
                  </li>
                </ul>
              </div>

              {/* System Operations */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">⚙️ System Operations</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    <code className="bg-purple-100 px-2 py-1 rounded text-xs">createProgram</code>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    <code className="bg-purple-100 px-2 py-1 rounded text-xs">invoke</code>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    <code className="bg-purple-100 px-2 py-1 rounded text-xs">invokeSignedC</code>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    <code className="bg-purple-100 px-2 py-1 rounded text-xs">allocate</code>
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    <code className="bg-purple-100 px-2 py-1 rounded text-xs">assign</code>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>📝 Note:</strong> Your QTC contract implements custom methods built on top of these Solana primitives. 
                The methods shown above are the core Solana/SPL operations that power your contract functionality.
              </p>
            </div>
          </div>
        </div>

        {/* POC Projects for Smart Contracts */}
        <div className="mt-8">
          <div className="card p-6">
            <h3 className="text-2xl font-bold mb-4 flex items-center text-gray-900">
              🚀 POC Projects for Smart Contracts
            </h3>
            <p className="text-gray-600 mb-6">
              Explore innovative smart contract ideas you can build on Solana. Each project includes complexity level and potential use cases.
            </p>

            {/* DeFi Projects */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                💰 DeFi (Decentralized Finance)
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">🔄 DEX (Decentralized Exchange)</h5>
                  <p className="text-sm text-blue-700 mb-3">Build an AMM like Uniswap for token swapping with liquidity pools</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Advanced</span>
                    <span className="text-xs text-blue-600">Trading</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-900 mb-2">🌾 Yield Farming</h5>
                  <p className="text-sm text-green-700 mb-3">Stake tokens to earn rewards over time with compound interest</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Intermediate</span>
                    <span className="text-xs text-green-600">Rewards</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <h5 className="font-semibold text-purple-900 mb-2">🏦 Lending Protocol</h5>
                  <p className="text-sm text-purple-700 mb-3">Lend/borrow tokens with collateral like Compound or Aave</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Advanced</span>
                    <span className="text-xs text-purple-600">Lending</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                  <h5 className="font-semibold text-orange-900 mb-2">⚡ Flash Loans</h5>
                  <p className="text-sm text-orange-700 mb-3">Instant loans that must be repaid in the same transaction</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Expert</span>
                    <span className="text-xs text-orange-600">Arbitrage</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-lg p-4">
                  <h5 className="font-semibold text-teal-900 mb-2">🔒 Token Vesting</h5>
                  <p className="text-sm text-teal-700 mb-3">Release tokens gradually over time for employees/investors</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Beginner</span>
                    <span className="text-xs text-teal-600">Vesting</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4">
                  <h5 className="font-semibold text-indigo-900 mb-2">🏊 Staking Pools</h5>
                  <p className="text-sm text-indigo-700 mb-3">Stake SOL/tokens for network validation rewards</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Intermediate</span>
                    <span className="text-xs text-indigo-600">Staking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GameFi & NFTs */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
                🎮 GameFi & NFTs
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 rounded-lg p-4">
                  <h5 className="font-semibold text-pink-900 mb-2">🕹️ Play-to-Earn Game</h5>
                  <p className="text-sm text-pink-700 mb-3">Players earn tokens through gameplay achievements and battles</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Intermediate</span>
                    <span className="text-xs text-pink-600">Gaming</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                  <h5 className="font-semibold text-red-900 mb-2">⚔️ NFT Battle System</h5>
                  <p className="text-sm text-red-700 mb-3">Characters fight using stats stored on-chain with upgrades</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Advanced</span>
                    <span className="text-xs text-red-600">Combat</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-900 mb-2">🏞️ Virtual Land Trading</h5>
                  <p className="text-sm text-green-700 mb-3">Buy/sell/develop virtual real estate in metaverse worlds</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Intermediate</span>
                    <span className="text-xs text-green-600">Metaverse</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <h5 className="font-semibold text-purple-900 mb-2">🖼️ Dynamic NFTs</h5>
                  <p className="text-sm text-purple-700 mb-3">Metadata changes based on conditions like time or user actions</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Intermediate</span>
                    <span className="text-xs text-purple-600">NFT</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 border border-cyan-200 rounded-lg p-4">
                  <h5 className="font-semibold text-cyan-900 mb-2">🏆 Tournament Brackets</h5>
                  <p className="text-sm text-cyan-700 mb-3">Automated prize distribution for gaming competitions</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Beginner</span>
                    <span className="text-xs text-cyan-600">Esports</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4">
                  <h5 className="font-semibold text-amber-900 mb-2">🎨 Generative Art</h5>
                  <p className="text-sm text-amber-700 mb-3">On-chain art generation with randomized traits and rarity</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Intermediate</span>
                    <span className="text-xs text-amber-600">Art</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Governance & DAO */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-emerald-900 mb-4 flex items-center">
                🏛️ Governance & DAO
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4">
                  <h5 className="font-semibold text-emerald-900 mb-2">🗳️ Quadratic Voting</h5>
                  <p className="text-sm text-emerald-700 mb-3">Vote strength increases quadratically with more tokens staked</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Intermediate</span>
                    <span className="text-xs text-emerald-600">Voting</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4">
                  <h5 className="font-semibold text-slate-900 mb-2">🔐 Multi-Sig Wallet</h5>
                  <p className="text-sm text-slate-700 mb-3">Require multiple approvals for transactions and governance</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Advanced</span>
                    <span className="text-xs text-slate-600">Security</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">📋 Proposal System</h5>
                  <p className="text-sm text-blue-700 mb-3">Submit and vote on governance proposals with timelock</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Beginner</span>
                    <span className="text-xs text-blue-600">Governance</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-violet-50 to-violet-100 border border-violet-200 rounded-lg p-4">
                  <h5 className="font-semibold text-violet-900 mb-2">🌊 Liquid Democracy</h5>
                  <p className="text-sm text-violet-700 mb-3">Delegate voting power to trusted representatives</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Advanced</span>
                    <span className="text-xs text-violet-600">Democracy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-World Applications */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-teal-900 mb-4 flex items-center">
                🌍 Real-World Applications
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-900 mb-2">🏠 Property Tokenization</h5>
                  <p className="text-sm text-green-700 mb-3">Fractional real estate ownership through tokenization</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Advanced</span>
                    <span className="text-xs text-green-600">Real Estate</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">🚚 Supply Chain Tracking</h5>
                  <p className="text-sm text-blue-700 mb-3">Track goods from manufacture to sale with QR codes</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Intermediate</span>
                    <span className="text-xs text-blue-600">Logistics</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <h5 className="font-semibold text-purple-900 mb-2">📚 Digital Diplomas</h5>
                  <p className="text-sm text-purple-700 mb-3">Tamper-proof educational certificates on blockchain</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Beginner</span>
                    <span className="text-xs text-purple-600">Education</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                  <h5 className="font-semibold text-orange-900 mb-2">🌱 Carbon Credit Trading</h5>
                  <p className="text-sm text-orange-700 mb-3">Buy/sell environmental credits with verified impact</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Intermediate</span>
                    <span className="text-xs text-orange-600">Environment</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 rounded-lg p-4">
                  <h5 className="font-semibold text-pink-900 mb-2">🛡️ Smart Contract Insurance</h5>
                  <p className="text-sm text-pink-700 mb-3">Cover against code bugs, exploits, and protocol failures</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Expert</span>
                    <span className="text-xs text-pink-600">Insurance</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-lg p-4">
                  <h5 className="font-semibold text-teal-900 mb-2">🤖 Automation Services</h5>
                  <p className="text-sm text-teal-700 mb-3">Recurring payments, DCA bots, rebalancing automation</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Intermediate</span>
                    <span className="text-xs text-teal-600">Automation</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Beginner Projects */}
            <div className="mb-8">
              <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                🌱 Beginner-Friendly Projects
              </h4>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-900 mb-2">🚰 Token Faucet</h5>
                  <p className="text-sm text-green-700 mb-3">Distribute test tokens to users with rate limiting</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Beginner</span>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-semibold text-blue-900 mb-2">🗳️ Simple Voting</h5>
                  <p className="text-sm text-blue-700 mb-3">Basic yes/no voting system with token weights</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Beginner</span>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <h5 className="font-semibold text-purple-900 mb-2">🤝 Escrow Service</h5>
                  <p className="text-sm text-purple-700 mb-3">Hold funds until conditions are met</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Beginner</span>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                  <h5 className="font-semibold text-orange-900 mb-2">🎰 Lottery System</h5>
                  <p className="text-sm text-orange-700 mb-3">Random winner selection with token prizes</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Beginner</span>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
              <h4 className="text-lg font-bold text-indigo-900 mb-3">🚀 Ready to Start Building?</h4>
              <p className="text-indigo-700 mb-4">
                These projects range from simple learning exercises to complex DeFi protocols. Start with beginner projects to learn Solana development fundamentals.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://docs.solana.com/developing/on-chain-programs/overview"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  📖 Solana Program Development Guide
                </a>
                <a
                  href="https://book.anchor-lang.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  ⚓ Anchor Framework Tutorial
                </a>
                <a
                  href="https://github.com/solana-labs/solana-program-library"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  🧩 Solana Program Examples
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}