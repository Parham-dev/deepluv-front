'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { useUserCoins } from '@/hooks/useUserCoins';
import MainLayout from '@/components/layout/MainLayout';
import SelectionCard from '@/components/create/SelectionCard';
import Image from 'next/image';
import { createCompanion } from '@/firebase/firestore/companionService';
import {
  companionTypes,
  genderOptions,
  breastSizeOptions,
  personalityOptions,
  formSteps,
  getAgeOptions,
  getEthnicityOptions,
  getEyeColorOptions,
  getHairColorOptions,
  getHairStyleOptions,
  getBodyShapeOptions,
  getButtSizeOptions
} from './options';
import { getGenderFilteredOptions, getPreviewParams } from './utils';

export default function Create() {
  const { user } = useAuthContext() as { user: any };
  const { coins, useCoins, hasEnoughCoins } = useUserCoins();
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Form state
  const [companionType, setCompanionType] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  
  // Face state
  const [eyeColor, setEyeColor] = useState('');
  const [hairColor, setHairColor] = useState('');
  const [hairStyle, setHairStyle] = useState('');
  
  // Body state
  const [bodyShape, setBodyShape] = useState('');
  const [breastSize, setBreastSize] = useState('');
  const [buttSize, setButtSize] = useState('');
  
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState<string[]>([]);
  
  // Preview image state (would be generated based on selections)
  const [previewImage, setPreviewImage] = useState('https://placehold.co/400x500/333333/FFFFFF?text=Preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedImage, setHasGeneratedImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Add state for body image variants
  const [bodyImageVariants, setBodyImageVariants] = useState<string[]>([]);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);

  // Add state for face image variants
  const [faceImageVariants, setFaceImageVariants] = useState<string[]>([]);
  const [selectedFaceVariantIndex, setSelectedFaceVariantIndex] = useState<number>(0);
  
  // Add state for prompt storage
  const [facePrompt, setFacePrompt] = useState('');
  const [bodyPrompt, setBodyPrompt] = useState('');
  
  // Add state for saving to Firebase
  const [isSavingCompanion, setIsSavingCompanion] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);

  // Add constant for retry attempts
  const MAX_RETRY_ATTEMPTS = 2;

  // Constants for coin costs
  const FACE_GENERATION_COST = 2; // Costs 2 coins to generate a face
  const BODY_GENERATION_COST = 5; // Costs 5 coins to generate a body

  // Add Firebase Cloud Function URLs
  const FACE_GENERATION_API = 'https://generateface-wyzrfw2zma-uc.a.run.app';
  const BODY_GENERATION_API = 'https://generatebody-wyzrfw2zma-uc.a.run.app';

  // Debug effect to log when preview image changes
  useEffect(() => {
    console.log('Preview image updated:', previewImage);
    if (previewImage.includes('replicate.delivery')) {
      setHasGeneratedImage(true);
    }
  }, [previewImage]);

  // Update preview image when relevant selections change
  useEffect(() => {
    if (step >= 2) {
      // Only update the placeholder if we're not in the middle of generation
      // AND if the current image is not from replicate.delivery (a generated image)
      // AND if we haven't already generated an image
      if (!isGenerating && !previewImage.includes('replicate.delivery') && !hasGeneratedImage) {
        try {
          // In a real app, this would call an API to generate the image
          // For now, we'll just update the placeholder
          const params = getPreviewParams({
            gender, age, ethnicity, eyeColor, hairColor, 
            hairStyle, bodyShape, breastSize, buttSize
          });
          
          // Use placehold.co instead of via.placeholder.com which has DNS issues
          setPreviewImage(`https://placehold.co/400x500/333333/FFFFFF?text=Preview`);
        } catch (error) {
          console.error('Error updating preview image:', error);
          // Use a fallback image that will definitely work
          setPreviewImage(`https://placehold.co/400x500/333333/FFFFFF?text=Preview`);
        }
      }
    }
  }, [step, gender, age, ethnicity, eyeColor, hairColor, hairStyle, bodyShape, breastSize, buttSize, isGenerating, previewImage]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push('/signin');
    }
  }, [user, router]);

  // Update options when gender changes
  const [genderSpecificOptions, setGenderSpecificOptions] = useState({
    ageOptions: getAgeOptions(),
    ethnicityOptions: getEthnicityOptions(),
    eyeColorOptions: getEyeColorOptions(),
    hairColorOptions: getHairColorOptions(),
    hairStyleOptions: getHairStyleOptions(),
    bodyShapeOptions: getBodyShapeOptions(),
    buttSizeOptions: getButtSizeOptions()
  });

  // Update all options when gender changes
  useEffect(() => {
    setGenderSpecificOptions({
      ageOptions: getAgeOptions(gender),
      ethnicityOptions: getEthnicityOptions(gender),
      eyeColorOptions: getEyeColorOptions(gender),
      hairColorOptions: getHairColorOptions(gender),
      hairStyleOptions: getHairStyleOptions(gender),
      bodyShapeOptions: getBodyShapeOptions(gender),
      buttSizeOptions: getButtSizeOptions(gender)
    });
  }, [gender]);

  // Add useEffect to track the hasGeneratedImage state
  useEffect(() => {
    // This handles the dependency warning about hasGeneratedImage
  }, [hasGeneratedImage]);

  // Show loading while checking authentication
  if (user === undefined) {
    return <div>Loading...</div>;
  }

  const handleNext = async () => {
    // Validate current step
    if (step === 1 && (!companionType || !gender)) {
      alert('Please select both companion type and gender');
      return;
    }
    if (step === 2 && (!age || !ethnicity)) {
      alert('Please select both age and ethnicity');
      return;
    }
    if (step === 3 && (!eyeColor || !hairColor || !hairStyle)) {
      alert('Please select eye color, hair color, and hair style');
      return;
    }
    if (step === 4) {
      if (!bodyShape) {
        alert('Please select a body shape');
        return;
      }
      if (gender === 'female' && !breastSize) {
        alert('Please select a breast size');
        return;
      }
      if (!buttSize) {
        alert('Please select a butt size');
        return;
      }
      
      // Check if user has generated a body image
      if (!hasGeneratedImage) {
        alert('Please generate a body image before proceeding');
        return;
      }
    }
    if (step === 5 && !name.trim()) {
      alert('Please enter a name');
      return;
    }
    if (step === 6 && personality.length === 0) {
      alert('Please select at least one personality trait');
      return;
    }

    // If on the last step, submit the form and save to Firebase
    if (step === 6) {
      setIsSavingCompanion(true);
      setSavingError(null);
      
      try {
        // Get the current selected images
        const selectedFaceImage = faceImageVariants[selectedFaceVariantIndex] || previewImage;
        const selectedBodyImage = bodyImageVariants[selectedVariantIndex] || previewImage;
        
        // Create companion data
        const companionData = {
          name,
          type: companionType,
          gender,
          age,
          ethnicity,
          eyeColor,
          hairColor,
          hairStyle,
          bodyShape,
          breastSize: gender === 'female' ? breastSize : undefined,
          buttSize,
          personality,
          facePrompt,
          bodyPrompt
        };
        
        // Save to Firebase
        const { companion, error } = await createCompanion(
          user.uid,
          companionData,
          selectedFaceImage,
          selectedBodyImage
        );
        
        if (error) {
          console.error('Error saving companion:', error);
          setSavingError('Failed to save companion. Please try again.');
          setIsSavingCompanion(false);
          return;
        }
        
        console.log('Companion saved successfully:', companion);
        alert('AI Companion created successfully!');
        router.push('/dashboard');
      } catch (error) {
        console.error('Error in companion creation:', error);
        setSavingError('An unexpected error occurred. Please try again.');
        setIsSavingCompanion(false);
      }
      
      return;
    }

    // Otherwise, go to the next step
    setStep(step + 1);
  };

  const togglePersonality = (id: string) => {
    if (personality.includes(id)) {
      setPersonality(personality.filter(p => p !== id));
    } else {
      if (personality.length < 3) {
        setPersonality([...personality, id]);
      } else {
        alert('You can select up to 3 personality traits');
      }
    }
  };

  // Update handleGenerateImage function to call Firebase Functions directly
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
              // Call Firebase Function directly instead of Next.js API
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
              // Parse the response to match the expected format from our Next.js API
              faceData = {
                imageUrl: rawFaceData.result?.imageUrl || (rawFaceData.result?.imageUrls?.[0]) || rawFaceData.imageUrl || (rawFaceData.imageUrls?.[0]) || (Array.isArray(rawFaceData.output) ? rawFaceData.output[0] : null),
                imageUrls: rawFaceData.result?.imageUrls || rawFaceData.imageUrls || (Array.isArray(rawFaceData.output) ? rawFaceData.output : (rawFaceData.result?.imageUrl ? [rawFaceData.result.imageUrl] : (rawFaceData.imageUrl ? [rawFaceData.imageUrl] : []))),
                prompt: generateFacePrompt(requestData)
              };
              
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
              // Call Firebase Function directly instead of Next.js API
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
              // Parse the response to match the expected format from our Next.js API
              bodyData = {
                imageUrl: rawBodyData.result?.imageUrl || (rawBodyData.result?.imageUrls?.[0]) || rawBodyData.imageUrl || (rawBodyData.imageUrls?.[0]) || (Array.isArray(rawBodyData.output) ? rawBodyData.output[0] : null),
                imageUrls: rawBodyData.result?.imageUrls || rawBodyData.imageUrls || (Array.isArray(rawBodyData.output) ? rawBodyData.output : (rawBodyData.result?.imageUrl ? [rawBodyData.result.imageUrl] : (rawBodyData.imageUrl ? [rawBodyData.imageUrl] : []))),
                prompt: generateBodyPrompt(requestData)
              };
              
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
            
            // Deduct coins for successful generation - moved outside function
            const result = await useCoins(coinCost);
            
            setIsGenerating(false);
            return;
          } 
          // Fallback to single image URL if array isn't provided
          else if (bodyData.imageUrl) {
            setBodyImageVariants([bodyData.imageUrl]);
            setSelectedVariantIndex(0);
            setPreviewImage(bodyData.imageUrl);
            
            // Deduct coins for successful generation - moved outside function
            const result = await useCoins(coinCost);
            
            setIsGenerating(false);
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
            // Call Firebase Function directly instead of Next.js API
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
            // Parse the response to match the expected format from our Next.js API
            faceData = {
              imageUrl: rawFaceData.result?.imageUrl || (rawFaceData.result?.imageUrls?.[0]) || rawFaceData.imageUrl || (rawFaceData.imageUrls?.[0]) || (Array.isArray(rawFaceData.output) ? rawFaceData.output[0] : null),
              imageUrls: rawFaceData.result?.imageUrls || rawFaceData.imageUrls || (Array.isArray(rawFaceData.output) ? rawFaceData.output : (rawFaceData.result?.imageUrl ? [rawFaceData.result.imageUrl] : (rawFaceData.imageUrl ? [rawFaceData.imageUrl] : []))),
              prompt: generateFacePrompt(requestData)
            };
            
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
            
            // Deduct coins for successful generation - moved outside function
            const result = await useCoins(FACE_GENERATION_COST);
            
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

  // Function to select a variant for body images
  const selectVariant = (index: number) => {
    if (index >= 0 && index < bodyImageVariants.length) {
      setSelectedVariantIndex(index);
      setPreviewImage(bodyImageVariants[index]);
    }
  };
  
  // Function to select a variant for face images
  const selectFaceVariant = (index: number) => {
    if (index >= 0 && index < faceImageVariants.length) {
      setSelectedFaceVariantIndex(index);
      setPreviewImage(faceImageVariants[index]);
    }
  };

  // Helper function to generate a face prompt
  const generateFacePrompt = (data: any): string => {
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
  const generateBodyPrompt = (data: any): string => {
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

  return (
    <MainLayout>
      <div className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold">{step}. {formSteps[step-1].name}</h1>
              <div className="flex space-x-2">
                {formSteps.map((s, index) => (
                  <div 
                    key={s.name} 
                    className={`h-2 w-8 rounded-full ${
                      step > index + 1 
                        ? 'bg-purple-600' 
                        : step === index + 1 
                          ? 'bg-purple-600' 
                          : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className={`${step >= 2 ? 'lg:w-2/3' : 'w-full'}`}>
              {/* Step 1: Type & Gender */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl mb-6">Who would you like to meet?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 max-w-4xl">
                    {companionTypes.map((type) => (
                      <SelectionCard
                        key={type.id}
                        item={type}
                        selected={companionType === type.id}
                        onSelect={() => setCompanionType(type.id)}
                        disabled={!type.available}
                      />
                    ))}
                  </div>
                  
                  <h2 className="text-xl mb-6 mt-10">Choose a gender</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md">
                    {genderOptions.map((option) => (
                      <SelectionCard
                        key={option.id}
                        item={option}
                        selected={gender === option.id}
                        onSelect={() => setGender(option.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Age & Ethnicity */}
              {step === 2 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Age</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-w-4xl">
                    {genderSpecificOptions.ageOptions.map((option) => (
                      <SelectionCard
                        key={option.id}
                        item={option}
                        selected={age === option.id}
                        onSelect={() => setAge(option.id)}
                      />
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-medium mb-4 mt-8">Ethnicity</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
                    {genderSpecificOptions.ethnicityOptions.map((option) => (
                      <SelectionCard
                        key={option.id}
                        item={option}
                        selected={ethnicity === option.id}
                        onSelect={() => setEthnicity(option.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Face */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl mb-6">Customize the face</h2>
                  
                  <h3 className="text-lg font-medium mb-4">Eye Color</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-w-4xl">
                    {genderSpecificOptions.eyeColorOptions.map((option) => (
                      <SelectionCard
                        key={option.id}
                        item={option}
                        selected={eyeColor === option.id}
                        onSelect={() => setEyeColor(option.id)}
                      />
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-medium mb-4 mt-8">Hair Color</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-w-4xl">
                    {genderSpecificOptions.hairColorOptions.map((option) => (
                      <SelectionCard
                        key={option.id}
                        item={option}
                        selected={hairColor === option.id}
                        onSelect={() => setHairColor(option.id)}
                      />
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-medium mb-4 mt-8">Hair Style</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
                    {genderSpecificOptions.hairStyleOptions.map((option) => (
                      <SelectionCard
                        key={option.id}
                        item={option}
                        selected={hairStyle === option.id}
                        onSelect={() => setHairStyle(option.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Body */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl mb-6">Select body features</h2>
                  
                  <h3 className="text-lg font-medium mb-4">Body Shape</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-w-4xl">
                    {genderSpecificOptions.bodyShapeOptions.map((option) => (
                      <SelectionCard
                        key={option.id}
                        item={option}
                        selected={bodyShape === option.id}
                        onSelect={() => setBodyShape(option.id)}
                      />
                    ))}
                  </div>
                  
                  {gender === 'female' && (
                    <>
                      <h3 className="text-lg font-medium mb-4 mt-8">Breast Size</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-w-4xl">
                        {breastSizeOptions.map((option) => (
                          <SelectionCard
                            key={option.id}
                            item={option}
                            selected={breastSize === option.id}
                            onSelect={() => setBreastSize(option.id)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  <h3 className="text-lg font-medium mb-4 mt-8">Butt Size</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
                    {genderSpecificOptions.buttSizeOptions.map((option) => (
                      <SelectionCard
                        key={option.id}
                        item={option}
                        selected={buttSize === option.id}
                        onSelect={() => setButtSize(option.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Name */}
              {step === 5 && (
                <div className="max-w-md mx-auto">
                  <h2 className="text-xl mb-6">Give your companion a name</h2>
                  <div className="mb-6">
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Companion Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter a name for your companion"
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Personality */}
              {step === 6 && (
                <div>
                  <h2 className="text-xl mb-6">Select up to 3 personality traits</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
                    {personalityOptions.map((option) => (
                      <SelectionCard
                        key={option.id}
                        item={option}
                        selected={personality.includes(option.id)}
                        onSelect={() => togglePersonality(option.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Preview section (visible from step 2 onwards) */}
            {step >= 2 && (
              <div className="lg:w-1/3" ref={previewRef}>
                <div className="bg-gray-900 p-4 rounded-lg sticky top-4">
                  <h3 className="text-lg font-medium mb-4">Preview</h3>
                  
                  {/* Coin information */}
                  <div className="mb-4 text-sm flex justify-between items-center bg-gray-800 p-2 rounded">
                    <span>Your balance: <span className="font-bold text-yellow-500">{coins} coins</span></span>
                    <span>Cost: <span className="font-bold text-yellow-500">{step >= 4 ? `${FACE_GENERATION_COST + BODY_GENERATION_COST}` : `${FACE_GENERATION_COST}`} coins</span></span>
                  </div>
                  
                  <div className="aspect-[3/4] relative mb-4 bg-gray-800 rounded-lg overflow-hidden">
                    {previewImage && previewImage.trim() !== '' ? (
                      <Image
                        src={previewImage}
                        alt="AI Preview"
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          console.error('Image failed to load:', previewImage);
                          // Only set fallback for non-Replicate images
                          if (!previewImage.includes('replicate.delivery')) {
                            setPreviewImage('https://placehold.co/400x500/333333/FFFFFF?text=Preview');
                          }
                        }}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority={previewImage.includes('replicate.delivery')}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        Preview not available
                      </div>
                    )}
                    {isGenerating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                      </div>
                    )}
                  </div>
                  {errorMessage && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-sm text-red-200">
                      {errorMessage}
                    </div>
                  )}
                  
                  {/* Display face image variants if available (and we're not showing body) */}
                  {step < 4 && faceImageVariants.length > 1 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Select Face Variant:</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {faceImageVariants.map((url, index) => (
                          <div 
                            key={index}
                            onClick={() => selectFaceVariant(index)}
                            className={`cursor-pointer aspect-[3/4] relative bg-gray-800 rounded ${
                              selectedFaceVariantIndex === index ? 'ring-2 ring-purple-500' : 'opacity-70'
                            }`}
                          >
                            <Image
                              src={url}
                              alt={`Face Variant ${index + 1}`}
                              fill
                              className="object-cover rounded"
                              unoptimized
                              sizes="(max-width: 768px) 25vw, 10vw"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Display body image variants if available */}
                  {bodyImageVariants.length > 1 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Select Body Variant:</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {bodyImageVariants.map((url, index) => (
                          <div 
                            key={index}
                            onClick={() => selectVariant(index)}
                            className={`cursor-pointer aspect-[3/4] relative bg-gray-800 rounded ${
                              selectedVariantIndex === index ? 'ring-2 ring-purple-500' : 'opacity-70'
                            }`}
                          >
                            <Image
                              src={url}
                              alt={`Body Variant ${index + 1}`}
                              fill
                              className="object-cover rounded"
                              unoptimized
                              sizes="(max-width: 768px) 25vw, 10vw"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleGenerateImage}
                    disabled={isGenerating}
                    className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                  >
                    {isGenerating ? 'Generating...' : 'Generate Image'}
                  </button>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span>{companionTypes.find(t => t.id === companionType)?.name || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gender:</span>
                      <span>{genderOptions.find(g => g.id === gender)?.name || '-'}</span>
                    </div>
                    {step >= 2 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Age:</span>
                          <span>{genderSpecificOptions.ageOptions.find(a => a.id === age)?.name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ethnicity:</span>
                          <span>{genderSpecificOptions.ethnicityOptions.find(e => e.id === ethnicity)?.name || '-'}</span>
                        </div>
                      </>
                    )}
                    {step >= 3 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Eye Color:</span>
                          <span>{genderSpecificOptions.eyeColorOptions.find(e => e.id === eyeColor)?.name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Hair Color:</span>
                          <span>{genderSpecificOptions.hairColorOptions.find(h => h.id === hairColor)?.name || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Hair Style:</span>
                          <span>{genderSpecificOptions.hairStyleOptions.find(h => h.id === hairStyle)?.name || '-'}</span>
                        </div>
                      </>
                    )}
                    {step >= 4 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Body Shape:</span>
                          <span>{genderSpecificOptions.bodyShapeOptions.find(b => b.id === bodyShape)?.name || '-'}</span>
                        </div>
                        {gender === 'female' && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Breast Size:</span>
                            <span>{breastSizeOptions.find(b => b.id === breastSize)?.name || '-'}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-400">Butt Size:</span>
                          <span>{genderSpecificOptions.buttSizeOptions.find(b => b.id === buttSize)?.name || '-'}</span>
                        </div>
                      </>
                    )}
                    {step >= 5 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Name:</span>
                        <span>{name || '-'}</span>
                      </div>
                    )}
                    {step >= 6 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Personality:</span>
                        <span>
                          {personality.length > 0 
                            ? personality.map(p => personalityOptions.find(o => o.id === p)?.name).join(', ') 
                            : '-'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700"
              >
                Back
              </button>
            )}
            <div className={step === 1 ? 'ml-auto' : ''}>
              <button
                type="button"
                onClick={handleNext}
                disabled={isSavingCompanion}
                className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingCompanion ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⟳</span>
                    Saving...
                  </>
                ) : (
                  step < 6 ? 'Next' : 'Create Companion'
                )}
              </button>
            </div>
          </div>
          
          {/* Saving error message */}
          {savingError && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-sm text-red-200">
              {savingError}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 