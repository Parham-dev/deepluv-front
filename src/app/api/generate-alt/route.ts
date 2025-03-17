import { NextResponse } from 'next/server';
import Replicate from 'replicate';

// Initialize Replicate client - API key will be automatically loaded from environment variable
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

    // Parse request body
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body));
    
    const {
      gender,
      age,
      ethnicity,
      eyeColor,
      hairColor,
      hairStyle,
      bodyShape,
      breastSize,
      buttSize,
    } = body;

    // Create a prompt for the model based on selected attributes
    let prompt = `A photorealistic portrait of a ${age} ${ethnicity} ${gender} with ${eyeColor} eyes, `;
    prompt += `${hairColor} ${hairStyle} hair, ${bodyShape} body type`;
    
    if (gender === 'female' && breastSize) {
      prompt += `, ${breastSize} breast size`;
    }
    
    if (buttSize) {
      prompt += `, ${buttSize} butt size`;
    }
    
    prompt += `. High quality, detailed, smooth lighting, professional photography.`;
    console.log("Generated prompt:", prompt);

    // Use a backup model - Stable Diffusion instead of Flux Schnell
    console.log("Using alternative model: stability-ai/stable-diffusion");
    try {
      // Create the input object
      const input = {
        prompt: prompt,
        negative_prompt: "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy",
        width: 768,
        height: 768,
        num_outputs: 1,
        num_inference_steps: 30,
        guidance_scale: 7.5,
      };
      
      console.log("Input to alternative model:", input);
      
      // Call the model with the simplified approach
      const output = await replicate.run(
        "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f312cb5a9e3309204ac16e6106abd6c855a3a640",
        { input }
      );

      console.log("Alternative API response received, type:", typeof output);
      console.log("Response is array:", Array.isArray(output));
      
      // Extract image URL from output
      let imageUrl = null;
      if (Array.isArray(output) && output.length > 0) {
        imageUrl = typeof output[0] === 'string' ? output[0] : null;
      } else if (typeof output === 'string') {
        imageUrl = output;
      }
      
      if (!imageUrl || typeof imageUrl !== 'string' || imageUrl === '') {
        console.error("No valid image URL in response:", output);
        return NextResponse.json({ 
          success: false, 
          error: 'No valid image generated',
          outputDetails: {
            type: typeof output,
            isArray: Array.isArray(output),
            length: Array.isArray(output) ? output.length : 'n/a'
          }
        }, { status: 500 });
      }

      // Return the generated image URL
      return NextResponse.json({ success: true, imageUrl });
    } catch (replicateError: any) {
      console.error("Alternative API error:", replicateError);
      return NextResponse.json({ 
        success: false, 
        error: `API error: ${replicateError.message || 'Unknown error'}`,
        details: replicateError
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in generate-alt API route:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate image',
      details: error.message || String(error)
    }, { status: 500 });
  }
} 