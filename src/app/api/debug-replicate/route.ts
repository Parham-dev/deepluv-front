import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function GET() {
  try {
    const apiKey = process.env.REPLICATE_API_TOKEN;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'No API key available'
      });
    }
    
    const replicate = new Replicate({
      auth: apiKey,
    });
    
    // Use a very simple prompt with the Flux Schnell model to test
    const output = await replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: {
          prompt: "A portrait photo of a person with blue eyes",
          negative_prompt: "deformed, distorted",
          num_outputs: 1,
          num_inference_steps: 25,
          guidance_scale: 7.5,
        }
      }
    );
    
    return NextResponse.json({
      success: true,
      output,
      outputType: typeof output,
      isArray: Array.isArray(output),
      length: Array.isArray(output) ? output.length : 'n/a',
      firstItem: Array.isArray(output) && output.length > 0 ? {
        value: output[0],
        type: typeof output[0]
      } : null
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      stack: error.stack
    }, { status: 500 });
  }
} 