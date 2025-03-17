'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import SelectionCard from '@/components/create/SelectionCard';
import Image from 'next/image';
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
  const [previewImage, setPreviewImage] = useState('https://via.placeholder.com/400/333333/FFFFFF?text=AI+Preview');

  // Update preview image when relevant selections change
  useEffect(() => {
    if (step >= 2) {
      // In a real app, this would call an API to generate the image
      // For now, we'll just update the placeholder
      const params = getPreviewParams({
        gender, age, ethnicity, eyeColor, hairColor, 
        hairStyle, bodyShape, breastSize, buttSize
      });
      
      setPreviewImage(`https://via.placeholder.com/400/333333/FFFFFF?text=AI+Preview+${params.join('+')}`);
    }
  }, [step, gender, age, ethnicity, eyeColor, hairColor, hairStyle, bodyShape, breastSize, buttSize]);

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

  const handleNext = () => {
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
    }
    if (step === 5 && !name.trim()) {
      alert('Please enter a name');
      return;
    }
    if (step === 6 && personality.length === 0) {
      alert('Please select at least one personality trait');
      return;
    }

    // If on the last step, submit the form
    if (step === 6) {
      // In a real app, this would submit the data to an API
      alert('AI Companion created successfully!');
      router.push('/dashboard');
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
              <div className="lg:w-1/3">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Preview</h3>
                  <div className="aspect-[3/4] relative mb-4 bg-gray-800 rounded-lg overflow-hidden">
                    <Image
                      src={previewImage}
                      alt="AI Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
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
                className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                {step < 6 ? 'Next' : 'Create Companion'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 