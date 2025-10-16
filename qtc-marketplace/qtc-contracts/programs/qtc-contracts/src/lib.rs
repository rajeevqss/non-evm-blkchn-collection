use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("H5ybjLfr9PH2zwCjSyRbx3D9vYZfu3KWVZMKsKy5SUSc");

#[program]
pub mod qtc_contracts {
    use super::*;

    // Initialize the ecommerce program
    pub fn initialize_store(ctx: Context<InitializeStore>, store_owner: Pubkey) -> Result<()> {
        let store = &mut ctx.accounts.store;
        store.owner = store_owner;
        store.total_orders = 0;
        store.is_active = true;
        msg!("QTC Store initialized by: {:?}", store_owner);
        Ok(())
    }

    // Create a new order with escrow
    pub fn create_order(
        ctx: Context<CreateOrder>,
        order_id: u64,
        product_id: u64,
        quantity: u64,
        price_per_item: u64,
    ) -> Result<()> {
        let order = &mut ctx.accounts.order;
        let store = &mut ctx.accounts.store;

        order.order_id = order_id;
        order.buyer = ctx.accounts.buyer.key();
        order.product_id = product_id;
        order.quantity = quantity;
        order.price_per_item = price_per_item;
        order.total_amount = quantity * price_per_item;
        order.status = OrderStatus::Pending;
        order.timestamp = Clock::get()?.unix_timestamp;

        store.total_orders += 1;

        msg!("Order {} created for {} QTC", order_id, order.total_amount);
        Ok(())
    }

    // Process payment for order
    pub fn process_payment(ctx: Context<ProcessPayment>) -> Result<()> {
        let order = &mut ctx.accounts.order;
        
        // Transfer tokens from buyer to escrow
        let transfer_instruction = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };
        
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );
        
        token::transfer(cpi_ctx, order.total_amount)?;
        
        order.status = OrderStatus::Paid;
        msg!("Payment processed for order {}", order.order_id);
        Ok(())
    }

    // Complete order (release escrow to seller)
    pub fn complete_order(ctx: Context<CompleteOrder>) -> Result<()> {
        let order = &mut ctx.accounts.order;
        
        // Transfer from escrow to seller
        let transfer_instruction = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.escrow_authority.to_account_info(),
        };
        
        let seeds = &[b"escrow", &[ctx.bumps.escrow_authority]];
        let signer = &[&seeds[..]];
        
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            signer,
        );
        
        token::transfer(cpi_ctx, order.total_amount)?;
        
        order.status = OrderStatus::Completed;
        msg!("Order {} completed", order.order_id);
        Ok(())
    }
}

// Account structures
#[account]
pub struct Store {
    pub owner: Pubkey,
    pub total_orders: u64,
    pub is_active: bool,
}

#[account]
pub struct Order {
    pub order_id: u64,
    pub buyer: Pubkey,
    pub product_id: u64,
    pub quantity: u64,
    pub price_per_item: u64,
    pub total_amount: u64,
    pub status: OrderStatus,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum OrderStatus {
    Pending,
    Paid,
    Completed,
    Refunded,
    Cancelled,
}

// Context structures
#[derive(Accounts)]
pub struct InitializeStore<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + 8 + 1
    )]
    pub store: Account<'info, Store>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(order_id: u64)]
pub struct CreateOrder<'info> {
    #[account(
        init,
        payer = buyer,
        space = 8 + 8 + 32 + 8 + 8 + 8 + 8 + 1 + 8,
        seeds = [b"order", order_id.to_le_bytes().as_ref()],
        bump
    )]
    pub order: Account<'info, Order>,
    #[account(mut)]
    pub store: Account<'info, Store>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessPayment<'info> {
    #[account(mut)]
    pub order: Account<'info, Order>,
    #[account(mut)]
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CompleteOrder<'info> {
    #[account(mut)]
    pub order: Account<'info, Order>,
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,
    /// CHECK: This is the escrow authority PDA
    #[account(
        seeds = [b"escrow"],
        bump
    )]
    pub escrow_authority: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
}
