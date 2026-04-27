import * as Yup from 'yup';

export const personalInfoSchema = Yup.object().shape({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),

  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),

  middleName: Yup.string()
    .max(50, 'Middle name must be less than 50 characters'),

  dateOfBirth: Yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future')
    .test('age', 'Employee must be at least 18 years old', (value) => {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 18;
      }
      return age >= 18;
    }),

  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['male', 'female', 'other', 'prefer_not_to_say'], 'Please select a valid gender'),

  maritalStatus: Yup.string()
    .oneOf(['single', 'married', 'divorced', 'widowed', 'separated', ''], 'Please select a valid marital status'),

  bloodGroup: Yup.string()
    .oneOf(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', ''], 'Please select a valid blood group'),

  nationality: Yup.string()
    .max(50, 'Nationality must be less than 50 characters'),



  profilePhoto: Yup.mixed()
    .test('fileSize', 'File size too large', (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024; // 5MB
    })
    .test('fileType', 'Unsupported file format', (value) => {
      if (!value) return true;
      return ['image/jpeg', 'image/png', 'image/gif'].includes(value.type);
    })
});

// You can add other step schemas here later
export const contactInfoSchema = Yup.object().shape({});
export const professionalInfoSchema = Yup.object().shape({});
export const bankingInfoSchema = Yup.object().shape({});
export const documentsSchema = Yup.object().shape({});