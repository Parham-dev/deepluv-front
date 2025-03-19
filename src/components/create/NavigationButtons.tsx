'use client';
import React from 'react';

interface NavigationButtonsProps {
  step: number;
  onBack: () => void;
  onNext: () => void;
  isSaving: boolean;
  savingError: string | null;
  isLastStep: boolean;
}

export default function NavigationButtons({
  step,
  onBack,
  onNext,
  isSaving,
  savingError,
  isLastStep
}: NavigationButtonsProps) {
  return (
    <>
      <div className="mt-8 flex justify-between">
        {step > 1 && (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700"
          >
            Back
          </button>
        )}
        <div className={step === 1 ? 'ml-auto' : ''}>
          <button
            type="button"
            onClick={onNext}
            disabled={isSaving}
            className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                Saving...
              </>
            ) : (
              !isLastStep ? 'Next' : 'Create Companion'
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
    </>
  );
} 