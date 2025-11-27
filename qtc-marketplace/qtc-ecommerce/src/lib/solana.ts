import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction, 
  getAccount,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';

export const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

export const QTC_MINT = new PublicKey('6diASnAchdpwsiqvvi7rcfgztXNbA3RbvSzJXa6BX3iE');
export const PARENT_WALLET = new PublicKey('52xR5CuemRBRv3389vEhAeKcg6bTY9Tss7tm7TenXczm');

export async function getQTCBalance(walletAddress: PublicKey): Promise<number> {
  try {
    console.log('🔍 Checking QTC balance for wallet:', walletAddress.toString());
    console.log('Expected user wallet (6k QTC):', '9EUKXSp3jCkfb2v6q7spzcxTbzokow2hLTyX2rET9e9K');
    console.log('Expected parent wallet (95k QTC):', '52xR5CuemRBRv3389vEhAeKcg6bTY9Tss7tm7TenXczm');
    
    const tokenAccount = await getAssociatedTokenAddress(QTC_MINT, walletAddress);
    console.log('Token account address:', tokenAccount.toString());
    
    const account = await getAccount(connection, tokenAccount);
    const balance = Number(account.amount) / 10**9; // QTC uses 9 decimals, not 6
    console.log('QTC balance found:', balance);
    
    return balance;
  } catch (error) {
    console.log('No QTC tokens found or account does not exist:', error);
    return 0;
  }
}

export async function createPaymentTransaction(
  fromWallet: PublicKey,
  amount: number
): Promise<Transaction> {
  
  console.log('🔄 Creating payment transaction...');
  console.log('From wallet:', fromWallet.toString());
  console.log('Parent wallet:', PARENT_WALLET.toString());
  console.log('Amount:', amount, 'QTC');
  
  // ⚠️ CRITICAL CHECK: Prevent same-wallet transfers
  if (fromWallet.toString() === PARENT_WALLET.toString()) {
    throw new Error(`❌ Cannot transfer tokens to the same wallet! 

Connected wallet: ${fromWallet.toString().slice(0, 8)}...${fromWallet.toString().slice(-8)}

This is the parent wallet (store owner). Please:
1. Switch to a different wallet account in Phantom
2. Use a user wallet that has QTC tokens
3. Expected user wallet: 9EUKXSp3jCkfb2v6q7spzcxTbzokow2hLTyX2rET9e9K

You cannot buy from yourself! 🚫`);
  }
  
  const transaction = new Transaction();
  
  // Get both user's and parent's token accounts (ATAs)
  const userTokenAccount = await getAssociatedTokenAddress(QTC_MINT, fromWallet);
  const parentTokenAccount = await getAssociatedTokenAddress(QTC_MINT, PARENT_WALLET);
  
  console.log('User ATA:', userTokenAccount.toString());
  console.log('Parent ATA:', parentTokenAccount.toString());
  
  // Check if user's token account exists, if not create it
  try {
    await getAccount(connection, userTokenAccount);
    console.log('✅ User ATA exists');
  } catch (error) {
    console.log('❌ User ATA doesn\'t exist, creating it...');
    // Account doesn't exist, create it
    transaction.add(
      createAssociatedTokenAccountInstruction(
        fromWallet, // Payer
        userTokenAccount, // Token account
        fromWallet, // Owner
        QTC_MINT // Mint
      )
    );
  }
  
  // Check if parent's token account exists, if not create it
  try {
    await getAccount(connection, parentTokenAccount);
    console.log('✅ Parent ATA exists');
  } catch (error) {
    console.log('❌ Parent ATA doesn\'t exist, creating it...');
    // Account doesn't exist, create it (user pays for parent's ATA creation)
    transaction.add(
      createAssociatedTokenAccountInstruction(
        fromWallet, // Payer (user pays)
        parentTokenAccount, // Token account
        PARENT_WALLET, // Owner (parent)
        QTC_MINT // Mint
      )
    );
  }
  
  // Create transfer instruction from user to parent
  const transferInstruction = createTransferInstruction(
    userTokenAccount, // From
    parentTokenAccount, // To (use calculated ATA, not hardcoded)
    fromWallet, // Owner of from account
    amount * 10**9, // Amount with 9 decimals
    [], // Multi signers
    TOKEN_PROGRAM_ID
  );
  
  transaction.add(transferInstruction);
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromWallet;
  
  console.log('✅ Transaction created successfully');
  console.log('🔗 Blockhash:', blockhash);
  
  // Check if user has enough SOL for transaction fees
  const solBalance = await connection.getBalance(fromWallet);
  console.log('💰 User SOL balance:', solBalance / 1e9, 'SOL');
  
  if (solBalance < 5000) { // ~0.000005 SOL minimum for transaction
    throw new Error(`Insufficient SOL balance for transaction fees. You have ${(solBalance / 1e9).toFixed(6)} SOL but need at least 0.000005 SOL for fees.`);
  }
  
  return transaction;
}