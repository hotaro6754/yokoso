'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, Info } from 'lucide-react';

const TaxRegimeSelectionPopup = ({ isOpen, onClose, onSelect, employeeName }) => {
  const [selectedRegime, setSelectedRegime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const taxRegimes = [
    {
      id: 'NEW',
      name: 'New Tax Regime',
      description: 'Lower tax rates with fewer deductions. Suitable for individuals with minimal investments and deductions.',
      benefits: [
        'Lower tax slabs',
        'No need to maintain investment records',
        'Simplified tax calculation',
        'Standard deduction of ₹75,000'
      ],
      drawbacks: [
        'Limited deductions available',
        'Cannot claim HRA exemption',
        'No tax benefits on home loan interest'
      ]
    },
    {
      id: 'OLD',
      name: 'Old Tax Regime',
      description: 'Higher tax rates but allows various deductions and exemptions. Suitable for individuals with significant investments and deductions.',
      benefits: [
        'Various deductions under Section 80C',
        'HRA exemption available',
        'Home loan interest deduction',
        'Medical insurance deduction'
      ],
      drawbacks: [
        'Higher tax rates',
        'Complex tax calculation',
        'Requires investment proof documentation'
      ]
    }
  ];

  const handleSubmit = async () => {
    if (!selectedRegime) {
      alert('Please select a tax regime');
      return;
    }

    setIsLoading(true);
    try {
      await onSelect(selectedRegime);
      onClose();
    } catch (error) {
      console.error('Error selecting tax regime:', error);
      alert('Failed to update tax regime. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Select Your Tax Regime</h2>
            <p className="text-sm text-gray-600 mt-1">
              Welcome {employeeName}! Please choose your preferred tax regime for payroll calculations.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Info Alert */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Important Information</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your choice of tax regime will affect your tax calculations and take-home salary. 
                You can change this later through your profile settings. Please consult with a tax advisor 
                if you're unsure which regime is better for you.
              </p>
            </div>
          </div>

          {/* Tax Regime Options */}
          <div className="space-y-4">
            {taxRegimes.map((regime) => (
              <div
                key={regime.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedRegime === regime.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedRegime(regime.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedRegime === regime.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedRegime === regime.id && (
                        <CheckCircle className="h-3 w-3 text-white" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{regime.name}</h3>
                    <p className="text-gray-600 mt-1">{regime.description}</p>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Benefits */}
                      <div>
                        <h4 className="text-sm font-medium text-green-700 mb-2">Benefits:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {regime.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-green-500 mt-0.5">•</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Drawbacks */}
                      <div>
                        <h4 className="text-sm font-medium text-red-700 mb-2">Limitations:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {regime.drawbacks.map((drawback, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>{drawback}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={isLoading}
            >
              I'll Decide Later
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedRegime || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Confirm Selection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxRegimeSelectionPopup;
