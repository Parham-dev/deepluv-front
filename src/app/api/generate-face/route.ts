import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const requestData = await request.json();
    
    // API endpoint for face generation
    const apiUrl = 'https://generateface-wyzrfw2zma-uc.a.run.app';
    
    // Prepare request payload to match the cloud function expectations
    const prompt = generatePrompt(requestData);
    
    // Using the exact format expected by Firebase callable functions
    const payload = {
      data: {
        prompt,
        // Add parameter to generate multiple images
        numSamples: 1 // Start with 1, can be increased if needed
      }
    };
    
    console.log('Sending request to face API with prompt:', prompt);
    
    // Add timeout to the face generation API request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    // Make a request to the face generation API
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
        throw new Error('Face generation request timed out after 60 seconds');
      }
      throw err;
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      let errorMessage = 'Failed to generate face';
      let errorDetails = {};
      
      try {
        const errorData = await response.json();
        console.error('Face generation API error:', errorData);
        errorDetails = errorData;
        
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      
      // Check for specific error types and provide better error messages
      if (response.status === 500) {
        errorMessage = 'The face generation service encountered an internal error. Please try a different combination of features.';
      } else if (response.status === 429) {
        errorMessage = 'Too many requests to the face generation service. Please try again later.';
      } else if (response.status === 400) {
        errorMessage = 'Invalid request to face generation service. Some selected features may be incompatible.';
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
    
    // Extract image URLs from the data structure and always return an array
    let imageUrls: string[] = [];
    
    // Handle various response formats
    if (data.result && data.result.imageUrls && Array.isArray(data.result.imageUrls)) {
      imageUrls = data.result.imageUrls;
    } else if (data.imageUrls && Array.isArray(data.imageUrls)) {
      imageUrls = data.imageUrls;
    } else if (Array.isArray(data.output)) {
      imageUrls = data.output;
    } else if (data.result && data.result.imageUrl) {
      imageUrls = [data.result.imageUrl];
    } else if (data.imageUrl) {
      imageUrls = [data.imageUrl];
    }
    
    if (imageUrls.length > 0) {
      // Return both the array of URLs and the first one for backward compatibility
      return NextResponse.json({ 
        imageUrls: imageUrls,
        imageUrl: imageUrls[0],
        prompt: prompt
      });
    } else {
      console.error('No image URLs found in API response:', data);
      return NextResponse.json(
        { error: 'No image URLs returned from face generation service' }, 
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error during face generation:', error);
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
    eyeColor,
    hairColor,
    hairStyle
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
  
  // Additional quality keywords
  prompt += ", high quality, detailed, 4k, intricate, highly detailed";
  
  return prompt;
} 