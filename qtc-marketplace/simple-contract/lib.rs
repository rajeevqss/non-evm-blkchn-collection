use anchor_lang::prelude::*;

// This is your program's on-chain address!
declare_id!("11111111111111111111111111111111");

#[program]
pub mod simple_counter {
    use super::*;

    // Initialize a counter
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        msg!("Counter initialized to: {}", counter.count);
        Ok(())
    }

    // Increment the counter
    pub fn increment(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count += 1;
        msg!("Counter incremented to: {}", counter.count);
        Ok(())
    }

    // Decrement the counter
    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count -= 1;
        msg!("Counter decremented to: {}", counter.count);
        Ok(())
    }
}

// This is the account that will store our counter data
#[account]
pub struct Counter {
    pub count: i64,
}

// Context for initialize - defines what accounts are needed
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,           // Create a new account
        payer = user,   // User pays for account creation
        space = 8 + 8   // 8 bytes for account discriminator + 8 bytes for i64
    )]
    pub counter: Account<'info, Counter>,
    #[account(mut)]  // User account needs to be mutable (to pay)
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Context for update operations
#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]  // Counter needs to be mutable to update
    pub counter: Account<'info, Counter>,
}