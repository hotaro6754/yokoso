// // src/utils/validation.js - CORRECTED VERSION
// export const validateEmployeeForm = (formData, currentStep) => {
//   const errors = {};

//   // Step 1: Personal Information validation (ONLY validate fields that are in this step)
//   if (currentStep === 1) {
//     if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
//     if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';

//     // Remove email validation from Step 1 - it belongs to Step 2
//     // if (!formData.email?.trim()) errors.email = 'Email is required';
//     // else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';

//     // Only validate phone if it's actually in Step 1, otherwise remove this too
//     if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) errors.phone = 'Phone must be 10 digits';
//   }

//   // Step 2: Contact Information validation (THIS is where email should be validated)
//   if (currentStep === 2) {
//     // Add email validation here
//     if (!formData.email?.trim()) {
//       errors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       errors.email = 'Please enter a valid email address';
//     }

//     if (!formData.permanentAddress?.trim()) errors.permanentAddress = 'Permanent address is required';
//     if (!formData.currentAddress?.trim()) errors.currentAddress = 'Current address is required';

//     if (formData.emergencyContactPhone && !/^[0-9]{10}$/.test(formData.emergencyContactPhone)) {
//       errors.emergencyContactPhone = 'Emergency contact phone must be 10 digits';
//     }
//   }

//   return errors;
// };

// src\utils\validation.js
export const validateEmployeeForm = (formData, currentStep) => {
  const errors = {};

  // Step 1: Personal Information
  if (currentStep === 1) {
    if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
    if (!formData.email?.trim()) errors.email = 'Official email is required';
    else if (!isValidEmail(formData.email)) errors.email = 'Please enter a valid email address';

    if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.maritalStatus) errors.maritalStatus = 'Marital status is required';

    // Validate age if date of birth is provided
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 18) errors.dateOfBirth = 'Employee must be at least 18 years old';
      if (age > 100) errors.dateOfBirth = 'Please enter a valid date of birth';
    }
  }

  // Step 2: Contact Information
  if (currentStep === 2) {
    if (!formData.phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      errors.phone = 'Phone must be 10 digits';
    }

    // Personal Email is optional in many cases
    if (formData.personalEmail?.trim() && !isValidEmail(formData.personalEmail)) {
      errors.personalEmail = 'Please enter a valid email address';
    }

    if (formData.emergencyContactPhone && !isValidPhone(formData.emergencyContactPhone)) {
      errors.emergencyContactPhone = 'Phone number must be 10 digits';
    }
  }

  // Step 3: Professional Information
  if (currentStep === 3) {
    if (!formData.departmentId) errors.departmentId = 'Department is required';
    if (!formData.designationId) errors.designationId = 'Designation is required';
    if (!formData.joiningDate) errors.joiningDate = 'Joining date is required';
    if (!formData.employmentType) errors.employmentType = 'Employment type is required';
    
    // probationPeriod: '0' is valid (No Probation), only '' or undefined is invalid
    if (formData.probationPeriod === '' || formData.probationPeriod === undefined || formData.probationPeriod === null) {
      errors.probationPeriod = 'Probation period is required';
    }

    if (!formData.locationId) {
      errors.locationId = 'Work location is required';
    }

    // Dynamic Bonus Date Validation
    if (parseFloat(formData.joiningBonusAmount) > 0 && !formData.joiningBonusDate) {
      errors.joiningBonusDate = 'Payment date is required for Joining Bonus';
    }
    if (parseFloat(formData.referralBonusAmount) > 0 && !formData.referralBonusDate) {
      errors.referralBonusDate = 'Payment date is required for Referral Bonus';
    }
    if (parseFloat(formData.performanceBonusAmount) > 0 && !formData.performanceBonusDate) {
      errors.performanceBonusDate = 'Payment date is required for Performance Bonus';
    }
  }

  // Step 4: Banking & Documents Information
  if (currentStep === 4) {
    // Bank Details
    if (!formData.bankName?.trim()) errors.bankName = 'Bank name is required';
    if (!formData.accountNumber?.trim()) errors.accountNumber = 'Account number is required';
    if (!formData.ifscCode?.trim()) errors.ifscCode = 'IFSC code is required';
    if (!formData.accountHolderName?.trim()) errors.accountHolderName = 'Account holder name is required';
    if (!formData.accountType) errors.accountType = 'Account type is required';

    if (formData.accountNumber && !/^\d{9,18}$/.test(formData.accountNumber)) {
      errors.accountNumber = 'Please enter a valid account number';
    }

    if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      errors.ifscCode = 'Invalid IFSC format. Example: SBIN0001234 (11 characters)';
    }

    // Tax & Documents
    // PAN & Aadhaar are required as per guidelines
    if (!formData.aadhaarNumber?.trim()) errors.aadhaarNumber = 'Aadhaar number is required';
    if (!formData.panNumber?.trim()) errors.panNumber = 'PAN number is required';

    if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber)) {
      errors.aadhaarNumber = 'Aadhaar must be 12 digits';
    }

    if (formData.panNumber && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(formData.panNumber)) {
      errors.panNumber = 'Please enter a valid PAN number';
    }

    // UAN Validation (Optional)
    if (formData.uanNumber && !/^\d{12}$/.test(formData.uanNumber)) {
      errors.uanNumber = 'UAN must be 12 digits';
    }

    // Passport Validation (Optional)
    if (formData.passportNumber && !/^[A-Z0-9]{6,20}$/.test(formData.passportNumber)) {
      errors.passportNumber = 'Please enter a valid Passport number';
    }
  }

  return errors;
};

// Helper functions
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone) => {
  // Allow phone with optional +91 or 0 prefix, total digits can be 10 or 12
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 13;
};

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;

  // Check format
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    // YYYY-MM-DD
    if (parts[0].length === 4) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    // DD-MM-YYYY
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return new Date(dateStr);
};

const calculateAge = (dob) => {
  const birthDate = parseDate(dob);
  const today = new Date();

  if (!birthDate || isNaN(birthDate.getTime())) return 0;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};