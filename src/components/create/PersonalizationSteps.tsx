'use client';
import React from 'react';
import SelectionCard from './SelectionCard';

// Type definitions
export interface Option {
  id: string;
  name: string;
  description?: string;
  available?: boolean;
  image?: string;
  icon?: string;
}

export interface GenderSpecificOptions {
  ageOptions: Option[];
  ethnicityOptions: Option[];
  eyeColorOptions: Option[];
  hairColorOptions: Option[];
  hairStyleOptions: Option[];
  bodyShapeOptions: Option[];
  buttSizeOptions: Option[];
}

interface PersonalizationStepsProps {
  step: number;
  companionType: string;
  setCompanionType: (value: string) => void;
  gender: string;
  setGender: (value: string) => void;
  age: string;
  setAge: (value: string) => void;
  ethnicity: string;
  setEthnicity: (value: string) => void;
  eyeColor: string;
  setEyeColor: (value: string) => void;
  hairColor: string;
  setHairColor: (value: string) => void;
  hairStyle: string;
  setHairStyle: (value: string) => void;
  bodyShape: string;
  setBodyShape: (value: string) => void;
  breastSize: string;
  setBreastSize: (value: string) => void;
  buttSize: string;
  setButtSize: (value: string) => void;
  name: string;
  setName: (value: string) => void;
  personality: string[];
  togglePersonality: (id: string) => void;
  companionTypes: Option[];
  genderOptions: Option[];
  genderSpecificOptions: GenderSpecificOptions;
  breastSizeOptions: Option[];
  personalityOptions: Option[];
}

export default function PersonalizationSteps({
  step,
  companionType,
  setCompanionType,
  gender,
  setGender,
  age,
  setAge,
  ethnicity,
  setEthnicity,
  eyeColor,
  setEyeColor,
  hairColor,
  setHairColor,
  hairStyle,
  setHairStyle,
  bodyShape,
  setBodyShape,
  breastSize,
  setBreastSize,
  buttSize,
  setButtSize,
  name,
  setName,
  personality,
  togglePersonality,
  companionTypes,
  genderOptions,
  genderSpecificOptions,
  breastSizeOptions,
  personalityOptions
}: PersonalizationStepsProps) {
  
  // Render the appropriate step content
  switch (step) {
    case 1:
      return (
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
      );
    
    case 2:
      return (
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
      );
    
    case 3:
      return (
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
      );
    
    case 4:
      return (
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
      );
    
    case 5:
      return (
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
      );
    
    case 6:
      return (
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
      );
    
    default:
      return null;
  }
} 