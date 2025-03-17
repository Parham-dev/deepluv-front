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
        sourceImageUrl
      }
    };
    
    console.log('Sending request to body API with prompt:', prompt);
    console.log('Using source image URL:', sourceImageUrl);
    
    // Make a request to the body generation API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to generate body';
      try {
        const errorData = await response.json();
        console.error('Body generation API error:', errorData);
        if (errorData.error && errorData.error.message) {
          errorMessage = errorData.error.message;
        }
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      
      return NextResponse.json(
        { error: errorMessage }, 
        { status: response.status }
      );
    }
    
    // Get the response from the API
    const data = await response.json();
    console.log('Full API response:', data);
    
    // Extract imageUrl from the data structure
    // Handling multiple possible response formats
    if (data.result && data.result.imageUrl) {
      return NextResponse.json({ imageUrl: data.result.imageUrl });
    } else if (data.result && data.result.imageUrls && Array.isArray(data.result.imageUrls) && data.result.imageUrls.length > 0) {
      // Handle case where API returns multiple URLs in an array
      return NextResponse.json({ imageUrl: data.result.imageUrls[0] });
    } else if (data.imageUrl) {
      return NextResponse.json({ imageUrl: data.imageUrl });
    } else if (data.imageUrls && Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
      // Handle case where API returns an array of image URLs directly
      return NextResponse.json({ imageUrl: data.imageUrls[0] });
    } else if (Array.isArray(data.output) && data.output.length > 0) {
      return NextResponse.json({ imageUrl: data.output[0] });
    } else {
      console.error('Unexpected API response:', data);
      return NextResponse.json(
        { error: 'Unexpected response from body generation service' }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error during body generation:', error);
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