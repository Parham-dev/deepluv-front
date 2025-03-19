'use client';
import React from 'react';
import Image from 'next/image';

// Define the types for options
interface Option {
  id: string;
  name: string;
  [key: string]: any;
}

interface GenderSpecificOptions {
  ageOptions: Option[];
  ethnicityOptions: Option[];
  eyeColorOptions: Option[];
  hairColorOptions: Option[];
  hairStyleOptions: Option[];
  bodyShapeOptions: Option[];
  buttSizeOptions: Option[];
}

interface PreviewPanelProps {
  previewImage: string;
  isGenerating: boolean;
  errorMessage: string | null;
  handleGenerateImage: () => void;
  coins: number;
  step: number;
  FACE_GENERATION_COST: number;
  BODY_GENERATION_COST: number;
  faceImageVariants: string[];
  selectedFaceVariantIndex: number;
  selectFaceVariant: (index: number) => void;
  bodyImageVariants: string[];
  selectedVariantIndex: number;
  selectVariant: (index: number) => void;
  companionType: string;
  gender: string;
  age: string;
  ethnicity: string;
  eyeColor: string;
  hairColor: string;
  hairStyle: string;
  bodyShape: string;
  breastSize: string;
  buttSize: string;
  name: string;
  personality: string[];
  companionTypes: Option[];
  genderOptions: Option[];
  genderSpecificOptions: GenderSpecificOptions;
  breastSizeOptions: Option[];
  personalityOptions: Option[];
}

export default function PreviewPanel({
  previewImage,
  isGenerating,
  errorMessage,
  handleGenerateImage,
  coins,
  step,
  FACE_GENERATION_COST,
  BODY_GENERATION_COST,
  faceImageVariants,
  selectedFaceVariantIndex,
  selectFaceVariant,
  bodyImageVariants,
  selectedVariantIndex,
  selectVariant,
  companionType,
  gender,
  age,
  ethnicity,
  eyeColor,
  hairColor,
  hairStyle,
  bodyShape,
  breastSize,
  buttSize,
  name,
  personality,
  companionTypes,
  genderOptions,
  genderSpecificOptions,
  breastSizeOptions,
  personalityOptions
}: PreviewPanelProps) {
  return (
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
                // Fall back to placeholder if image fails to load
                // This is handled in the parent component
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
          <span>{companionTypes.find((t: Option) => t.id === companionType)?.name || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Gender:</span>
          <span>{genderOptions.find((g: Option) => g.id === gender)?.name || '-'}</span>
        </div>
        {step >= 2 && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-400">Age:</span>
              <span>{genderSpecificOptions.ageOptions.find((a: Option) => a.id === age)?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Ethnicity:</span>
              <span>{genderSpecificOptions.ethnicityOptions.find((e: Option) => e.id === ethnicity)?.name || '-'}</span>
            </div>
          </>
        )}
        {step >= 3 && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-400">Eye Color:</span>
              <span>{genderSpecificOptions.eyeColorOptions.find((e: Option) => e.id === eyeColor)?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Hair Color:</span>
              <span>{genderSpecificOptions.hairColorOptions.find((h: Option) => h.id === hairColor)?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Hair Style:</span>
              <span>{genderSpecificOptions.hairStyleOptions.find((h: Option) => h.id === hairStyle)?.name || '-'}</span>
            </div>
          </>
        )}
        {step >= 4 && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-400">Body Shape:</span>
              <span>{genderSpecificOptions.bodyShapeOptions.find((b: Option) => b.id === bodyShape)?.name || '-'}</span>
            </div>
            {gender === 'female' && (
              <div className="flex justify-between">
                <span className="text-gray-400">Breast Size:</span>
                <span>{breastSizeOptions.find((b: Option) => b.id === breastSize)?.name || '-'}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Butt Size:</span>
              <span>{genderSpecificOptions.buttSizeOptions.find((b: Option) => b.id === buttSize)?.name || '-'}</span>
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
                ? personality.map(p => personalityOptions.find((o: Option) => o.id === p)?.name).join(', ') 
                : '-'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 