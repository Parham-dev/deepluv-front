'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import SelectionCard from '@/components/create/SelectionCard';

// Define companion types
const companionTypes = [
  {
    id: 'romantic',
    name: 'Romantic Partner',
    description: 'A loving and caring companion for romantic connection',
    image: 'https://via.placeholder.com/150/FF69B4/FFFFFF?text=Romantic',
    available: true
  },
  {
    id: 'supportive',
    name: 'Supportive Friend',
    description: 'A reliable friend who is always there to support you',
    image: 'https://via.placeholder.com/150/4682B4/FFFFFF?text=Supportive',
    available: true
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'A wise guide to help you grow and learn',
    image: 'https://via.placeholder.com/150/808080/FFFFFF?text=Mentor',
    available: false
  },
  {
    id: 'creative',
    name: 'Creative Partner',
    description: 'A creative companion to inspire your artistic endeavors',
    image: 'https://via.placeholder.com/150/808080/FFFFFF?text=Creative',
    available: false
  },
  {
    id: 'motivational',
    name: 'Motivational Coach',
    description: 'A coach to keep you motivated and on track with your goals',
    image: 'https://via.placeholder.com/150/808080/FFFFFF?text=Coach',
    available: false
  }
];

// Define gender options
const genderOptions = [
  { 
    id: 'male', 
    name: 'Male', 
    image: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Male' 
  },
  { 
    id: 'female', 
    name: 'Female', 
    image: 'https://via.placeholder.com/150/FF1493/FFFFFF?text=Female' 
  },
  { 
    id: 'non-binary', 
    name: 'Non-Binary', 
    image: 'https://via.placeholder.com/150/9370DB/FFFFFF?text=Non-Binary' 
  }
];

export default function Create() {
  const { user } = useAuthContext() as { user: any };
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [companionType, setCompanionType] = useState('');
  const [gender, setGender] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push('/signin');
    }
  }, [user, router]);

  // Show loading while checking authentication
  if (user === undefined) {
    return <div>Loading...</div>;
  }

  const handleNext = () => {
    if (step === 1 && !companionType) {
      alert('Please select a companion type');
      return;
    }
    if (step === 2 && !gender) {
      alert('Please select a gender');
      return;
    }
    setStep(step + 1);
  };

  return (
    <MainLayout>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Your AI Companion</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Follow the steps to create your personalized AI companion.
          </p>
        </div>
        
        <div className="border-t border-gray-200">
          {/* Progress steps */}
          <div className="px-4 py-5 sm:px-6">
            <nav className="flex justify-center">
              <ol className="flex items-center space-x-4 sm:space-x-8">
                {['Who', 'Gender', 'Personality', 'Appearance', 'Finalize'].map((stepName, index) => (
                  <li key={stepName} className="flex items-center">
                    <div 
                      className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                        step > index + 1 
                          ? 'bg-indigo-600' 
                          : step === index + 1 
                            ? 'bg-indigo-600 ring-4 ring-indigo-100' 
                            : 'bg-gray-200'
                      }`}
                    >
                      {step > index + 1 ? (
                        <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span className={`text-sm font-medium ${step === index + 1 ? 'text-white' : 'text-gray-500'}`}>
                          {index + 1}
                        </span>
                      )}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-500">{stepName}</span>
                    {index < 4 && (
                      <svg className="ml-4 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <div className="px-4 py-5 sm:p-6">
            {/* Step 1: Who */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Who will your companion be?</h2>
                <p className="mb-6 text-gray-600">Choose the type of companion you want to create.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
              </div>
            )}

            {/* Step 2: Gender */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose a gender for your companion</h2>
                <p className="mb-6 text-gray-600">Select the gender identity for your AI companion.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
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

            {/* Navigation buttons */}
            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="btn btn-secondary"
                >
                  Back
                </button>
              )}
              <div className={step === 1 ? 'ml-auto' : ''}>
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary"
                >
                  {step < 5 ? 'Next' : 'Create Companion'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 