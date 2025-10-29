# 🚀 POC Smart Contract Client

## ✅ LIVE CONTRACT INFORMATION

**🎯 Smart Contract**: `HtiGuMFXmrhrXC2VsRj4T9faQXXYZanhyW6WUtNu3v7j`  
**🪙 Token Mint**: `6diASnAchdpwsiqvvi7rcfgztXNbA3RbvSzJXa6BX3iE`  
**🌐 Network**: Solana Devnet  
**📊 Supply**: 100,000 POC-QTC tokens  
**🔢 Decimals**: 9  

## 🔗 Live Explorer Links

- **Smart Contract**: https://explorer.solana.com/address/HtiGuMFXmrhrXC2VsRj4T9faQXXYZanhyW6WUtNu3v7j?cluster=devnet
- **Token Mint**: https://explorer.solana.com/address/6diASnAchdpwsiqvvi7rcfgztXNbA3RbvSzJXa6BX3iE?cluster=devnet

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run the client demo
npm run demo
```

## 📋 Available Contract Functions

1. **initialize()** - Set up contract with mint authority
2. **mint_tokens(amount)** - Create new POC-QTC tokens (authority only)
3. **transfer_tokens(amount)** - Transfer tokens between accounts
4. **transfer_to_phantom_wallet()** - Transfer 500 POC-QTC to specific wallet
5. **deactivate()** - Emergency stop (authority only)

## 💻 Integration Example

```javascript
const client = new TokenManagerClient();

// Check balances
await client.checkSolBalance();
await client.checkBalance();

// Contract interactions (ready to implement)
await client.mintTokensViaContract(1000);
await client.transferTokens('TARGET_WALLET', 500);
```

## 🔧 Current Status

- ✅ **Contract**: DEPLOYED and LIVE
- ✅ **Token**: MINTED and FUNCTIONAL  
- ✅ **Client**: UPDATED with live values
- 🔄 **Next**: Implement actual Anchor contract calls

## 📱 Ready for Your App!

The contract is live and ready for integration into your client application. All addresses and values have been updated to match your deployed contracts.