import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function GET() {
  try {
    const apiKey = process.env.REPLICATE_API_TOKEN;
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      hasReplicateToken: Boolean(apiKey),
      tokenFirstFiveChars: apiKey ? apiKey.substring(0, 5) : 'none',
      envVars: Object.keys(process.env).filter(key => 
        !key.includes('KEY') && !key.includes('SECRET') && !key.includes('TOKEN')
      )
    };
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: "API key is not available",
        envInfo
      });
    }
    
    // Only show first few and last few characters of the API key for security
    const maskedKey = `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`;
    
    const replicate = new Replicate({
      auth: apiKey,
    });
    
    // Try to list models to verify the API key works
    try {
      const modelsResponse = await replicate.models.list();
      const sampleModels = Array.isArray(modelsResponse) 
        ? modelsResponse.slice(0, 3).map(m => m.name || 'unnamed')
        : [];
      
      // Try a simple prediction to test the full flow
      try {
        const testOutput = await replicate.run(
          "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f312cb5a9e3309204ac16e6106abd6c855a3a640",
          {
            input: {
              prompt: "a photo of a cat",
              num_inference_steps: 10,
              width: 512,
              height: 512,
            }
          }
        );
        
        return NextResponse.json({
          success: true,
          message: "Replicate API key is working and generated a test image",
          apiKeyMasked: maskedKey,
          modelCount: Array.isArray(modelsResponse) ? modelsResponse.length : 'Unknown',
          sampleModels,
          testOutputType: typeof testOutput,
          testOutputIsArray: Array.isArray(testOutput),
          testOutputLength: Array.isArray(testOutput) ? testOutput.length : 'n/a',
          testOutputSample: Array.isArray(testOutput) ? testOutput[0] : testOutput,
          envInfo
        });
      } catch (predictionError: any) {
        return NextResponse.json({
          success: false,
          error: "API key works for listing models but prediction failed",
          apiKeyMasked: maskedKey,
          predictionError: predictionError.message,
          modelCount: Array.isArray(modelsResponse) ? modelsResponse.length : 'Unknown',
          sampleModels,
          envInfo
        });
      }
    } catch (modelError: any) {
      return NextResponse.json({
        success: false,
        error: "API key verification failed",
        apiKeyMasked: maskedKey,
        message: modelError.message || "Unknown error when testing API key",
        envInfo
      });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Unknown error",
    });
  }
} 