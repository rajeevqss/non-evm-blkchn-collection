const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { createCreateMetadataAccountV3Instruction } = require('@metaplex-foundation/mpl-token-metadata');
const fs = require('fs');

async function createTokenMetadata() {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Load keypair
    const keypairFile = fs.readFileSync('./qtc-parent-wallet.json');
    const keypairData = JSON.parse(keypairFile.toString());
    const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));
    
    const tokenMint = new PublicKey('97DBMXWBGAmF8fiWqcmNPuuqCu1MBeWSnpcdsz2vRQni');
    
    console.log('Creating metadata for QTC token...');
    
    try {
        const metadata = {
            name: 'QTC Token',
            symbol: 'QTC',
            description: 'QTC Token for ecommerce transactions',
            image: 'https://www.qsstechnosoft.com/web/image/website/3/favicon?unique=6a855b9',
            external_url: '',
            attributes: [],
            properties: {
                files: [{
                    uri: 'https://www.qsstechnosoft.com/web/image/website/3/favicon?unique=6a855b9',
                    type: 'image/png'
                }],
                category: 'image'
            }
        };
        
        // Upload metadata to a simple JSON hosting service
        console.log('Metadata object created:', metadata);
        
        // For now, let's use a simple approach with Sugar CLI
        console.log('Use Sugar CLI or Metaplex to upload metadata properly');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

createTokenMetadata();