# Solana Smart Contracts Explained

## How Solana Smart Contracts Work

### 1. **Programs vs Accounts**
- **Programs**: The code (like functions)
- **Accounts**: The data storage (like variables)
- Programs are **stateless** - they don't store data
- All data lives in **accounts**

### 2. **Simple Counter Example**
Our first contract does:
```rust
// Stores one number
#[account]  
pub struct Counter {
    pub count: i64,  // The actual data
}

// Functions that modify the data
pub fn initialize() -> Result<()> { ... }  // Set count = 0
pub fn increment() -> Result<()> { ... }   // count += 1  
pub fn decrement() -> Result<()> { ... }   // count -= 1
```

### 3. **Key Concepts**

#### **Context<T>**
```rust
pub fn increment(ctx: Context<Update>) -> Result<()>
```
- `ctx` contains all the accounts needed for this function
- Like function parameters, but for accounts

#### **#[account]**
```rust
#[account]
pub struct Counter { pub count: i64 }
```
- Defines data structure stored on blockchain
- Each instance costs SOL to create (rent)

#### **#[derive(Accounts)]**
```rust
#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]  
    pub counter: Account<'info, Counter>,
}
```
- Defines what accounts this function needs
- `mut` = account can be modified
- `init` = create new account
- `payer` = who pays for creation

### 4. **Real Ecommerce Example**
```rust
#[account]
pub struct Order {
    pub buyer: Pubkey,      // Who bought it
    pub amount: u64,        // How much QTC
    pub status: OrderStatus, // Pending/Paid/Completed
}

pub fn create_order(ctx: Context<CreateOrder>, amount: u64) -> Result<()> {
    let order = &mut ctx.accounts.order;
    order.buyer = ctx.accounts.buyer.key();
    order.amount = amount;
    order.status = OrderStatus::Pending;
    Ok(())
}
```

### 5. **Why Smart Contracts?**
- **Trust**: Code can't be changed once deployed
- **Automation**: Automatic escrow, refunds, etc.
- **Transparency**: All transactions visible on blockchain
- **No middleman**: Direct peer-to-peer commerce

## Next Steps
1. Build simple counter in Docker
2. Add QTC token interactions  
3. Build order escrow system
4. Deploy to devnet
5. Connect to frontend