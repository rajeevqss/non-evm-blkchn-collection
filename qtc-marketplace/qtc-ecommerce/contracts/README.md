# QTC Ecommerce Smart Contracts

## Overview
Custom Solana programs for QTC ecommerce functionality.

## Programs Needed

### 1. Order Management Program
- Create orders with escrow
- Handle payment completion
- Manage refunds/returns
- Track order status

### 2. Product Inventory Program  
- Track product stock levels
- Handle product availability
- Manage product metadata

### 3. Marketplace Program
- Handle multi-vendor scenarios
- Manage seller fees
- Revenue splitting

## Installation Requirements

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI (already installed)

# Install Anchor framework
npm install -g @coral-xyz/anchor-cli
```

## Current Status
- Using SPL Token Program for basic QTC transfers
- Need custom programs for advanced ecommerce features