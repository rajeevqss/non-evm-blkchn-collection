#!/bin/bash

echo "🚀 Setting up Demo Smart Contract Environment"

# Check if we're in Docker
if [ -f /.dockerenv ]; then
    echo "📦 Running in Docker container"
    
    # Set up Solana CLI
    echo "⚙️ Configuring Solana CLI..."
    solana config set --url devnet
    
    # Create parent wallet
    echo "👛 Creating parent wallet..."
    solana-keygen new --outfile /workspace/demo-parent-wallet.json --no-bip39-passphrase
    
    # Request airdrop
    echo "💰 Requesting SOL airdrop..."
    solana airdrop 2
    
    # Initialize Anchor project
    echo "🔧 Initializing Anchor project..."
    anchor init demo-contracts --typescript
    
    echo "✅ Setup complete!"
    echo "📝 Next steps:"
    echo "1. Create DEMO-QTC token: spl-token create-token --decimals 6"
    echo "2. Create token account: spl-token create-account <TOKEN_MINT>"
    echo "3. Mint tokens: spl-token mint <TOKEN_MINT> 100000"
    
else
    echo "🐳 Starting Docker container..."
    docker-compose up -d --build
    
    echo "🔄 Enter the container with:"
    echo "docker exec -it demo-smart-contract-dev bash"
    echo "Then run: ./setup.sh"
fi