import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // First, check if we can establish a basic internet connection
    try {
      const connectivityCheck = await fetch('https://google.com');
      console.log('Google connectivity check:', connectivityCheck.status);
    } catch (e) {
      console.error('Failed to connect to Google:', e);
    }
    
    // Then try to connect to Replicate's API endpoint
    try {
      const replicateConnectionCheck = await fetch('https://api.replicate.com/v1/health', {
        method: 'GET'
      });
      console.log('Replicate connectivity check:', replicateConnectionCheck.status);
    } catch (e) {
      console.error('Failed to connect to Replicate API:', e);
    }
    
    // Check DNS resolution
    try {
      const dns = await fetch('https://api.replicate.com');
      console.log('DNS resolution for Replicate:', dns.status);
    } catch (e) {
      console.error('DNS resolution failed for Replicate:', e);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Connection test complete, check server logs',
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasReplicateToken: Boolean(process.env.REPLICATE_API_TOKEN),
        tokenStartsWith: process.env.REPLICATE_API_TOKEN ? process.env.REPLICATE_API_TOKEN.substring(0, 5) : 'none'
      }
    });
  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 