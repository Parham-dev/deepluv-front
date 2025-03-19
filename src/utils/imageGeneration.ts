// Firebase Cloud Function URLs
export const FACE_GENERATION_API = 'https://generateface-wyzrfw2zma-uc.a.run.app';
export const BODY_GENERATION_API = 'https://generatebody-wyzrfw2zma-uc.a.run.app';

// Helper function to generate a face prompt
export const generateFacePrompt = (data: any): string => {
  const {
    gender,
    age,
    ethnicity,
    eyeColor,
    hairColor,
    hairStyle
  } = data;
  
  let prompt = `A realistic portrait of a ${age} year old ${ethnicity} ${gender}`;
  
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
};

// Helper function to generate a body prompt
export const generateBodyPrompt = (data: any): string => {
  const {
    gender,
    age,
    ethnicity,
    bodyShape,
    breastSize,
    buttSize
  } = data;
  
  // Start with the same base prompt format as the face API
  let prompt = `A realistic full body image of a ${age} year old ${ethnicity} ${gender}. `;
  if (gender.toLowerCase() === 'female') {
    prompt += `wearing a nice dress.`;
  } else {
    prompt += `wearing a nice suits.`;
  }
  
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
};

// Helper function to parse the API response
export const parseImageResponse = (rawData: any, prompt: string) => {
  return {
    imageUrl: rawData.result?.imageUrl || 
              (rawData.result?.imageUrls?.[0]) || 
              rawData.imageUrl || 
              (rawData.imageUrls?.[0]) || 
              (Array.isArray(rawData.output) ? rawData.output[0] : null),
    imageUrls: rawData.result?.imageUrls || 
               rawData.imageUrls || 
               (Array.isArray(rawData.output) ? rawData.output : 
               (rawData.result?.imageUrl ? [rawData.result.imageUrl] : 
               (rawData.imageUrl ? [rawData.imageUrl] : []))),
    prompt: prompt
  };
}; 