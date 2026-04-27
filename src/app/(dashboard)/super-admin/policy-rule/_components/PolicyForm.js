// // src\app\(dashboard)\super-admin\policy-rule\_components\PolicyForm.js
// 'use client';

// import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AlertCircle, Clock, Calendar, DollarSign, Receipt, CheckCircle2, Info, Layers, Hash, Save, Settings, X, Upload, ExternalLink } from 'lucide-react';
import React from 'react';

// export default function PolicyForm({ initialValues, onSubmit, isEditing = false, onCancel, readOnly = false }) {
//     const getValidationSchema = () => {
//         const baseSchema = {
//             name: Yup.string().required('Name is required'),
//             type: Yup.string().required('Type is required'),
//             version: Yup.string().required('Version is required'),
//         };

//         return Yup.object().shape({
//             ...baseSchema,
//             shiftStart: Yup.string().when('type', {
//                 is: 'ATTENDANCE',
//                 then: (schema) => schema.required('Shift Start is required'),
//             }),
//             shiftEnd: Yup.string().when('type', {
//                 is: 'ATTENDANCE',
//                 then: (schema) => schema.required('Shift End is required'),
//             }),
//             gracePeriodMinutes: Yup.number().when('type', {
//                 is: 'ATTENDANCE',
//                 then: (schema) => schema.required('Grace Period is required').min(0),
//             }),
//             annualLeaveCount: Yup.number().when('type', {
//                 is: 'LEAVE',
//                 then: (schema) => schema.required('Annual Leave Count is required').min(0),
//             }),
//             sickLeaveCount: Yup.number().when('type', {
//                 is: 'LEAVE',
//                 then: (schema) => schema.required('Sick Leave Count is required').min(0),
//             }),
//         });
//     };

//     const formik = useFormik({
//         initialValues: initialValues || {
//             name: '',
//             description: '',
//             type: 'ATTENDANCE',
//             isActive: true,
//             version: '1.0',

//             // ATTENDANCE
//             shiftStart: '09:00',
//             shiftEnd: '18:00',
//             gracePeriodMinutes: 15,
//             halfDayLateEntry: '11:00',
//             biometricEnabled: false,

//             // LEAVE
//             annualLeaveCount: 18,
//             sickLeaveCount: 12,
//             maxCarryOverDays: 0,
//             encashmentAllowed: false,
//             probationLeaveAllowed: false,

//             // PAYROLL
//             salaryCycleStartDay: 1,
//             salaryCycleEndDay: 30,
//             taxDeductionMethod: 'PROJECTED',
//             overtimeCalculationRate: 1.5,
//             payslipGenerationDate: 28,

//             // EXPENSE
//             autoApprovalLimit: 0,
//             receiptRequiredAbove: 0,
//             travelClassAllowed: 'ECONOMY',
//             maxFoodAllowancePerDay: 0,
//             reimbursementCycleDays: 7,
//         },
//         validationSchema: getValidationSchema(),
//         enableReinitialize: true,
//         onSubmit: async (values) => {
//             // Construct clean payload
//             const common = {
//                 name: values.name,
//                 description: values.description,
//                 type: values.type,
//                 isActive: values.isActive,
//                 version: values.version,
//             };

//             let specific = {};
//             if (values.type === 'ATTENDANCE') {
//                 specific = {
//                     shiftStart: values.shiftStart,
//                     shiftEnd: values.shiftEnd,
//                     gracePeriodMinutes: values.gracePeriodMinutes,
//                     halfDayLateEntry: values.halfDayLateEntry,
//                     biometricEnabled: values.biometricEnabled,
//                 };
//             } else if (values.type === 'LEAVE') {
//                 specific = {
//                     annualLeaveCount: values.annualLeaveCount,
//                     sickLeaveCount: values.sickLeaveCount,
//                     maxCarryOverDays: values.maxCarryOverDays,
//                     encashmentAllowed: values.encashmentAllowed,
//                     probationLeaveAllowed: values.probationLeaveAllowed,
//                 };
//             } else if (values.type === 'PAYROLL') {
//                 specific = {
//                     salaryCycleStartDay: values.salaryCycleStartDay,
//                     salaryCycleEndDay: values.salaryCycleEndDay,
//                     taxDeductionMethod: values.taxDeductionMethod,
//                     overtimeCalculationRate: values.overtimeCalculationRate,
//                     payslipGenerationDate: values.payslipGenerationDate,
//                 };
//             } else if (values.type === 'EXPENSE') {
//                 specific = {
//                     autoApprovalLimit: values.autoApprovalLimit,
//                     receiptRequiredAbove: values.receiptRequiredAbove,
//                     travelClassAllowed: values.travelClassAllowed,
//                     maxFoodAllowancePerDay: values.maxFoodAllowancePerDay,
//                     reimbursementCycleDays: values.reimbursementCycleDays,
//                 };
//             }

//             await onSubmit({ ...common, ...specific });
//         },
//     });

//     const renderSpecificFields = () => {
//         const type = formik.values.type;

//         if (type === 'ATTENDANCE') {
//             return (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Shift Start</label>
//                         <input type="time" {...formik.getFieldProps('shiftStart')} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm" />
//                         {formik.touched.shiftStart && formik.errors.shiftStart && <div className="text-red-500 text-xs mt-1">{formik.errors.shiftStart}</div>}
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Shift End</label>
//                         <input type="time" {...formik.getFieldProps('shiftEnd')} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm" />
//                         {formik.touched.shiftEnd && formik.errors.shiftEnd && <div className="text-red-500 text-xs mt-1">{formik.errors.shiftEnd}</div>}
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Grace Period (mins)</label>
//                         <input type="number" {...formik.getFieldProps('gracePeriodMinutes')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm" />
//                         {formik.touched.gracePeriodMinutes && formik.errors.gracePeriodMinutes && <div className="text-red-500 text-xs mt-1">{formik.errors.gracePeriodMinutes}</div>}
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Half Day Late Entry</label>
//                         <input type="time" {...formik.getFieldProps('halfDayLateEntry')} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm" />
//                     </div>
//                     <div className="flex items-center sm:col-span-2 pt-4">
//                         <input type="checkbox" id="biometricEnabled" checked={formik.values.biometricEnabled} onChange={(e) => formik.setFieldValue('biometricEnabled', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
//                         <label htmlFor="biometricEnabled" className="ml-2 block text-sm text-gray-900">Biometric Enabled</label>
//                     </div>
//                 </div>
//             );
//         } else if (type === 'LEAVE') {
//             return (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Annual Leave Count</label>
//                         <input type="number" {...formik.getFieldProps('annualLeaveCount')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm" />
//                         {formik.touched.annualLeaveCount && formik.errors.annualLeaveCount && <div className="text-red-500 text-xs mt-1">{formik.errors.annualLeaveCount}</div>}
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Sick Leave Count</label>
//                         <input type="number" {...formik.getFieldProps('sickLeaveCount')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm" />
//                         {formik.touched.sickLeaveCount && formik.errors.sickLeaveCount && <div className="text-red-500 text-xs mt-1">{formik.errors.sickLeaveCount}</div>}
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Max Carry Over Days</label>
//                         <input type="number" {...formik.getFieldProps('maxCarryOverDays')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm" />
//                     </div>
//                     <div className="flex flex-col gap-2 sm:col-span-2 pt-2">
//                         <div className="flex items-center">
//                             <input type="checkbox" id="encashmentAllowed" checked={formik.values.encashmentAllowed} onChange={(e) => formik.setFieldValue('encashmentAllowed', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
//                             <label htmlFor="encashmentAllowed" className="ml-2 block text-sm text-gray-900">Encashment Allowed</label>
//                         </div>
//                         <div className="flex items-center">
//                             <input type="checkbox" id="probationLeaveAllowed" checked={formik.values.probationLeaveAllowed} onChange={(e) => formik.setFieldValue('probationLeaveAllowed', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
//                             <label htmlFor="probationLeaveAllowed" className="ml-2 block text-sm text-gray-900">Probation Leave Allowed</label>
//                         </div>
//                     </div>
//                 </div>
//             );
//         } else if (type === 'PAYROLL') {
//             return (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Salary Cycle Start</label>
//                         <input type="number" {...formik.getFieldProps('salaryCycleStartDay')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm" />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Salary Cycle End</label>
//                         <input type="number" {...formik.getFieldProps('salaryCycleEndDay')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm" />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Tax Deduction</label>
//                         <select {...formik.getFieldProps('taxDeductionMethod')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm">
//                             <option value="PROJECTED">Projected</option>
//                             <option value="ACTUAL">Actual</option>
//                         </select>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Overtime Rate (x)</label>
//                         <input type="number" step="0.1" {...formik.getFieldProps('overtimeCalculationRate')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm" />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Payslip Gen Date</label>
//                         <input type="number" {...formik.getFieldProps('payslipGenerationDate')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm" />
//                     </div>
//                 </div>
//             );
//         } else if (type === 'EXPENSE') {
//             return (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Auto Approval Limit</label>
//                         <input type="number" {...formik.getFieldProps('autoApprovalLimit')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm" />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Receipt Required Above</label>
//                         <input type="number" {...formik.getFieldProps('receiptRequiredAbove')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm" />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Travel Class</label>
//                         <select {...formik.getFieldProps('travelClassAllowed')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm">
//                             <option value="ECONOMY">Economy</option>
//                             <option value="BUSINESS">Business</option>
//                             <option value="FIRST">First</option>
//                         </select>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Max Food Allowance</label>
//                         <input type="number" {...formik.getFieldProps('maxFoodAllowancePerDay')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm" />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-700">Reimbursement Cycle</label>
//                         <input type="number" {...formik.getFieldProps('reimbursementCycleDays')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 sm:text-sm" />
//                     </div>
//                 </div>
//             );
//         }
//         return null;
//     };

//     return (
//         <form onSubmit={formik.handleSubmit} className="space-y-4 text-left">
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700">Policy Name</label>
//                     <input
//                         type="text"
//                         {...formik.getFieldProps('name')}
//                         className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
//                     />
//                     {formik.touched.name && formik.errors.name && (
//                         <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
//                     )}
//                 </div>
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700">Type</label>
//                     <select
//                         {...formik.getFieldProps('type')}
//                         className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
//                     >
//                         <option value="ATTENDANCE">Attendance</option>
//                         <option value="LEAVE">Leave</option>
//                         <option value="PAYROLL">Payroll</option>
//                         <option value="EXPENSE">Expense</option>
//                     </select>
//                     {formik.touched.type && formik.errors.type && (
//                         <div className="text-red-500 text-xs mt-1">{formik.errors.type}</div>
//                     )}
//                 </div>

//                 <div>
//                     <label className="block text-sm font-medium text-gray-700">Version</label>
//                     <input
//                         type="text"
//                         {...formik.getFieldProps('version')}
//                         className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
//                     />
//                     {formik.touched.version && formik.errors.version && (
//                         <div className="text-red-500 text-xs mt-1">{formik.errors.version}</div>
//                     )}
//                 </div>
//                 <div className="flex items-center sm:pt-6">
//                     <input
//                         type="checkbox"
//                         id="isActive"
//                         checked={formik.values.isActive}
//                         onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
//                         className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
//                     />
//                     <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Is Active</label>
//                 </div>
//             </div>

//             <div>
//                 <label className="block text-sm font-medium text-gray-700">Description</label>
//                 <textarea
//                     rows={2}
//                     {...formik.getFieldProps('description')}
//                     className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
//                 />
//             </div>

//             <div className="border-t border-gray-100 pt-4 mt-4">
//                 <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                     <AlertCircle className="w-4 h-4 text-blue-500" />
//                     Policy Configuration
//                 </h4>
//                 {renderSpecificFields()}
//             </div>

//             <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
//                 <button
//                     type="submit"
//                     disabled={formik.isSubmitting}
//                     className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2 disabled:opacity-50"
//                 >
//                     {isEditing ? 'Update Policy' : 'Create Policy'}
//                 </button>
//                 <button
//                     type="button"
//                     className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
//                     onClick={onCancel}
//                 >
//                     Cancel
//                 </button>
//             </div>
//         </form>
//     );
// }


// 'use client';

import { useFormik } from 'formik';
// import * as Yup from 'yup';

import { motion, AnimatePresence } from 'framer-motion';

// Icons mapping for policy types
const POLICY_TYPES = [
    { id: 'ATTENDANCE', label: 'Attendance', icon: Clock, description: 'Shift timings, grace periods, & biometrics.' },
    { id: 'LEAVE', label: 'Leave', icon: Calendar, description: 'Annual quotas, carry-overs, & accruals.' },
    { id: 'PAYROLL', label: 'Payroll', icon: DollarSign, description: 'Salary cycles, tax methods, & overtime.' },
    { id: 'EXPENSE', label: 'Expense', icon: Receipt, description: 'Approval limits, travel classes, & allowances.' },
    { id: 'CUSTOM', label: 'Custom', icon: Settings, description: 'Flexible custom policy configuration.' },
];

const getBackendBaseUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    return apiUrl.replace(/\/api\/?$/, '');
};

const DEFAULT_POLICY_VALUES = {
    name: '',
    description: '',
    type: 'ATTENDANCE',
    isActive: true,
    version: '1.0',
    shiftStart: '09:00',
    shiftEnd: '18:00',
    gracePeriodMinutes: 15,
    halfDayLateEntry: '11:00',
    biometricEnabled: false,
    casualLeaveCount: 0,
    sickLeaveCount: 0,
    earnedLeaveCount: 0,
    salaryCycleStartDay: 1,
    salaryCycleEndDay: 30,
    taxDeductionMethod: 'PROJECTED',
    overtimeCalculationRate: 1.5,
    payslipGenerationDate: 28,
    autoApprovalLimit: 0,
    receiptRequiredAbove: 0,
    travelClassAllowed: 'ECONOMY',
    maxFoodAllowancePerDay: 0,
    reimbursementCycleDays: 7,
    customRules: '',
    policyDocumentUrl: '',
    policyDocumentName: '',
};

export default function PolicyForm({ initialValues, onSubmit, isEditing = false, onCancel, readOnly = false, viewMode = 'form' }) {
    const [selectedPolicyDocument, setSelectedPolicyDocument] = React.useState(null);
    const mergedInitialValues = React.useMemo(
        () => ({ ...DEFAULT_POLICY_VALUES, ...(initialValues || {}) }),
        [initialValues]
    );

    React.useEffect(() => {
        setSelectedPolicyDocument(null);
    }, [initialValues]);

    const resolveDocumentUrl = React.useCallback((url) => {
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        return `${getBackendBaseUrl()}${url.startsWith('/') ? url : `/${url}`}`;
    }, []);

    // --- Validation Schema (Preserved) ---
    const getValidationSchema = () => {
        const baseSchema = {
            name: Yup.string().required('Name is required'),
            type: Yup.string().required('Type is required'),
            version: Yup.string().required('Version is required'),
        };

        return Yup.object().shape({
            ...baseSchema,
            shiftStart: Yup.string().when('type', { is: 'ATTENDANCE', then: (schema) => schema.required('Shift Start is required') }),
            shiftEnd: Yup.string().when('type', { is: 'ATTENDANCE', then: (schema) => schema.required('Shift End is required') }),
            gracePeriodMinutes: Yup.number().when('type', { is: 'ATTENDANCE', then: (schema) => schema.required('Grace Period is required').min(0) }),
            casualLeaveCount: Yup.number().when('type', { is: 'LEAVE', then: (schema) => schema.required('Casual Leave Count is required').min(0) }),
            sickLeaveCount: Yup.number().when('type', { is: 'LEAVE', then: (schema) => schema.required('Sick Leave Count is required').min(0) }),
        });
    };

    const formik = useFormik({
        initialValues: mergedInitialValues,
        validationSchema: getValidationSchema(),
        enableReinitialize: true,
        onSubmit: async (values) => {
            // Construct clean payload (Preserved Logic)
            const common = {
                name: values.name,
                description: values.description,
                type: values.type,
                isActive: values.isActive,
                version: values.version,
            };

            let specific = {};
            if (values.type === 'ATTENDANCE') {
                specific = {
                    shiftStart: values.shiftStart, shiftEnd: values.shiftEnd,
                    gracePeriodMinutes: values.gracePeriodMinutes, halfDayLateEntry: values.halfDayLateEntry,
                    biometricEnabled: values.biometricEnabled,
                };
            } else if (values.type === 'LEAVE') {
                specific = {
                    casualLeaveCount: values.casualLeaveCount,
                    sickLeaveCount: values.sickLeaveCount,
                    earnedLeaveCount: values.earnedLeaveCount
                };
            } else if (values.type === 'PAYROLL') {
                specific = {
                    salaryCycleStartDay: values.salaryCycleStartDay, salaryCycleEndDay: values.salaryCycleEndDay,
                    taxDeductionMethod: values.taxDeductionMethod, overtimeCalculationRate: values.overtimeCalculationRate,
                    payslipGenerationDate: values.payslipGenerationDate,
                };
            } else if (values.type === 'EXPENSE') {
                specific = {
                    autoApprovalLimit: values.autoApprovalLimit, receiptRequiredAbove: values.receiptRequiredAbove,
                    travelClassAllowed: values.travelClassAllowed, maxFoodAllowancePerDay: values.maxFoodAllowancePerDay,
                    reimbursementCycleDays: values.reimbursementCycleDays,
                };
            } else if (values.type === 'CUSTOM') {
                specific = {
                    customRules: values.customRules,
                };
            }
            await onSubmit({
                ...common,
                ...specific,
                policyDocumentFile: selectedPolicyDocument || undefined,
                policyDocumentUrl: values.policyDocumentUrl || '',
                policyDocumentName: values.policyDocumentName || selectedPolicyDocument?.name || '',
            });
        },
    });

    // Helper for input styles
    const inputClass = (error) => `
        w-full px-4 py-3 rounded-sm border bg-gray-50 dark:bg-gray-900/50 
        text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 transition-all outline-none
        ${error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500/20'}
        ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}
    `;

    const labelClass = "block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5";

    // --- Dynamic Fields Renderer ---
    const renderSpecificFields = () => {
        const type = formik.values.type;

        return (
            <motion.div
                key={type}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
                {type === 'ATTENDANCE' && (
                    <>
                        <div>
                            <label className={labelClass}>Shift Start Time</label>
                            <input type="time" {...formik.getFieldProps('shiftStart')} className={inputClass(formik.touched.shiftStart && formik.errors.shiftStart)} disabled={readOnly} />
                            {formik.touched.shiftStart && formik.errors.shiftStart && <p className="text-red-500 text-xs mt-1">{formik.errors.shiftStart}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Shift End Time</label>
                            <input type="time" {...formik.getFieldProps('shiftEnd')} className={inputClass(formik.touched.shiftEnd && formik.errors.shiftEnd)} disabled={readOnly} />
                            {formik.touched.shiftEnd && formik.errors.shiftEnd && <p className="text-red-500 text-xs mt-1">{formik.errors.shiftEnd}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Grace Period (Minutes)</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input type="number" {...formik.getFieldProps('gracePeriodMinutes')} className={`pl-10 ${inputClass(formik.touched.gracePeriodMinutes && formik.errors.gracePeriodMinutes)}`} disabled={readOnly} />
                            </div>
                            {formik.touched.gracePeriodMinutes && formik.errors.gracePeriodMinutes && <p className="text-red-500 text-xs mt-1">{formik.errors.gracePeriodMinutes}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Half Day Entry Cutoff</label>
                            <input type="time" {...formik.getFieldProps('halfDayLateEntry')} className={inputClass()} disabled={readOnly} />
                        </div>
                        <div className="md:col-span-2 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-sm flex items-center gap-3 border border-primary-100 dark:border-primary-800">
                            <input type="checkbox" id="biometricEnabled" checked={formik.values.biometricEnabled} onChange={(e) => !readOnly && formik.setFieldValue('biometricEnabled', e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-600" disabled={readOnly} />
                            <div>
                                <label htmlFor="biometricEnabled" className="block text-sm font-bold text-primary-900 dark:text-primary-100">Enable Biometric Integration</label>
                                <span className="text-xs text-primary-700 dark:text-primary-300">Sync punches directly from biometric devices.</span>
                            </div>
                        </div>
                    </>
                )}

                {type === 'LEAVE' && (
                    <>
                        <div>
                            <label className={labelClass}>Casual Leave Annually</label>
                            <input type="number" {...formik.getFieldProps('casualLeaveCount')} className={inputClass(formik.touched.casualLeaveCount && formik.errors.casualLeaveCount)} disabled={readOnly} />
                            {formik.touched.casualLeaveCount && formik.errors.casualLeaveCount && <p className="text-red-500 text-xs mt-1">{formik.errors.casualLeaveCount}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Sick Leave Annually</label>
                            <input type="number" {...formik.getFieldProps('sickLeaveCount')} className={inputClass(formik.touched.sickLeaveCount && formik.errors.sickLeaveCount)} disabled={readOnly} />
                            {formik.touched.sickLeaveCount && formik.errors.sickLeaveCount && <p className="text-red-500 text-xs mt-1">{formik.errors.sickLeaveCount}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Earned Leave Annually</label>
                            <input type="number" {...formik.getFieldProps('earnedLeaveCount')} className={inputClass(formik.touched.earnedLeaveCount && formik.errors.earnedLeaveCount)} disabled={readOnly} />
                            {formik.touched.earnedLeaveCount && formik.errors.earnedLeaveCount && <p className="text-red-500 text-xs mt-1">{formik.errors.earnedLeaveCount}</p>}
                        </div>
                    </>
                )}

                {type === 'PAYROLL' && (
                    <>
                        <div>
                            <label className={labelClass}>Cycle Start Day</label>
                            <input type="number" {...formik.getFieldProps('salaryCycleStartDay')} className={inputClass()} disabled={readOnly} />
                        </div>
                        <div>
                            <label className={labelClass}>Cycle End Day</label>
                            <input type="number" {...formik.getFieldProps('salaryCycleEndDay')} className={inputClass()} disabled={readOnly} />
                        </div>
                        <div>
                            <label className={labelClass}>Tax Deduction</label>
                            <select {...formik.getFieldProps('taxDeductionMethod')} className={inputClass()} disabled={readOnly}>
                                <option value="PROJECTED">Projected</option>
                                <option value="ACTUAL">Actual</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Overtime Multiplier</label>
                            <input type="number" step="0.1" {...formik.getFieldProps('overtimeCalculationRate')} className={inputClass()} disabled={readOnly} />
                        </div>
                    </>
                )}

                {type === 'EXPENSE' && (
                    <>
                        <div>
                            <label className={labelClass}>Auto-Approval Limit</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3.5 text-gray-400 font-bold">$</span>
                                <input type="number" {...formik.getFieldProps('autoApprovalLimit')} className={`pl-8 ${inputClass()}`} disabled={readOnly} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Receipt Required Above</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3.5 text-gray-400 font-bold">$</span>
                                <input type="number" {...formik.getFieldProps('receiptRequiredAbove')} className={`pl-8 ${inputClass()}`} disabled={readOnly} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Max Food Allowance (Daily)</label>
                            <input type="number" {...formik.getFieldProps('maxFoodAllowancePerDay')} className={inputClass()} disabled={readOnly} />
                        </div>
                        <div>
                            <label className={labelClass}>Allowed Travel Class</label>
                            <select {...formik.getFieldProps('travelClassAllowed')} className={inputClass()} disabled={readOnly}>
                                <option value="ECONOMY">Economy</option>
                                <option value="BUSINESS">Business</option>
                                <option value="FIRST">First Class</option>
                            </select>
                        </div>
                    </>
                )}

                {type === 'CUSTOM' && (
                    <>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Custom Rules</label>
                            <textarea rows={6} {...formik.getFieldProps('customRules')} className={`${inputClass()} resize-none`} placeholder="Define your custom policy rules here..." disabled={readOnly} />
                        </div>
                    </>
                )}
            </motion.div>
        );
    };

    // --- DOCUMENT MODE VIEW ---
    if (viewMode === 'document') {
        const type = formik.values.type;
        const typeConfig = POLICY_TYPES.find(t => t.id === type) || POLICY_TYPES[0];
        const Icon = typeConfig.icon;

        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-5xl mx-auto border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="relative">
                    <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-primary-600/10 via-primary-500/5 to-transparent" />
                    <div className="relative p-6 sm:p-10">
                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                            <div className="flex-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs font-bold mb-3">
                                    <Icon size={14} />
                                    {typeConfig.label} Policy
                                </div>
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                                    {formik.values.name}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl text-sm">
                                    {formik.values.description || "No description provided for this policy."}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold">
                                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                        Type: {typeConfig.label}
                                    </span>
                                    <span className={`px-2.5 py-1 rounded-full border ${formik.values.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                        {formik.values.isActive ? 'Active' : 'Draft'}
                                    </span>
                                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                        Version v{formik.values.version}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 px-4 py-3">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Version</div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-white font-mono">v{formik.values.version}</div>
                                </div>
                                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 px-4 py-3">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</div>
                                    <div className={`text-sm font-bold ${formik.values.isActive ? 'text-green-700' : 'text-gray-500'}`}>
                                        {formik.values.isActive ? 'Authorized' : 'Draft'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rules */}
                        <section className="mt-10">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-xs font-black text-primary-600 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <span className="h-[2px] w-8 bg-primary-600"></span>
                                    Provisions & Rules
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {type === 'ATTENDANCE' && (
                                    <>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Shift Schedule</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mt-1">
                                                <Clock size={16} className="text-primary-500" />
                                                {formik.values.shiftStart} — {formik.values.shiftEnd}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Grace Interval</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                                                {formik.values.gracePeriodMinutes ?? 0} Minutes
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Late Entry Threshold</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                                                {formik.values.halfDayLateEntry || '-'}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Authentication Method</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                                                {formik.values.biometricEnabled ? 'Biometric Mandatory' : 'Standard Web/APP Marking'}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {type === 'LEAVE' && (
                                    <>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Casual Leave</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{formik.values.casualLeaveCount ?? 0} Days</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Sick Leave</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{formik.values.sickLeaveCount ?? 0} Days</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Earned Leave</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{formik.values.earnedLeaveCount ?? 0} Days</p>
                                        </div>
                                    </>
                                )}

                                {type === 'PAYROLL' && (
                                    <>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Salary Cycle</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">
                                                Day {formik.values.salaryCycleStartDay || 1} — Day {formik.values.salaryCycleEndDay || 30}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tax Method</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{formik.values.taxDeductionMethod}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Overtime Rate</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{formik.values.overtimeCalculationRate}x Regular Rate</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Payslip Date</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{formik.values.payslipGenerationDate || 28}th of Month</p>
                                        </div>
                                    </>
                                )}

                                {type === 'EXPENSE' && (
                                    <>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Auto-Approval Threshold</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">${formik.values.autoApprovalLimit ?? 0}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Receipt Requirement</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">Above ${formik.values.receiptRequiredAbove ?? 0}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Food Allowance</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">${formik.values.maxFoodAllowancePerDay ?? 0} / Day</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Travel Class</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{formik.values.travelClassAllowed}</p>
                                        </div>
                                        <div className="rounded-lg border border-gray-100 dark:border-gray-700 p-4 bg-gray-50/70 dark:bg-gray-900/40">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Reimbursement Cycle</label>
                                            <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{formik.values.reimbursementCycleDays ?? 7} Days</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {type === 'CUSTOM' && (
                                <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                                    <label className="text-[10px] font-black text-gray-400 uppercase block mb-4">Legal Provisions & Custom Rules</label>
                                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed text-sm">
                                        {formik.values.customRules || "No detailed rule provisions specified for this policy."}
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest gap-4">
                            <div>Document generated electronically by Zodeck Policy Engine.</div>
                            <div className="flex gap-6">
                                <span className="flex items-center gap-1.5"><Info size={12} className="text-gray-300" /> Confidential</span>
                                <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-green-500" /> Verified Authority</span>
                            </div>
                        </section>

                        {formik.values.policyDocumentUrl ? (
                            <div className="mt-6 p-4 rounded-lg border border-dashed border-primary-200 bg-primary-50/40 print:hidden">
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Policy Document</div>
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <span className="font-semibold text-gray-700">
                                        {formik.values.policyDocumentName || 'Policy document'}
                                    </span>
                                    <a
                                        href={resolveDocumentUrl(formik.values.policyDocumentUrl)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700"
                                    >
                                        Open PDF
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                            </div>
                        ) : null}

                        {/* Document Footer Actions (Non-printable) */}
                        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 print:hidden">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-8 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-sm shadow-lg shadow-primary-500/30 transition-all"
                            >
                                Close Document
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* --- LEFT COLUMN: Identity & Type --- */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                        <Layers size={18} className="text-primary-600 dark:text-primary-400" />
                        <h3 className="text-sm font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Policy Identity</h3>
                    </div>

                    <div className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className={labelClass}>Policy Name <span className="text-red-500">*</span></label>
                            <input type="text" {...formik.getFieldProps('name')} placeholder="e.g. Standard Attendance" className={inputClass(formik.touched.name && formik.errors.name)} disabled={readOnly} />
                            {formik.touched.name && formik.errors.name && <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>}
                        </div>

                        {/* Version */}
                        <div>
                            <label className={labelClass}>Version</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                <input type="text" {...formik.getFieldProps('version')} className={`pl-9 ${inputClass(formik.touched.version && formik.errors.version)}`} disabled={readOnly} />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea rows={3} {...formik.getFieldProps('description')} className={`${inputClass()} resize-none`} placeholder="Briefly describe this policy..." disabled={readOnly} />
                        </div>

                        <div>
                            <label className={labelClass}>Policy PDF</label>
                            {!readOnly && (
                                <label className="flex cursor-pointer items-center gap-3 rounded-sm border border-dashed border-primary-200 bg-primary-50/60 px-4 py-3 text-sm font-medium text-primary-700 transition hover:bg-primary-50">
                                    <Upload size={16} />
                                    <span>{selectedPolicyDocument ? selectedPolicyDocument.name : 'Upload policy PDF'}</span>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        onChange={(event) => {
                                            const file = event.currentTarget.files?.[0];
                                            if (!file) return;
                                            setSelectedPolicyDocument(file);
                                            formik.setFieldValue('policyDocumentName', file.name);
                                        }}
                                    />
                                </label>
                            )}

                            {(formik.values.policyDocumentUrl || selectedPolicyDocument) && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                    <span className="font-semibold text-gray-700">
                                        {selectedPolicyDocument?.name || formik.values.policyDocumentName || 'Policy document attached'}
                                    </span>
                                    {formik.values.policyDocumentUrl ? (
                                        <a
                                            href={resolveDocumentUrl(formik.values.policyDocumentUrl)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700"
                                        >
                                            Open PDF
                                            <ExternalLink size={12} />
                                        </a>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Status Toggle */}
                        <div className={`p-4 rounded-sm border transition-all ${formik.values.isActive ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-gray-50 border-gray-200'}`}>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative flex items-center">
                                    <input type="checkbox" className="sr-only peer" checked={formik.values.isActive || false} onChange={(e) => !readOnly && formik.setFieldValue('isActive', e.target.checked)} disabled={readOnly} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                </div>
                                <span className={`text-sm font-semibold ${formik.values.isActive ? 'text-green-700 dark:text-green-400' : 'text-gray-500'}`}>
                                    {formik.values.isActive ? 'Policy Active' : 'Draft / Inactive'}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN: Configuration Studio --- */}
            <div className="lg:col-span-2 space-y-6">

                {/* 1. Type Selector Cards */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wider mb-4">Select Policy Type</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {POLICY_TYPES.map((type) => {
                            const Icon = type.icon;
                            const isSelected = formik.values.type === type.id;
                            return (
                                <div
                                    key={type.id}
                                    onClick={() => !readOnly && formik.setFieldValue('type', type.id)}
                                    className={`relative cursor-pointer group p-4 rounded-sm border-2 transition-all duration-200 flex flex-col items-center text-center gap-2
                                        ${readOnly ? 'cursor-default' : ''}
                                        ${isSelected
                                            ? 'border-primary-400 bg-primary-50/70 dark:bg-primary-900/20 shadow-md transform scale-[1.02]'
                                            : 'border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                                    `}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 text-primary-600 dark:text-primary-400">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    )}
                                    <div className={`p-2.5 rounded-full ${isSelected ? 'bg-primary-100/70 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                        <Icon size={20} />
                                    </div>
                                    <span className={`text-sm font-bold ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {type.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {/* Helper Text for Selected Type */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={formik.values.type}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="mt-4 p-3 bg-primary-50/70 dark:bg-primary-900/20 rounded-sm flex items-center gap-3 text-sm text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800/40"
                        >
                            <Info size={18} className="shrink-0" />
                            {POLICY_TYPES.find(t => t.id === formik.values.type)?.description}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 2. Dynamic Configuration Area */}
                <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                        <AlertCircle size={18} className="text-primary-500" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Rules Configuration</h3>
                    </div>

                    {renderSpecificFields()}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-sm transition-all shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    {!readOnly && (
                        <button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="inline-flex items-center gap-2 px-8 py-3 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-sm shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            {isEditing ? 'Save Changes' : 'Create Policy'}
                        </button>
                    )}
                    {readOnly && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-8 py-3 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-sm shadow-lg shadow-primary-500/30 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            Back to List
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
}
