use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, Mint, MintTo, Transfer};
use anchor_spl::associated_token::AssociatedToken;

// Program ID - This will be generated when we deploy
declare_id!("6ggvxB6NumJAKqumAtpdGSb26hti8mZGTV6erWVZuAbC");

#[program]
pub mod token_manager {
    use super::*;

    /// Initialize the token manager with mint authority
    pub fn initialize(ctx: Context<Initialize>, mint_authority: Pubkey) -> Result<()> {
        let token_manager = &mut ctx.accounts.token_manager;
        token_manager.mint_authority = mint_authority;
        token_manager.total_minted = 0;
        token_manager.is_active = true;
        
        msg!("Token Manager initialized with authority: {}", mint_authority);
        Ok(())
    }

    /// Mint new tokens (only mint authority can call this)
    pub fn mint_tokens(
        ctx: Context<MintTokens>, 
        amount: u64
    ) -> Result<()> {
        let token_manager = &mut ctx.accounts.token_manager;
        
        // Check if caller is the mint authority
        require!(
            ctx.accounts.authority.key() == token_manager.mint_authority,
            TokenManagerError::UnauthorizedMintAuthority
        );
        
        require!(
            token_manager.is_active,
            TokenManagerError::TokenManagerInactive
        );

        // Mint tokens using CPI to SPL Token program
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::mint_to(cpi_ctx, amount)?;
        
        // Update total minted
        token_manager.total_minted = token_manager.total_minted
            .checked_add(amount)
            .ok_or(TokenManagerError::MathOverflow)?;
            
        msg!("Minted {} tokens. Total minted: {}", amount, token_manager.total_minted);
        Ok(())
    }

    /// Transfer tokens between accounts
    pub fn transfer_tokens(
        ctx: Context<TransferTokens>,
        amount: u64
    ) -> Result<()> {
        // Transfer tokens using CPI to SPL Token program
        let cpi_accounts = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.to.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::transfer(cpi_ctx, amount)?;
        
        msg!("Transferred {} tokens from {} to {}", 
             amount, 
             ctx.accounts.from.key(), 
             ctx.accounts.to.key());
        Ok(())
    }

    /// Deactivate the token manager (emergency stop)
    pub fn deactivate(ctx: Context<UpdateTokenManager>) -> Result<()> {
        let token_manager = &mut ctx.accounts.token_manager;
        
        require!(
            ctx.accounts.authority.key() == token_manager.mint_authority,
            TokenManagerError::UnauthorizedMintAuthority
        );
        
        token_manager.is_active = false;
        msg!("Token Manager deactivated");
        Ok(())
    }

    /// Transfer 500 POC-QTC to specific wallet
    pub fn transfer_to_phantom_wallet(
        ctx: Context<TransferToPhantom>
    ) -> Result<()> {
        let amount = 500_000_000_000; // 500 tokens * 10^9 decimals

        // Transfer tokens using CPI to SPL Token program
        let cpi_accounts = Transfer {
            from: ctx.accounts.from_token_account.to_account_info(),
            to: ctx.accounts.to_token_account.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        token::transfer(cpi_ctx, amount)?;

        msg!("Transferred 500 POC-QTC to Phantom wallet: {}",
            ctx.accounts.to_token_account.key());
        Ok(())
    }
}

// Account Structures
#[account]
pub struct TokenManager {
    pub mint_authority: Pubkey,    // Who can mint tokens
    pub total_minted: u64,         // Total tokens minted through this contract
    pub is_active: bool,           // Emergency stop switch
}

// Context Structures
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 8 + 1  // discriminator + pubkey + u64 + bool
    )]
    pub token_manager: Account<'info, TokenManager>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub token_manager: Account<'info, TokenManager>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    /// CHECK: This is safe as we're just passing it to the SPL token program
    #[account(mut)]
    pub to: AccountInfo<'info>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TransferTokens<'info> {
    /// CHECK: This is safe as we're just passing it to the SPL token program
    #[account(mut)]
    pub from: AccountInfo<'info>,
    /// CHECK: This is safe as we're just passing it to the SPL token program
    #[account(mut)]
    pub to: AccountInfo<'info>,
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct TransferToPhantom<'info> {
    /// CHECK: This is safe as we're just passing it to the SPL token program
    #[account(mut)]
    pub from_token_account: AccountInfo<'info>, // Parent wallet token account
    /// CHECK: This is safe as we're just passing it to the SPL token program
    #[account(mut)]
    pub to_token_account: AccountInfo<'info>,   // Phantom wallet token account
    pub authority: Signer<'info>,               // Parent wallet signer
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateTokenManager<'info> {
    #[account(mut)]
    pub token_manager: Account<'info, TokenManager>,
    pub authority: Signer<'info>,
}

// Custom Errors
#[error_code]
pub enum TokenManagerError {
    #[msg("Only the mint authority can perform this action")]
    UnauthorizedMintAuthority,
    #[msg("Token manager is currently inactive")]
    TokenManagerInactive,
    #[msg("Math operation overflow")]
    MathOverflow,
}