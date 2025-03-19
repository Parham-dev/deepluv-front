'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { useUserCoins } from '@/hooks/useUserCoins';
import MainLayout from '@/components/layout/MainLayout';
import FormStepper from '@/components/create/FormStepper';
import PersonalizationSteps from '@/components/create/PersonalizationSteps';
import NavigationButtons from '@/components/create/NavigationButtons';
import PreviewPanel from '@/components/create/PreviewPanel';
import useImageGenerator, { FACE_GENERATION_COST, BODY_GENERATION_COST } from '@/components/create/ImageGenerator';
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
  
  // Preview image state
  const [previewImage, setPreviewImage] = useState('https://placehold.co/400x500/333333/FFFFFF?text=Preview');
  const previewRef = useRef<HTMLDivElement>(null);

  // Image variants state 
  const [bodyImageVariants, setBodyImageVariants] = useState<string[]>([]);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  const [faceImageVariants, setFaceImageVariants] = useState<string[]>([]);
  const [selectedFaceVariantIndex, setSelectedFaceVariantIndex] = useState<number>(0);
  
  // Prompt storage
  const [facePrompt, setFacePrompt] = useState('');
  const [bodyPrompt, setBodyPrompt] = useState('');
  
  // Saving state
  const [isSavingCompanion, setIsSavingCompanion] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);

  // Use the image generator hook
  const {
    isGenerating,
    errorMessage,
    hasGeneratedImage,
    handleGenerateImage,
    setErrorMessage,
    setHasGeneratedImage
  } = useImageGenerator({
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
  });

  // Debug effect to log when preview image changes
  useEffect(() => {
    console.log('Preview image updated:', previewImage);
    if (previewImage.includes('replicate.delivery')) {
      setHasGeneratedImage(true);
    }
  }, [previewImage, setHasGeneratedImage]);

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
  }, [step, gender, age, ethnicity, eyeColor, hairColor, hairStyle, bodyShape, breastSize, buttSize, isGenerating, previewImage, hasGeneratedImage]);

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

  return (
    <MainLayout>
      <div className="bg-black text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress steps */}
          <FormStepper currentStep={step} steps={formSteps} />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className={`${step >= 2 ? 'lg:w-2/3' : 'w-full'}`}>
              <PersonalizationSteps
                step={step}
                companionType={companionType}
                setCompanionType={setCompanionType}
                gender={gender}
                setGender={setGender}
                age={age}
                setAge={setAge}
                ethnicity={ethnicity}
                setEthnicity={setEthnicity}
                eyeColor={eyeColor}
                setEyeColor={setEyeColor}
                hairColor={hairColor}
                setHairColor={setHairColor}
                hairStyle={hairStyle}
                setHairStyle={setHairStyle}
                bodyShape={bodyShape}
                setBodyShape={setBodyShape}
                breastSize={breastSize}
                setBreastSize={setBreastSize}
                buttSize={buttSize}
                setButtSize={setButtSize}
                name={name}
                setName={setName}
                personality={personality}
                togglePersonality={togglePersonality}
                companionTypes={companionTypes}
                genderOptions={genderOptions}
                genderSpecificOptions={genderSpecificOptions}
                breastSizeOptions={breastSizeOptions}
                personalityOptions={personalityOptions}
              />
            </div>

            {/* Preview section (visible from step 2 onwards) */}
            {step >= 2 && (
              <div className="lg:w-1/3" ref={previewRef}>
                <PreviewPanel
                  previewImage={previewImage}
                  isGenerating={isGenerating}
                  errorMessage={errorMessage}
                  handleGenerateImage={handleGenerateImage}
                  coins={coins}
                  step={step}
                  FACE_GENERATION_COST={FACE_GENERATION_COST}
                  BODY_GENERATION_COST={BODY_GENERATION_COST}
                  faceImageVariants={faceImageVariants}
                  selectedFaceVariantIndex={selectedFaceVariantIndex}
                  selectFaceVariant={selectFaceVariant}
                  bodyImageVariants={bodyImageVariants}
                  selectedVariantIndex={selectedVariantIndex}
                  selectVariant={selectVariant}
                  companionType={companionType}
                  gender={gender}
                  age={age}
                  ethnicity={ethnicity}
                  eyeColor={eyeColor}
                  hairColor={hairColor}
                  hairStyle={hairStyle}
                  bodyShape={bodyShape}
                  breastSize={breastSize}
                  buttSize={buttSize}
                  name={name}
                  personality={personality}
                  companionTypes={companionTypes}
                  genderOptions={genderOptions}
                  genderSpecificOptions={genderSpecificOptions}
                  breastSizeOptions={breastSizeOptions}
                  personalityOptions={personalityOptions}
                />
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <NavigationButtons
            step={step}
            onBack={() => setStep(step - 1)}
            onNext={handleNext}
            isSaving={isSavingCompanion}
            savingError={savingError}
            isLastStep={step === 6}
          />
        </div>
      </div>
    </MainLayout>
  );
} 