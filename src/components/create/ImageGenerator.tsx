'use client';
import { useState } from 'react';
import { FACE_GENERATION_API, BODY_GENERATION_API, generateFacePrompt, generateBodyPrompt, parseImageResponse } from '@/utils/imageGeneration';

// Constants for coin costs and retry attempts
export const FACE_GENERATION_COST = 2; // Costs 2 coins to generate a face
export const BODY_GENERATION_COST = 5; // Costs 5 coins to generate a body
const MAX_RETRY_ATTEMPTS = 2;

interface ImageGeneratorProps {
  step: number;
  gender: string;
  age: string;
  ethnicity: string;
  eyeColor: string;
  hairColor: string;
  hairStyle: string;
  bodyShape: string;
  breastSize: string;
  buttSize: string;
  hasEnoughCoins: (amount: number) => boolean;
  useCoins: (amount: number) => Promise<boolean>;
  setFacePrompt: (prompt: string) => void;
  setBodyPrompt: (prompt: string) => void;
  setFaceImageVariants: (variants: string[]) => void;
  setSelectedFaceVariantIndex: (index: number) => void;
  setBodyImageVariants: (variants: string[]) => void;
  setSelectedVariantIndex: (index: number) => void;
  setPreviewImage: (url: string) => void;
}

export default function useImageGenerator({
  step,
  gender,
  age,
  ethnicity,
  eyeColor,
  hairColor,
  hairStyle,
  bodyShape,
  breastSize,
  buttSize,
  hasEnoughCoins,
  useCoins,
  setFacePrompt,
  setBodyPrompt,
  setFaceImageVariants,
  setSelectedFaceVariantIndex,
  setBodyImageVariants,
  setSelectedVariantIndex,
  setPreviewImage
}: ImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasGeneratedImage, setHasGeneratedImage] = useState(false);

  const handleGenerateImage = async () => {
    try {
      // Check if user has enough coins
      const coinCost = step >= 4 ? FACE_GENERATION_COST + BODY_GENERATION_COST : FACE_GENERATION_COST;
      
      if (!hasEnoughCoins(coinCost)) {
        setErrorMessage(`Not enough coins. You need ${coinCost} coins to generate this image.`);
        return;
      }
      
      setIsGenerating(true);
      setErrorMessage(null);
      setHasGeneratedImage(false); // Reset the generated image flag
      setBodyImageVariants([]); // Reset image variants
      setFaceImageVariants([]); // Reset face image variants
      
      // Make sure we have the minimum required fields
      if (!gender || !age || !ethnicity) {
        setErrorMessage('Please fill in all basic details (gender, age, ethnicity) before generating an image');
        setIsGenerating(false);
        return;
      }
      
      const requestData = {
        gender,
        age,
        ethnicity,
        eyeColor: eyeColor || '',
        hairColor: hairColor || '',
        hairStyle: hairStyle || '',
        bodyShape: bodyShape || '',
        breastSize: breastSize || '',
        buttSize: buttSize || '',
      };
      
      console.log('Sending request with data:', requestData);
      
      // For step 4, use both face and body generation APIs in sequence
      if (step >= 4) {
        try {
          // First, generate the face with retry logic
          let faceGenerationSuccessful = false;
          let faceData;
          let attemptCount = 0;
          
          while (!faceGenerationSuccessful && attemptCount < MAX_RETRY_ATTEMPTS) {
            attemptCount++;
            try {
              // Call Firebase Function directly
              const faceResponse = await fetch(FACE_GENERATION_API, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({
                  data: {
                    prompt: generateFacePrompt(requestData),
                    numSamples: 1
                  }
                }),
              });
              
              if (!faceResponse.ok) {
                const errorData = await faceResponse.json();
                console.error(`Face API error (attempt ${attemptCount}):`, errorData);
                if (attemptCount >= MAX_RETRY_ATTEMPTS) {
                  throw new Error(errorData.error || 'Failed to generate face after multiple attempts');
                }
                // Wait a moment before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
              
              const rawFaceData = await faceResponse.json();
              const prompt = generateFacePrompt(requestData);
              // Parse the response to match the expected format
              faceData = parseImageResponse(rawFaceData, prompt);
              
              console.log('Face API response:', faceData);
              
              // Store the face prompt for later
              if (faceData.prompt) {
                setFacePrompt(faceData.prompt);
              }
              
              if (!faceData.imageUrl && (!faceData.imageUrls || !faceData.imageUrls.length)) {
                console.error(`No face image URL returned (attempt ${attemptCount})`);
                if (attemptCount >= MAX_RETRY_ATTEMPTS) {
                  throw new Error('No face image URL returned after multiple attempts');
                }
                continue;
              }
              
              faceGenerationSuccessful = true;
              
              // Store face variants if available
              if (faceData.imageUrls && Array.isArray(faceData.imageUrls) && faceData.imageUrls.length > 0) {
                setFaceImageVariants(faceData.imageUrls);
                setSelectedFaceVariantIndex(0);
              }
              
            } catch (error) {
              console.error(`Face generation error (attempt ${attemptCount}):`, error);
              if (attemptCount >= MAX_RETRY_ATTEMPTS) {
                throw error;
              }
            }
          }
          
          if (!faceGenerationSuccessful || !faceData) {
            throw new Error('Failed to generate face image after multiple attempts');
          }
          
          // Now generate the body using the face image URL
          let bodyGenerationSuccessful = false;
          let bodyData;
          attemptCount = 0;
          
          while (!bodyGenerationSuccessful && attemptCount < MAX_RETRY_ATTEMPTS) {
            attemptCount++;
            try {
              // Call Firebase Function directly
              const bodyResponse = await fetch(BODY_GENERATION_API, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({
                  data: {
                    prompt: generateBodyPrompt(requestData),
                    sourceImageUrl: faceData.imageUrl,
                    numSamples: 4
                  }
                }),
              });
              
              if (!bodyResponse.ok) {
                const errorData = await bodyResponse.json();
                console.error(`Body API error (attempt ${attemptCount}):`, errorData);
                if (attemptCount >= MAX_RETRY_ATTEMPTS) {
                  throw new Error(errorData.error || 'Failed to generate body after multiple attempts');
                }
                // Wait a moment before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                continue;
              }
              
              const rawBodyData = await bodyResponse.json();
              const prompt = generateBodyPrompt(requestData);
              // Parse the response to match the expected format
              bodyData = parseImageResponse(rawBodyData, prompt);
              
              console.log('Body API response:', bodyData);
              
              // Store the body prompt for later
              if (bodyData.prompt) {
                setBodyPrompt(bodyData.prompt);
              }
              
              if (!bodyData.imageUrls || !Array.isArray(bodyData.imageUrls) || !bodyData.imageUrls.length) {
                console.error(`No body image URLs returned (attempt ${attemptCount})`);
                if (attemptCount >= MAX_RETRY_ATTEMPTS) {
                  throw new Error('No body image URLs returned after multiple attempts');
                }
                continue;
              }
              
              bodyGenerationSuccessful = true;
            } catch (error) {
              console.error(`Body generation error (attempt ${attemptCount}):`, error);
              if (attemptCount >= MAX_RETRY_ATTEMPTS) {
                throw error;
              }
            }
          }
          
          if (!bodyGenerationSuccessful || !bodyData) {
            throw new Error('Failed to generate body image after multiple attempts');
          }
          
          // Check if we received an array of image URLs
          if (bodyData.imageUrls && Array.isArray(bodyData.imageUrls) && bodyData.imageUrls.length > 0) {
            setBodyImageVariants(bodyData.imageUrls);
            setSelectedVariantIndex(0); // Select the first image by default
            setPreviewImage(bodyData.imageUrls[0]); // Display the first image
            
            // Deduct coins for successful generation
            const result = await useCoins(coinCost);
            
            setIsGenerating(false);
            setHasGeneratedImage(true);
            return;
          } 
          // Fallback to single image URL if array isn't provided
          else if (bodyData.imageUrl) {
            setBodyImageVariants([bodyData.imageUrl]);
            setSelectedVariantIndex(0);
            setPreviewImage(bodyData.imageUrl);
            
            // Deduct coins for successful generation
            const result = await useCoins(coinCost);
            
            setIsGenerating(false);
            setHasGeneratedImage(true);
            return;
          } else {
            throw new Error('No body image URLs returned');
          }
        } catch (error: any) {
          console.error('Error in face/body generation:', error);
          setErrorMessage(error.message || 'Failed to generate complete image');
          setIsGenerating(false);
          return;
        }
      } else {
        // For all other steps, just use the face generation API with retry logic
        let faceGenerationSuccessful = false;
        let faceData;
        let attemptCount = 0;
        
        while (!faceGenerationSuccessful && attemptCount < MAX_RETRY_ATTEMPTS) {
          attemptCount++;
          try {
            // Call Firebase Function directly
            const faceResponse = await fetch(FACE_GENERATION_API, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                data: {
                  prompt: generateFacePrompt(requestData),
                  numSamples: 1
                }
              }),
            });
            
            if (!faceResponse.ok) {
              const errorData = await faceResponse.json();
              console.error(`Face API error (attempt ${attemptCount}):`, errorData);
              if (attemptCount >= MAX_RETRY_ATTEMPTS) {
                throw new Error(errorData.error || 'Failed to generate face after multiple attempts');
              }
              // Wait a moment before retrying
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
            
            const rawFaceData = await faceResponse.json();
            const prompt = generateFacePrompt(requestData);
            // Parse the response to match the expected format
            faceData = parseImageResponse(rawFaceData, prompt);
            
            console.log('Face API response:', faceData);
            
            // Store the face prompt for later
            if (faceData.prompt) {
              setFacePrompt(faceData.prompt);
            }
            
            if (faceData.imageUrls && Array.isArray(faceData.imageUrls) && faceData.imageUrls.length > 0) {
              setFaceImageVariants(faceData.imageUrls);
              setSelectedFaceVariantIndex(0);
              setPreviewImage(faceData.imageUrls[0]);
              faceGenerationSuccessful = true;
            } else if (faceData.imageUrl) {
              setFaceImageVariants([faceData.imageUrl]);
              setSelectedFaceVariantIndex(0);
              setPreviewImage(faceData.imageUrl);
              faceGenerationSuccessful = true;
            } else {
              console.error(`No face image URL returned (attempt ${attemptCount})`);
              if (attemptCount >= MAX_RETRY_ATTEMPTS) {
                throw new Error('No face image URL returned after multiple attempts');
              }
              continue;
            }
            
            // Deduct coins for successful generation
            const result = await useCoins(FACE_GENERATION_COST);
            setHasGeneratedImage(true);
            
          } catch (error) {
            console.error(`Face generation error (attempt ${attemptCount}):`, error);
            if (attemptCount >= MAX_RETRY_ATTEMPTS) {
              throw error;
            }
          }
        }
        
        if (!faceGenerationSuccessful) {
          throw new Error('Failed to generate face image after multiple attempts');
        }
        
        setIsGenerating(false);
        return;
      }
    } catch (error: any) {
      console.error('Error generating image:', error);
      setErrorMessage(error.message || 'Failed to generate image. Please try again with different options.');
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    errorMessage,
    hasGeneratedImage,
    handleGenerateImage,
    setErrorMessage,
    setHasGeneratedImage
  };
} 