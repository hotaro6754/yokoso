// src/app/(dashboard)/hr/employees/add/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import PersonalInfoForm from './components/PersonalInfoForm';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProgressIndicator from './components/ProgressIndicator';
import ContactInfoForm from './components/ContactInfoForm';
import ProfessionalInfoForm from './components/ProfessionalInfoForm';
import BankingInfoForm from './components/BankingInfoForm';
import DocumentsForm from './components/DocumentsForm';
import FormNavigation from './components/FormNavigation';
import FormRecoveryModal from '@/components/form/FormRecoveryModal';
import { toast } from 'sonner';
import employeeService from '@/services/hr-services/employeeService';
import { hrOfferService } from '@/services/hr-services/offer-management.service';
import { departmentService } from '@/services/hr-services/departmentService';
import { designationService } from '@/services/hr-services/designationService';
import { companyOrganizationService } from '@/services/super-admin-services/companyOrganization.service';
import { authService } from '@/services/auth-services/authService';
import { validateEmployeeForm } from '@/utils/validation';

const STEPS = [
  { id: 1, title: 'Personal Information', component: 'personal' },
  { id: 2, title: 'Contact Information', component: 'contact' },
  { id: 3, title: 'Professional Information', component: 'professional' },
  { id: 4, title: 'Banking Information', component: 'banking' },
  // { id: 5, title: 'Documents', component: 'documents' }
];

const STORAGE_KEY = 'hrms_employee_form_data';

const defaultFormData = {
  // Personal Information
  profileImage: null,
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  bloodGroup: '',
  nationality: 'Indian',
  personalEmail: '',
  birthPlace: '',
  height: '',
  weight: '',
  dateOfBirthUnofficial: '',

  // Contact Information
  email: '',
  phone: '',
  permanentAddress: '',
  currentAddress: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  emergencyContactName: '',
  emergencyContactRelation: '',
  emergencyContactPhone: '',

  // Professional Information
  employeeId: '',
  departmentId: '',
  designationId: '',
  reportingManagerId: '',
  joiningDate: new Date().toISOString().split('T')[0],
  confirmationDate: '',
  employmentType: 'FULL_TIME',
  workLocation: '',
  salaryTemplateId: '',
  ctc: '',
  probationPeriod: '',
  noticePeriod: '',
  workShift: '',
  weeklyHours: 40,
  overtimeEligible: false,

  // Banking Information
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  accountHolderName: '',
  accountType: 'SAVINGS',

  // Documents & Tax Information
  panNumber: '',
  aadhaarNumber: '',
  uanNumber: '',
  passportNumber: '',
  taxRegime: 'NEW',

  // Status
  status: 'ACTIVE',
  onboardingStatus: 'PENDING',
  createUser: true,
  systemRole: 'EMPLOYEE',
  biometricId: '',

  // Profile Details
  familyDetails: [],
  totalExperience: '',
  relevantExperience: '',
  educationDetails: [],
  employmentDetails: [],

  // Salary Information
  ctc: '',
  variablePay: '',

  // One-time Bonus Fields
  joiningBonusAmount: '',
  joiningBonusDate: '',
  referralBonusAmount: '',
  referralBonusDate: '',
  performanceBonusAmount: '',
  performanceBonusDate: '',

  // Salary Breakout Fields (calculated locally)
  basicSalary: 0,
  hra: 0,
  pf: 0,
  specialAllowance: 0,
  otherAllowances: [],
  deductions: []
};

export default function AddEmployeePage() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const basePath = pathname.startsWith('/it-admin') ? '/it-admin' : '/hr';
  const homeLabel = basePath === '/it-admin' ? 'IT Admin' : 'HR';
  const homeHref = basePath === '/it-admin' ? '/it-admin/dashboard' : '/hr';
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [dropdownData, setDropdownData] = useState({
    departments: [],
    designations: [],
    reportingManagers: [],
    locations: []
  });
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateId = searchParams.get('candidateId');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});

  // NEW: Pre-fill from candidate if candidateId is present
  useEffect(() => {
    if (candidateId && !isDataLoaded) {
      const fetchCandidate = async () => {
        try {
          const response = await hrOfferService.getCandidateById(candidateId);
          if (response.success) {
            const candidate = response.data;
            let prefilledData = { ...defaultFormData };
            
            // Basic candidate info
            const nameParts = (candidate.name || "").split(" ");
            prefilledData.firstName = nameParts[0] || "";
            prefilledData.lastName = nameParts.slice(1).join(" ") || "";
            prefilledData.email = candidate.email || "";
            prefilledData.phone = candidate.phone || "";
            prefilledData.personalEmail = candidate.personalEmail || "";
            
            // Extract onboarding data if available
            if (candidate.onboardingData) {
              const obData = typeof candidate.onboardingData === 'string' 
                ? JSON.parse(candidate.onboardingData) 
                : candidate.onboardingData;
              
              prefilledData = {
                ...prefilledData,
                ...obData,
                // Ensure name isn't overwritten by obData if we want to trust candidate name path
                firstName: nameParts[0] || prefilledData.firstName,
                lastName: nameParts.slice(1).join(" ") || prefilledData.lastName,
              };
            }

            // Sync Aadhaar/PAN numbers if they exist in Candidate fields directly
            if (candidate.panNumber) prefilledData.panNumber = candidate.panNumber;
            if (candidate.aadhaarNumber) prefilledData.aadhaarNumber = candidate.aadhaarNumber;

            setFormData(prefilledData);
            toast.success("Candidate details pre-filled!");
          }
        } catch (error) {
          console.error("Error pre-filling candidate data:", error);
        }
      };
      fetchCandidate();
    }
  }, [candidateId, isDataLoaded]);

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        // Fetch current user details first to get companyId
        let cid = companyId;
        if (!cid) {
          try {
            const userResponse = await authService.getCurrentUser();
            const user = userResponse?.user || userResponse?.data?.user;
            cid = user?.company?.id || localStorage.getItem('company_id');
            if (cid) setCompanyId(cid);
          } catch (e) {
            console.error("Failed to fetch user/company info", e);
            cid = localStorage.getItem('company_id');
          }
        }

        const [departmentsResponse, designationsResponse, managersResponse, locationsResponse] = await Promise.all([
          departmentService.getAllDepartments({ page: 1, limit: 100 }),
          designationService.getAllDesignations({ page: 1, limit: 100 }),
          employeeService.getManagers(),
          cid ? companyOrganizationService.getLocations(cid) : { data: [] }
        ]);

        // Handle API response structure: { success: true, data: [...], pagination: {...} }
        const departments = departmentsResponse.success
          ? (departmentsResponse.data?.departments || departmentsResponse.data || [])
          : (departmentsResponse.data?.departments || departmentsResponse.data || []);

        const designations = designationsResponse.success
          ? (designationsResponse.data?.designations || designationsResponse.data || [])
          : (designationsResponse.data?.designations || designationsResponse.data || []);

        const managers = managersResponse.success
          ? (managersResponse.data || [])
          : (managersResponse.data || []);

        const locations = locationsResponse.data || locationsResponse.locations || locationsResponse || [];

        setDropdownData({
          departments: Array.isArray(departments) ? departments : [],
          designations: Array.isArray(designations) ? designations : [],
          reportingManagers: Array.isArray(managers) ? managers : [],
          locations: Array.isArray(locations) ? locations : []
        });
      } catch (error) {
        toast.error('Failed to load dropdown data');
        console.error('Error loading dropdown data:', error);
        // Set empty arrays on error
        setDropdownData({
          departments: [],
          designations: [],
          reportingManagers: [],
          locations: []
        });
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadDropdownData();
  }, []);

  // Load saved data on component mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsedData = JSON.parse(saved);
          const dataAge = parsedData.timestamp
            ? Date.now() - new Date(parsedData.timestamp).getTime()
            : Infinity;

          const isDataRecent = dataAge < 24 * 60 * 60 * 1000;

          if (isDataRecent) {
            setRecoveryData(parsedData);
            setShowRecoveryModal(true);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading saved form data:', error);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsDataLoaded(true);
      }
    };

    loadSavedData();
  }, []);

  // Auto-save with debouncing
  useEffect(() => {
    if (!isDataLoaded) return;

    const saveData = () => {
      try {
        const dataToSave = {
          formData,
          currentStep,
          timestamp: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        setLastSaved(new Date());
        setIsSaved(true);

        setTimeout(() => setIsSaved(false), 2000);
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    };

    const timeoutId = setTimeout(saveData, 1500);
    return () => clearTimeout(timeoutId);
  }, [formData, currentStep, isDataLoaded]);

  // Clear form data from storage
  const clearFormData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData(defaultFormData);
    setCurrentStep(1);
    setErrors({});
    setRecoveryData(null);
    toast.success('Form cleared successfully');
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    const stepErrors = validateEmployeeForm(formData, currentStep);

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      const errorMessages = Object.values(stepErrors);
      if (errorMessages.length <= 3) {
        toast.error(errorMessages.join(', '));
      } else {
        toast.error(`Please fix ${errorMessages.length} errors before proceeding`);
      }

      // Scroll to the first error field
      setTimeout(() => {
        const firstErrorKey = Object.keys(stepErrors)[0];
        const errorElement = document.getElementById(firstErrorKey) || document.querySelector(`[name="${firstErrorKey}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, formData]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSubmit = async () => {
    // Final validation before submission
    let allErrors = {};
    let firstErrorStep = null;

    // Validate across all steps to ensure nothing was missed
    for (let i = 1; i <= STEPS.length; i++) {
      const stepErrors = validateEmployeeForm(formData, i);
      if (Object.keys(stepErrors).length > 0) {
        allErrors = { ...allErrors, ...stepErrors };
        if (!firstErrorStep) firstErrorStep = i;
      }
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      if (firstErrorStep) setCurrentStep(firstErrorStep);
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate all steps before submit
      const allStepErrors = {
        ...validateEmployeeForm(formData, 1),
        ...validateEmployeeForm(formData, 2),
        ...validateEmployeeForm(formData, 3),
        ...validateEmployeeForm(formData, 4),
      };

      if (Object.keys(allStepErrors).length > 0) {
        setErrors(allStepErrors);
        toast.error('Please fix the highlighted errors before submitting');
        setIsSubmitting(false);
        return;
      }

      const formDataToSend = new FormData();

      // Append all fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'profileImage') {
          if (formData[key] instanceof File) {
            formDataToSend.append('profileImage', formData[key]);
          }
        } else if (formData[key] !== null && formData[key] !== undefined) {
          let value = formData[key];

          if (['dateOfBirth', 'dateOfBirthUnofficial', 'joiningDate', 'confirmationDate'].includes(key) && value) {
            // Ensure dates are in YYYY-MM-DD format
            if (value instanceof Date) {
              value = value.toISOString().split('T')[0];
            } else if (typeof value === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(value)) {
              // Convert DD-MM-YYYY to YYYY-MM-DD
              const [day, month, year] = value.split('-');
              value = `${year}-${month}-${day}`;
            }
          }

          // Ensure boolean values are strings "true" or "false"
          if (typeof value === 'boolean') {
            value = value.toString();
          }

          // Only skip empty strings for truly optional fields
          const optionalFields = [
            'birthPlace', 'height', 'weight', 'personalEmail',
            'bloodGroup', 'reportingManagerId', 'confirmationDate',
            'probationPeriod', 'workShift', 'ctc'
          ];

          if (value === '' && optionalFields.includes(key)) {
            // Skip empty optional fields
            return;
          }

          // Handle JSON fields
          if (['familyDetails', 'educationDetails', 'employmentDetails'].includes(key)) {
            value = JSON.stringify(value || []);
          }

          formDataToSend.append(key, value);
        }
      });

      // Add default onboardingStatus if missing
      if (!formData.onboardingStatus) {
        formDataToSend.append('onboardingStatus', 'PENDING');
      }

      const response = await employeeService.createEmployee(formDataToSend);

      if (response.success) {
        // Clear form data from storage
        localStorage.removeItem(STORAGE_KEY);

        toast.success('User created successfully! Credentials sent via email.');

        // Redirect to documents page after a brief delay
        setTimeout(() => {
          router.push(`${basePath}/employees`);
        }, 1500);
      } else {
        throw new Error(response.message || 'Failed to create user');
      }

    } catch (error) {
      console.error('Error creating employee:', error);
      const errorMessage = error.message || 'Failed to create user';
      
      // Handle backend validation errors
      if (error.errors && Array.isArray(error.errors)) {
        const backendErrors = {};
        let firstErrorStep = 4; // Default to current step (Banking)
        
        error.errors.forEach(err => {
          if (err.path) {
            backendErrors[err.path] = err.msg;
            
            // Map field to its step to jump back if needed
            const field = err.path;
            if (['firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus'].includes(field)) {
              firstErrorStep = Math.min(firstErrorStep, 1);
            } else if (['email', 'phone', 'permanentAddress', 'currentAddress'].includes(field)) {
              firstErrorStep = Math.min(firstErrorStep, 2);
            } else if (['departmentId', 'designationId', 'joiningDate', 'probationPeriod', 'employmentType'].includes(field)) {
              firstErrorStep = Math.min(firstErrorStep, 3);
            }
          }
        });
        
        setErrors(backendErrors);
        
        // Jump to the first step with an error
        if (firstErrorStep !== currentStep) {
          setCurrentStep(firstErrorStep);
        }
        
        toast.error('Please fix the validation errors on the form');
      } else {
        toast.error(errorMessage);
      }

      // If the error is about a duplicate Employee ID, clear it from form and storage
      if (errorMessage.includes('Employee ID') && errorMessage.includes('already exists')) {
        setFormData(prev => ({
          ...prev,
          employeeId: ''
        }));

        // Update local storage too
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            parsed.formData.employeeId = '';
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
        } catch (e) {
          console.error("Failed to update storage after error", e);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recovery modal handlers
  const handleRecover = useCallback(() => {
    if (recoveryData) {
      setFormData(recoveryData.formData || defaultFormData);
      setCurrentStep(recoveryData.currentStep || 1);
      setLastSaved(recoveryData.timestamp ? new Date(recoveryData.timestamp) : null);
      toast.success('Form data recovered successfully');
    }
    setShowRecoveryModal(false);
  }, [recoveryData]);

  const handleDiscard = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecoveryData(null);
    setShowRecoveryModal(false);
    toast.info('Previous form data discarded');
  }, []);

  // Manual save function
  const handleManualSave = useCallback(() => {
    const dataToSave = {
      formData,
      currentStep,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    setLastSaved(new Date());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    toast.success('Form progress saved');
  }, [formData, currentStep]);

  // Render step content
  const renderStepContent = useCallback(() => {
    if (!isDataLoaded || loadingDropdowns) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    const commonProps = {
      formData,
      errors,
      onChange: handleInputChange,
      dropdownData
    };

    switch (currentStep) {
      case 1: return <PersonalInfoForm {...commonProps} />;
      case 2: return <ContactInfoForm {...commonProps} />;
      case 3: return <ProfessionalInfoForm {...commonProps} />;
      case 4: return <BankingInfoForm {...commonProps} />;
      case 5: return <DocumentsForm {...commonProps} />;
      default: return null;
    }
  }, [currentStep, formData, errors, handleInputChange, isDataLoaded, loadingDropdowns, dropdownData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Breadcrumb
        items={[
          { label: homeLabel, href: homeHref },
          { label: 'Employees', href: `${basePath}/employees` },
          { label: 'Add Employee', href: `${basePath}/employees/add` }
        ]}
      />

      {/* Save Status Indicator */}
      <div className="px-6 pt-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            {isSaved && (
              <span className="text-brand-600 dark:text-brand-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Saved
              </span>
            )}
            {lastSaved && (
              <span className="text-gray-500 dark:text-gray-400">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleManualSave}
              className="px-4 py-2 text-xs font-semibold bg-brand-50 text-brand-700 rounded-sm hover:bg-brand-100 
                         dark:bg-brand-500/20 dark:text-brand-400 dark:hover:bg-brand-500/30 
                         border border-brand-200 dark:border-brand-500/30 transition-colors shadow-sm"
            >
              Save Progress
            </button>
            <button
              onClick={clearFormData}
              className="px-4 py-2 text-xs font-semibold bg-rose-50 text-rose-700 rounded-sm hover:bg-rose-100 
                         dark:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/30 
                         border border-rose-200 dark:border-rose-500/30 transition-colors shadow-sm"
            >
              Clear Form
            </button>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="px-6 my-6">
        <ProgressIndicator
          steps={STEPS}
          currentStep={currentStep}
        />
      </div>

      {/* Form Container */}
      <div className="px-4 md:px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Step Content */}
            <div className="p-4 md:p-8">
              {renderStepContent()}
            </div>

            {/* Form Navigation */}
            <div className="px-4 py-4 md:px-8 md:py-6 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
              <FormNavigation
                currentStep={currentStep}
                totalSteps={STEPS.length}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                canProceed={true}
                submitButtonText="Create User"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Modal */}
      <FormRecoveryModal
        isOpen={showRecoveryModal}
        onRecover={handleRecover}
        onDiscard={handleDiscard}
        lastSaved={recoveryData?.timestamp}
      />
    </div>
  );
}
