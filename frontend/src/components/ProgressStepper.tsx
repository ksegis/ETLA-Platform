'use client';

import { Check } from 'lucide-react';

export interface Step {
  id: number;
  title: string;
  shortTitle?: string; // For mobile display
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
}

export default function ProgressStepper({ steps, currentStep }: ProgressStepperProps) {
  return (
    <div className="w-full py-4 sm:py-6">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            const isUpcoming = currentStep < step.id;

            return (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                      transition-all duration-200
                      ${isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  
                  {/* Step Title */}
                  <p
                    className={`
                      mt-2 text-sm font-medium text-center
                      ${isCurrent ? 'text-blue-600' : 'text-gray-600'}
                    `}
                  >
                    {step.title}
                  </p>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-4 relative top-[-20px]">
                    <div
                      className={`
                        h-full transition-all duration-300
                        ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                      `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="flex items-center justify-between px-2">
          {steps.map((step, index) => {
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs
                      transition-all duration-200
                      ${isCompleted 
                        ? 'bg-green-500 text-white' 
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-2 ring-blue-100'
                        : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.id
                    )}
                  </div>
                  
                  {/* Step Title - Only show for current step on mobile */}
                  {isCurrent && (
                    <p className="mt-1 text-xs font-medium text-blue-600 text-center max-w-[60px]">
                      {step.shortTitle || step.title}
                    </p>
                  )}
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="w-8 sm:w-12 h-0.5 mx-1">
                    <div
                      className={`
                        h-full transition-all duration-300
                        ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                      `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Current Step Title (below circles on mobile) */}
        <div className="mt-3 text-center">
          <p className="text-sm font-medium text-gray-900">
            Step {currentStep}: {steps.find(s => s.id === currentStep)?.title}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 sm:mt-6">
        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
