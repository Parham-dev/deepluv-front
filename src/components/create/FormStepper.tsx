'use client';
import React from 'react';

interface FormStep {
  name: string;
}

interface FormStepperProps {
  currentStep: number;
  steps: FormStep[];
}

export default function FormStepper({ currentStep, steps }: FormStepperProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{currentStep}. {steps[currentStep-1].name}</h1>
        <div className="flex space-x-2">
          {steps.map((step, index) => (
            <div 
              key={step.name} 
              className={`h-2 w-8 rounded-full ${
                currentStep > index + 1 
                  ? 'bg-purple-600' 
                  : currentStep === index + 1 
                    ? 'bg-purple-600' 
                    : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 