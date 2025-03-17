import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.REPLICATE_API_TOKEN;
    
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      hasReplicateToken: Boolean(apiKey),
      tokenFirstFiveChars: apiKey ? apiKey.substring(0, 5) : 'none',
      tokenLength: apiKey ? apiKey.length : 0,
      envVarKeys: Object.keys(process.env).filter(key => 
        !key.includes('KEY') && !key.includes('SECRET') && !key.includes('TOKEN')
      )
    };
    
    return NextResponse.json({
      success: true,
      message: "Environment check",
      envInfo
    });
    
  } catch (error) {
    console.error('Test route error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
} 