import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function GET() {
  try {
    // Basic Replicate initialization 
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    
    // Use the exact example from documentation
    const input = {
      prompt: "black forest gateau cake spelling out the words \"FLUX SCHNELL\", tasty, food photography, dynamic shot"
    };
    
    console.log("Running basic test with Flux Schnell model...");
    console.log("API token available:", Boolean(process.env.REPLICATE_API_TOKEN));
    console.log("Input:", input);
    
    // Run with the simplest format possible
    const output = await replicate.run("black-forest-labs/flux-schnell", { input });
    
    console.log("Output received, type:", typeof output);
    console.log("Is array:", Array.isArray(output));
    if (Array.isArray(output)) {
      console.log("Array length:", output.length);
      console.log("First item:", output[0]);
    } else {
      console.log("Output:", output);
    }
    
    return NextResponse.json({
      success: true,
      message: "Test completed successfully",
      output: output,
      outputType: typeof output,
      isArray: Array.isArray(output),
      firstItem: Array.isArray(output) && output.length > 0 ? output[0] : null
    });
  } catch (error: any) {
    console.error("Error testing basic approach:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error",
      stack: error.stack
    }, { status: 500 });
  }
} 