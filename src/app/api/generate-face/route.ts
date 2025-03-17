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
        prompt
      }
    };
    
    console.log('Sending request to face API with prompt:', prompt);
    
    // Make a request to the face generation API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to generate face';
      try {
        const errorData = await response.json();
        console.error('Face generation API error:', errorData);
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
    } else if (data.imageUrl) {
      return NextResponse.json({ imageUrl: data.imageUrl });
    } else if (Array.isArray(data.output) && data.output.length > 0) {
      return NextResponse.json({ imageUrl: data.output[0] });
    } else {
      console.error('Unexpected API response:', data);
      return NextResponse.json(
        { error: 'Unexpected response from face generation service' }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error during face generation:', error);
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