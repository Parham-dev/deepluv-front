import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get the prediction ID from the URL
  const { searchParams } = new URL(request.url);
  const predictionId = searchParams.get('id');
  
  if (!predictionId) {
    return NextResponse.json(
      { error: 'Prediction ID is required' },
      { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
  
  try {
    // API endpoint for the worker to check prediction status
    const workerUrl = `https://still-credit-a864.didarapp-com.workers.dev/predictions/${predictionId}`;
    
    // Make a request to the worker
    const response = await fetch(workerUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Worker API error during polling:', errorData);
      return NextResponse.json(
        { error: 'Failed to poll prediction status' }, 
        { 
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }
    
    // Get the response from the worker
    const data = await response.json();
    
    // Check prediction status
    if (data.status === 'succeeded' && data.output && data.output.length > 0) {
      return NextResponse.json({ 
        status: 'succeeded',
        imageUrl: data.output[0] 
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    } else if (data.status === 'processing' || data.status === 'starting') {
      return NextResponse.json({ 
        status: data.status,
        message: 'Image generation in progress' 
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    } else if (data.status === 'failed') {
      return NextResponse.json({ 
        status: 'failed',
        error: data.error || 'Image generation failed' 
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    } else {
      console.error('Unexpected worker response during polling:', data);
      return NextResponse.json(
        { error: 'Unexpected response from image generation service' }, 
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      );
    }
  } catch (error) {
    console.error('Error during prediction polling:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
} 