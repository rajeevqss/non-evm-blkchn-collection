import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Jupiter swap API called');
    
    const body = await request.json();
    const { quoteResponse, userPublicKey } = body;

    console.log('📊 Swap request:', { userPublicKey, hasQuote: !!quoteResponse });

    if (!quoteResponse || !userPublicKey) {
      console.log('❌ Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters: quoteResponse, userPublicKey' },
        { status: 400 }
      );
    }

    // Call Jupiter Swap API
    const swapUrl = 'https://lite-api.jup.ag/swap/v1/swap';
    
    const swapBody = {
      quoteResponse,
      userPublicKey,
      wrapAndUnwrapSol: true,
      // computeUnitPriceMicroLamports: 'auto', // Optional: for priority fees
    };

    console.log('🔗 Calling Jupiter swap URL:', swapUrl);
    
    const response = await fetch(swapUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'QTC-Web-Contract/1.0'
      },
      body: JSON.stringify(swapBody),
    });

    console.log('📡 Jupiter swap response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Jupiter swap API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to get swap transaction from Jupiter', 
          status: response.status,
          details: errorText,
          swapUrl: swapUrl
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Jupiter swap response received');
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('💥 Jupiter swap proxy error:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}