import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Jupiter quote API called');
    
    const { searchParams } = new URL(request.url);
    const inputMint = searchParams.get('inputMint');
    const outputMint = searchParams.get('outputMint');
    const amount = searchParams.get('amount');
    const slippageBps = searchParams.get('slippageBps') || '50';

    console.log('📊 Request params:', { inputMint, outputMint, amount, slippageBps });

    if (!inputMint || !outputMint || !amount) {
      console.log('❌ Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters: inputMint, outputMint, amount' },
        { status: 400 }
      );
    }

    // Call Jupiter API from server-side
    const jupiterUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;
    
    console.log('🔗 Calling Jupiter URL:', jupiterUrl);
    
    const response = await fetch(jupiterUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'QTC-Web-Contract/1.0'
      },
    });

    console.log('📡 Jupiter response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Jupiter API error:', response.status, errorText);
      
      return NextResponse.json(
        { 
          error: 'Failed to get quote from Jupiter', 
          status: response.status,
          details: errorText,
          jupiterUrl: jupiterUrl
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Jupiter response received:', Object.keys(data));
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('💥 Jupiter quote proxy error:', error);
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