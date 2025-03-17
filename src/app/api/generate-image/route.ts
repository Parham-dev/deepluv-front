import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const requestData = await request.json();
    
    // API endpoint for the worker - changed from predictions to models with the Flux Schnell model ID
    const workerUrl = 'https://still-credit-a864.didarapp-com.workers.dev/models/black-forest-labs/flux-schnell/predictions';
    
    // Define the Flux Schnell model parameters based on the user's selections
    const modelParams = {
      input: {
        prompt: generatePrompt(requestData),
        num_outputs: 1,
        negative_prompt: "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, mutated hands and fingers, disconnected limbs, mutation, mutated, ugly, disgusting, blurry, amputation"
      }
    };
    
    // Make a request to the worker
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(modelParams),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Worker API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate image' }, 
        { status: response.status }
      );
    }
    
    // Get the response from the worker
    const data = await response.json();
    
    // Check if the prediction is completed or if we need to poll for results
    if (data.status === 'succeeded' && data.output && data.output.length > 0) {
      return NextResponse.json({ imageUrl: data.output[0] }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    } else if (data.status === 'processing' || data.status === 'starting') {
      // Return the prediction ID for polling
      return NextResponse.json({ 
        predictionId: data.id,
        status: data.status,
        message: 'Image generation in progress, polling required'
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    } else {
      console.error('Unexpected worker response:', data);
      return NextResponse.json(
        { error: 'Unexpected response from image generation service' }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error during image generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Helper function to generate a prompt based on user selections
function generatePrompt(data: any): string {
  const {
    gender,
    age,
    ethnicity,
    eyeColor,
    hairColor,
    hairStyle,
    bodyShape,
    breastSize,
    buttSize
  } = data;
  
  let prompt = `A photorealistic portrait of a ${age} year old ${ethnicity} ${gender}`;
  
  // Add facial features
  if (eyeColor) prompt += ` with ${eyeColor} eyes`;
  if (hairColor && hairStyle) {
    prompt += `, ${hairColor} ${hairStyle} hair`;
  } else if (hairColor) {
    prompt += `, ${hairColor} hair`;
  } else if (hairStyle) {
    prompt += `, ${hairStyle} hair`;
  }
  
  // Add body features
  if (bodyShape) prompt += `, ${bodyShape} body shape`;
  
  // Add gender-specific features
  if (gender.toLowerCase() === 'female') {
    if (breastSize) prompt += `, ${breastSize} breast size`;
    if (buttSize) prompt += `, ${buttSize} butt size`;
  }
  
  // Additional quality keywords
  prompt += ", high quality, detailed, 4k, intricate, highly detailed";
  
  return prompt;
} 