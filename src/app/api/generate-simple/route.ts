import { NextResponse } from 'next/server';
import Replicate from 'replicate';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    // Check if API token is available
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("Missing Replicate API token");
      return NextResponse.json({ 
        success: false, 
        error: 'Configuration error: Missing Replicate API token' 
      }, { status: 500 });
    }

    // Parse the request body
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ 
        success: false, 
        error: 'Prompt is required' 
      }, { status: 400 });
    }

    console.log("Simplified generate with prompt:", prompt);

    // Run the model with just the prompt
    try {
      const output = await replicate.run(
        "black-forest-labs/flux-schnell",
        {
          input: {
            prompt: prompt,
            negative_prompt: "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy",
            num_outputs: 1,
          }
        }
      );

      console.log("Replicate output:", JSON.stringify(output));

      // Extract image URL from output
      const imageUrl = Array.isArray(output) ? output[0] : null;

      if (!imageUrl) {
        return NextResponse.json({ 
          success: false, 
          error: 'No image generated' 
        }, { status: 500 });
      }

      return NextResponse.json({ success: true, imageUrl });
    } catch (replicateError: any) {
      console.error("Replicate API error:", replicateError);
      return NextResponse.json({ 
        success: false, 
        error: `Replicate API error: ${replicateError.message || 'Unknown error'}`,
        details: replicateError
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Error in generate-simple:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error' 
    }, { status: 500 });
  }
} 