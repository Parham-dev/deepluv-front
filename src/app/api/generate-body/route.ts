import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const requestData = await request.json();
    const { sourceImageUrl } = requestData;
    
    if (!sourceImageUrl) {
      return NextResponse.json(
        { error: 'Source image URL is required' }, 
        { status: 400 }
      );
    }
    
    // API endpoint for body generation
    const apiUrl = 'https://generatebody-wyzrfw2zma-uc.a.run.app';
    
    // Prepare request payload to match the cloud function expectations
    const prompt = generatePrompt(requestData);
    
    // Using the exact format expected by Firebase callable functions
    const payload = {
      data: {
        prompt,
        sourceImageUrl,
        // Explicitly request multiple variants
        numSamples: 4 // Generate 4 different body variations
      }
    };
    
    console.log('Sending request to body API with prompt:', prompt);
    console.log('Using source image URL:', sourceImageUrl);
    
    // Add timeout to the body generation API request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout (body generation takes longer)
    
    // Make a request to the body generation API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    }).catch(err => {
      if (err.name === 'AbortError') {
        throw new Error('Body generation request timed out after 120 seconds');
      }
      throw err;
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorMessage = 'Failed to generate body';
      let errorDetails = {};
      
      try {
        const errorData = await response.json();
        console.error('Body generation API error:', errorData);
        errorDetails = errorData;
        
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      
      // Check for specific error types and provide better error messages
      if (response.status === 500) {
        errorMessage = 'The body generation service encountered an internal error. Please try a different combination of features.';
      } else if (response.status === 429) {
        errorMessage = 'Too many requests to the body generation service. Please try again later.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid request to body generation service. Some selected features may be incompatible.';
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails
        }, 
        { status: response.status }
      );
    }
    
    // Get the response from the API
    const data = await response.json();
    console.log('Full API response:', data);
    
    // Extract image URLs from the data structure
    // Handle various response formats and always return an array
    let imageUrls: string[] = [];
    
    if (data.result && data.result.imageUrls && Array.isArray(data.result.imageUrls)) {
      // Handle case where API returns multiple URLs in result.imageUrls
      imageUrls = data.result.imageUrls;
    } else if (data.imageUrls && Array.isArray(data.imageUrls)) {
      // Handle case where API returns an array of image URLs directly
      imageUrls = data.imageUrls;
    } else if (Array.isArray(data.output)) {
      // Handle case where API returns URLs in output array
      imageUrls = data.output;
    } else if (data.result && data.result.imageUrl) {
      // Handle single URL in result.imageUrl
      imageUrls = [data.result.imageUrl];
    } else if (data.imageUrl) {
      // Handle single URL directly in response
      imageUrls = [data.imageUrl];
    }
    
    // Always return imageUrls array, even if only one image
    if (imageUrls.length > 0) {
      return NextResponse.json({ 
        imageUrls: imageUrls,
        // Include the first URL as imageUrl for backward compatibility
        imageUrl: imageUrls[0],
        prompt: prompt // Include the prompt in the response
      });
    } else {
      console.error('No image URLs found in API response:', data);
      return NextResponse.json(
        { error: 'No image URLs returned from body generation service' }, 
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error during body generation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' }, 
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
    bodyShape,
    breastSize,
    buttSize
  } = data;
  
  // Start with the same base prompt format as the face API
  let prompt = `A photorealistic full body image of a ${age} year old ${ethnicity} ${gender}. wearing a fancy clothing.`;
  
  // Add body features with the same sentence structure as face API
  if (bodyShape) prompt += ` with ${bodyShape} body shape`;
  
  // Add gender-specific features
  if (gender.toLowerCase() === 'female') {
    if (breastSize) {
      // If we already added "with" for body shape, use a comma
      if (bodyShape) {
        prompt += `, ${breastSize} breast size`;
      } else {
        prompt += ` with ${breastSize} breast size`;
      }
    }
    
    if (buttSize) {
      prompt += `, ${buttSize} butt size`;
    }
  }
  
  // Use exact same quality keywords as face API
  prompt += ", high quality, detailed, 4k, intricate, highly detailed";
  
  return prompt;
} 