// src\app\(dashboard)\hr\employees\add\components\FormNavigation.js
"use client";
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';

export default function FormNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
  canProceed = true,
  submitButtonText = "Create Employee" // Default value
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full sm:w-auto">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={onPrevious}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors border border-gray-300 dark:border-gray-600 rounded-lg sm:border-0"
            disabled={isSubmitting}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
        )}
      </div>

      <div className="flex flex-col xs:flex-row items-center gap-3 w-full sm:w-auto">
        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${canProceed && !isSubmitting
                ? 'bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 hover:shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canProceed || isSubmitting}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-sm ${canProceed && !isSubmitting
                ? 'bg-brand-500 text-white hover:bg-brand-600 dark:bg-brand-500 dark:hover:bg-brand-600 hover:shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {submitButtonText}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}