import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction, 
  getAccount,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction
} from '@solana/spl-token';

export const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

export const QTC_MINT = new PublicKey('97DBMXWBGAmF8fiWqcmNPuuqCu1MBeWSnpcdsz2vRQni');
export const PARENT_WALLET = new PublicKey('QTCawiVYkAnxmkVHzXZNhD8bRdBD6QxENwvkv9oCxTF');
export const PARENT_TOKEN_ACCOUNT = new PublicKey('Afzcj1swadnQZrcqTVX9bTNcLiyP7Tdk7K3MoCpvSyCc');

export async function getQTCBalance(walletAddress: PublicKey): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(QTC_MINT, walletAddress);
    const account = await getAccount(connection, tokenAccount);
    return Number(account.amount) / 10**6;
  } catch (error) {
    return 0;
  }
}

export async function createPaymentTransaction(
  fromWallet: PublicKey,
  amount: number
): Promise<Transaction> {
  const transaction = new Transaction();
  
  // Get user's token account
  const userTokenAccount = await getAssociatedTokenAddress(QTC_MINT, fromWallet);
  
  // Check if user's token account exists, if not create it
  try {
    await getAccount(connection, userTokenAccount);
  } catch (error) {
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
  
  // Create transfer instruction from user to parent
  const transferInstruction = createTransferInstruction(
    userTokenAccount, // From
    PARENT_TOKEN_ACCOUNT, // To
    fromWallet, // Owner of from account
    amount * 10**6, // Amount with 6 decimals
    [], // Multi signers
    TOKEN_PROGRAM_ID
  );
  
  transaction.add(transferInstruction);
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = fromWallet;
  
  return transaction;
}