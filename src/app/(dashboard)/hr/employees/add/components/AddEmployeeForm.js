// src\app\(dashboard)\hr\employees\add\components\AddEmployeeForm.js
"use client";
import { useState } from 'react';
import PersonalInfoForm from './PersonalInfoForm';

const AddEmployeeForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    maritalStatus: '',
    personalEmail: '',
    phone: '',
    image: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Here you would handle form submission to your backend
    alert('Employee added successfully!');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoForm
            data={formData}
            onChange={handleInputChange}
            onNext={nextStep}
          />
        );
      case 2:
        return <div>Contact Information Form (to be implemented)</div>;
      case 3:
        return <div>Employment Details Form (to be implemented)</div>;
      case 4:
        return <div>Review Form (to be implemented)</div>;
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}
                >
                  {step}
                </div>
                <span className="text-sm mt-2 text-gray-600 dark:text-gray-400">
                  {step === 1 && 'Personal'}
                  {step === 2 && 'Contact'}
                  {step === 3 && 'Employment'}
                  {step === 4 && 'Review'}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        {renderStep()}
      </div>
    </div>
  );
};

export default AddEmployeeForm;