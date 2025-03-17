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

    // Validate required fields
    if (!gender || !age || !ethnicity) {
      console.error("Missing required fields");
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: gender, age, and ethnicity are required' 
      }, { status: 400 });
    }

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

    // Define negative prompt to avoid unwanted elements
    const negativePrompt = "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, amputation";

    // Run the model with the prompt
    console.log("Calling Replicate API...");
    try {
      console.log("About to call Replicate API with token:", process.env.REPLICATE_API_TOKEN ? "present" : "missing");
      
      // Create the input object
      const input = {
        prompt: prompt,
        negative_prompt: negativePrompt,
        num_outputs: 1,
        num_inference_steps: 4
      };
      
      console.log("Input to Replicate:", input);
      
      // Call the model with the simplified approach
      const output = await replicate.run("black-forest-labs/flux-schnell", { input });
      
      console.log("Replicate API response received, type:", typeof output);
      console.log("Response is array:", Array.isArray(output));
      if (Array.isArray(output)) {
        console.log("Array length:", output.length);
        if (output.length > 0) {
          console.log("First item type:", typeof output[0]);
          console.log("First item preview:", typeof output[0] === 'string' ? output[0].substring(0, 100) : JSON.stringify(output[0]).substring(0, 100));
        }
      }
      
      // Extract image URL from output and ensure it's a string
      let imageUrl = null;
      if (Array.isArray(output) && output.length > 0) {
        imageUrl = typeof output[0] === 'string' ? output[0] : null;
      } else if (typeof output === 'string') {
        imageUrl = output;
      } else if (output && typeof output === 'object') {
        // Some models might return objects with different structures
        console.log("Unexpected output format, trying to extract URL:", output);
        // Try to look for a URL-like string in the object
        const outputStr = JSON.stringify(output);
        const urlMatch = outputStr.match(/(https?:\/\/[^\s"']+\.(?:jpg|jpeg|png|webp))/i);
        if (urlMatch && urlMatch[0]) {
          imageUrl = urlMatch[0];
        }
      }
      
      if (!imageUrl || typeof imageUrl !== 'string' || imageUrl === '') {
        console.error("Empty or missing image URL in Replicate response:", output);
        return NextResponse.json({ 
          success: false, 
          error: 'No valid image generated from the model',
          output: output,
          outputType: typeof output,
          isArray: Array.isArray(output),
          length: Array.isArray(output) ? output.length : 'n/a'
        }, { status: 500 });
      }

      // Return the generated image URL
      return NextResponse.json({ success: true, imageUrl });
    } catch (replicateError: any) {
      console.error("Replicate API error:", replicateError);
      return NextResponse.json({ 
        success: false, 
        error: `Replicate API error: ${replicateError.message || 'Unknown error'}`,
        details: replicateError
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in generate-image API route:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate image',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 