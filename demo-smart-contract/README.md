# Demo Smart Contract Project

This project demonstrates Solana smart contract development from scratch.

## What We'll Build

1. **DEMO-QTC Token**: SPL token with 100k initial supply
2. **Parent Wallet**: Holds the initial token supply
3. **Smart Contracts**:
   - Token minting contract
   - Token transfer contract
   - Balance checking contract
   - Advanced features (escrow, multi-sig, etc.)

## Getting Started

### Option 1: Using Docker (Recommended)

```bash
# Build and run the container
docker-compose up -d --build

# Enter the container
docker exec -it demo-smart-contract-dev bash

# Inside container - set up Solana
solana config set --url devnet
solana-keygen new --outfile demo-parent-wallet.json
solana airdrop 2
```

### Option 2: Local Setup

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest && avm use latest
```

## Project Structure

```
demo-smart-contract/
├── programs/           # Smart contract programs
│   └── demo-contracts/
├── app/               # TypeScript client
├── tests/             # Integration tests  
├── migrations/        # Deployment scripts
└── wallets/           # Keypair files
```

## Smart Contracts We'll Build

1. **TokenManager**: Mint/burn tokens
2. **TokenTransfer**: Safe token transfers  
3. **Escrow**: Hold tokens in escrow
4. **Marketplace**: Basic DEX functionality