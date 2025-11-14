import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from '@solana/spl-token';

export interface ContractInfo {
  programId: string;
  tokenMint: string;
  tokenAccount: string;
  parentWallet: string;
  tokenDecimals: number;
  network: string;
}

export interface WalletBalances {
  solBalance: number;
  qtcBalance: number;
}

export interface TransactionResult {
  signature: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  timestamp: string;
  explorerUrl: string;
  recipientBalanceBefore: number;
  recipientBalanceAfter: number;
}

export class QTCContractClient {
  connection: Connection;
  programId: PublicKey;
  tokenMint: PublicKey;
  tokenAccount: PublicKey;
  tokenDecimals: number;
  parentWallet: Keypair | null = null;

  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    this.programId = new PublicKey('HtiGuMFXmrhrXC2VsRj4T9faQXXYZanhyW6WUtNu3v7j');
    this.tokenMint = new PublicKey('6diASnAchdpwsiqvvi7rcfgztXNbA3RbvSzJXa6BX3iE');
    this.tokenAccount = new PublicKey('8NEQxbQjxGwRoLeYL58bdmL4iRwK8RYVufjWK8idCNq');
    this.tokenDecimals = 9;
    
    // Auto-load demo parent wallet
    this.loadDemoParentWallet();
    console.log('QTC Contract Client initialized');
  }

  // Auto-load demo parent wallet from known key
  private loadDemoParentWallet(): void {
    try {
      // Demo parent wallet private key from poc-smart-contract
      const demoPrivateKey = [192,53,249,221,43,71,11,45,111,59,209,149,61,199,176,72,179,55,99,138,219,119,186,167,47,200,213,57,246,168,67,112,59,238,252,139,127,172,68,197,61,227,225,147,91,75,122,11,135,121,18,125,159,225,111,168,232,214,214,192,146,24,185,34];
      
      this.parentWallet = Keypair.fromSecretKey(new Uint8Array(demoPrivateKey));
      console.log('🔑 Demo parent wallet auto-loaded:', this.parentWallet.publicKey.toString());
    } catch (error) {
      console.error('Failed to load demo parent wallet:', error);
      this.parentWallet = null;
    }
  }

  // Method to load parent wallet from private key
  loadParentWallet(privateKeyArray: number[]): boolean {
    try {
      this.parentWallet = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
      console.log('Parent wallet loaded:', this.parentWallet.publicKey.toString());
      return true;
    } catch (error) {
      console.error('Failed to load parent wallet:', error);
      return false;
    }
  }

  // Get contract information
  getContractInfo(): ContractInfo {
    return {
      programId: this.programId.toString(),
      tokenMint: this.tokenMint.toString(),
      tokenAccount: this.tokenAccount.toString(),
      parentWallet: this.parentWallet?.publicKey.toString() || 'Not loaded',
      tokenDecimals: this.tokenDecimals,
      network: 'Solana Devnet'
    };
  }

  // Get wallet balances  
  async getWalletBalances(): Promise<WalletBalances> {
    try {
      // Get QTC token balance from the known token account (public info)
      const qtcBalance = await this.connection.getTokenAccountBalance(this.tokenAccount);
      const qtcBalanceTokens = qtcBalance.value.uiAmount || 0;

      console.log(`QTC Token Account Balance: ${qtcBalanceTokens} QTC`);

      // Get SOL balance if parent wallet is loaded
      let solBalance = 0;
      if (this.parentWallet) {
        const solBalanceLamports = await this.connection.getBalance(this.parentWallet.publicKey);
        solBalance = solBalanceLamports / 1e9;
        console.log(`Parent Wallet SOL Balance: ${solBalance} SOL`);
      } else {
        console.log('Parent wallet not loaded - SOL balance unavailable');
      }

      return {
        solBalance: solBalance,
        qtcBalance: qtcBalanceTokens
      };
    } catch (error) {
      console.error('Error getting wallet balances:', error);
      return { solBalance: 0, qtcBalance: 0 };
    }
  }

  // Check if wallet address has QTC token account
  async checkTokenAccount(walletAddress: string): Promise<boolean> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const tokenAccount = await getAssociatedTokenAddress(this.tokenMint, publicKey);
      const accountInfo = await this.connection.getAccountInfo(tokenAccount);
      return accountInfo !== null;
    } catch (error) {
      console.error('Error checking token account:', error);
      return false;
    }
  }

  // Get QTC balance for any wallet
  async getQTCBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const tokenAccount = await getAssociatedTokenAddress(this.tokenMint, publicKey);
      const balance = await this.connection.getTokenAccountBalance(tokenAccount);
      return balance.value.uiAmount || 0;
    } catch (error) {
      console.error('Error getting QTC balance:', error);
      return 0;
    }
  }

  // Get SOL balance for any wallet address
  async getSOLBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balanceLamports = await this.connection.getBalance(publicKey);
      return balanceLamports / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Error getting SOL balance:', error);
      return 0;
    }
  }

  // Get QTC token total supply
  async getQTCTotalSupply(): Promise<number> {
    try {
      const supply = await this.connection.getTokenSupply(this.tokenMint);
      return supply.value.uiAmount || 0;
    } catch (error) {
      console.error('Error getting QTC total supply:', error);
      return 0;
    }
  }

  // Airdrop SOL to a wallet address (only works on devnet)
  async airdropSOL(walletAddress: string, amount: number): Promise<string> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const amountLamports = amount * 1e9; // Convert SOL to lamports
      
      console.log(`🪂 Airdropping ${amount} SOL to ${walletAddress}...`);
      
      const signature = await this.connection.requestAirdrop(publicKey, amountLamports);
      
      console.log('⏳ Confirming airdrop...');
      await this.connection.confirmTransaction(signature, 'confirmed');
      
      console.log(`✅ Airdrop successful! Transaction: ${signature}`);
      console.log(`🔍 Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      
      return signature;
    } catch (error) {
      console.error('❌ Airdrop failed:', error);
      throw error;
    }
  }

  // Transfer QTC tokens to another wallet  
  async transferTokens(toWallet: string, amount: number, realTransfer: boolean = false): Promise<TransactionResult | string> {
    try {
      console.log(`Preparing transfer: ${amount} QTC to ${toWallet}...`);
      
      // Check if the known token account has sufficient balance
      console.log(`Checking balance of known QTC account: ${this.tokenAccount.toString()}`);
      
      const balance = await this.connection.getTokenAccountBalance(this.tokenAccount);
      const currentBalance = balance.value.uiAmount || 0;
      
      console.log(`Current QTC balance: ${currentBalance}`);
      
      if (currentBalance < amount) {
        throw new Error(`Insufficient QTC balance. Available: ${currentBalance}, Required: ${amount}`);
      }
      
      if (!realTransfer) {
        // Simulation mode
        console.log('🚨 TRANSFER SIMULATION 🚨');
        console.log(`Would transfer ${amount} QTC to ${toWallet}`);
        console.log('⚠️  Use realTransfer=true to execute actual transfer');
        const demoTxId = 'demo_transfer_' + Math.random().toString(36).substring(2, 11);
        return demoTxId;
      }
      
      // Real transfer mode
      if (!this.parentWallet) {
        throw new Error('Parent wallet not loaded. Cannot execute real transfer.');
      }
      
      const toPublicKey = new PublicKey(toWallet);
      const transferAmount = amount * Math.pow(10, this.tokenDecimals);
      
      // Get recipient balance before transfer
      const recipientBalanceBefore = await this.getQTCBalance(toWallet);
      
      // Get recipient's token account
      const toTokenAccount = await getAssociatedTokenAddress(
        this.tokenMint,
        toPublicKey
      );
      
      console.log(`From token account: ${this.tokenAccount.toString()}`);
      console.log(`To token account: ${toTokenAccount.toString()}`);
      
      // Check if recipient's token account exists, create if needed
      const toAccountInfo = await this.connection.getAccountInfo(toTokenAccount);
      const transaction = new Transaction();
      
      if (!toAccountInfo) {
        console.log('Creating token account for recipient...');
        const createAccountIx = createAssociatedTokenAccountInstruction(
          this.parentWallet.publicKey, // payer
          toTokenAccount,               // account to create
          toPublicKey,                 // owner
          this.tokenMint               // mint
        );
        transaction.add(createAccountIx);
      }
      
      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        this.tokenAccount,        // from (source token account)
        toTokenAccount,           // to (destination token account)
        this.parentWallet.publicKey, // owner/signer
        transferAmount            // amount in lamports
      );
      
      transaction.add(transferInstruction);
      
      // Send and confirm transaction
      console.log('🚀 Executing real transfer...');
      const signature = await this.connection.sendTransaction(
        transaction,
        [this.parentWallet],
        { skipPreflight: false, preflightCommitment: 'confirmed' }
      );
      
      console.log('⏳ Confirming transaction...');
      await this.connection.confirmTransaction(signature, 'confirmed');
      
      console.log(`✅ Transfer successful! Transaction: ${signature}`);
      console.log(`🔍 Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
      
      // Verify the transfer by checking recipient balance
      console.log('📊 Verifying transfer...');
      const recipientBalanceAfter = await this.getQTCBalance(toWallet);
      console.log(`📈 Recipient QTC balance after transfer: ${recipientBalanceAfter} QTC`);
      
      // Return detailed transaction result
      const result: TransactionResult = {
        signature,
        fromAddress: this.parentWallet.publicKey.toString(),
        toAddress: toWallet,
        amount,
        timestamp: new Date().toISOString(),
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        recipientBalanceBefore: recipientBalanceBefore,
        recipientBalanceAfter
      };
      
      return result;
      
    } catch (error) {
      console.error('❌ Transfer failed:', error);
      throw error;
    }
  }

  // Simulate minting tokens (for demo - real minting would need mint authority)
  async mintTokens(amount: number): Promise<string> {
    console.log(`Simulating minting ${amount} QTC tokens...`);
    
    // For demo purposes - real minting would interact with your deployed smart contract
    const demoTxId = 'mint_' + Math.random().toString(36).substring(2, 11);
    
    console.log(`Demo mint transaction ID: ${demoTxId}`);
    console.log(`Would mint ${amount} QTC tokens to parent wallet`);
    console.log(`Mint authority required: ${this.parentWallet?.publicKey.toString()}`);
    
    return demoTxId;
  }

  // Get transaction details
  async getTransactionDetails(signature: string): Promise<any> {
    try {
      const transaction = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0
      });
      return transaction;
    } catch (error) {
      console.error('Error getting transaction details:', error);
      return null;
    }
  }
}

export default QTCContractClient;