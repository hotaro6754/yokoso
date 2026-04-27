// src/app/(dashboard)/company-admin/users/components/UserForm.js (served via middleware rewrite)
// "use client";
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { Save, ArrowLeft, User, Mail, Shield, Lock, Loader2, Briefcase, Building } from 'lucide-react';
// import { userManagementService } from '@/services/userManagementService';
// import { toast } from 'sonner';

// export default function UserForm({ user = null, isEdit = false }) {
//   const router = useRouter();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [availableRoles, setAvailableRoles] = useState([]);
//   const [systemRoles, setSystemRoles] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [loadingData, setLoadingData] = useState(true);

//   const [formData, setFormData] = useState({
//     email: "",
//     systemRole: "",
//     companyRoleId: "",
//     employeeId: "",
//     isActive: true
//   });

//   // Load data on component mount
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setLoadingData(true);

//         // Fetch roles and employees in parallel
//         const [rolesResponse, sysRolesResponse, employeesResponse] = await Promise.all([
//           userManagementService.getCompanyRoles(),
//           userManagementService.getSystemRoles(),
//           fetch('/api/employees?limit=100').then(res => res.json()) // You'll need to create this endpoint
//         ]);

//         if (rolesResponse.success) {
//           setAvailableRoles(rolesResponse.data?.roles || rolesResponse.data || []);
//         }

//         if (sysRolesResponse.success) {
//           setSystemRoles(sysRolesResponse.data || []);
//         }

//         if (employeesResponse.success) {
//           setEmployees(employeesResponse.data || []);
//         }

//         // If editing, load user data
//         if (user && isEdit) {
//           const userResponse = await userManagementService.getUserById(user.id);
//           if (userResponse.success) {
//             const userData = userResponse.data;
//             setFormData({
//               email: userData.email || "",
//               systemRole: userData.systemRole || "",
//               companyRoleId: userData.companyRoleId || "",
//               employeeId: userData.employeeId || "",
//               isActive: userData.isActive || true
//             });
//           }
//         }

//       } catch (error) {
//         console.error('Error loading form data:', error);
//         toast.error('Failed to load form data');
//       } finally {
//         setLoadingData(false);
//       }
//     };

//     loadData();
//   }, [user, isEdit]);

//   const handleInputChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));

//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.email?.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = "Please enter a valid email address";
//     }

//     if (!formData.systemRole) {
//       newErrors.systemRole = "System role is required";
//     }

//     // Company role is optional

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     setIsSubmitting(true);

//     try {
//       // Prepare data for API
//       const apiData = {
//         email: formData.email.trim(),
//         systemRole: formData.systemRole,
//         companyRoleId: formData.companyRoleId || null,
//         employeeId: formData.employeeId || null,
//         isActive: formData.isActive
//       };

//       let response;

//       if (isEdit) {
//         response = await userManagementService.updateUser(user.id, apiData);
//         toast.success('User updated successfully');
//         router.push('/company-admin/users');
//       } else {
//         response = await userManagementService.createUser(apiData);
//         toast.success('User created successfully');
//         // Optionally redirect to user details or send password reset
//         router.push('/company-admin/users');
//       }

//       router.refresh();
//     } catch (error) {
//       console.error('Error saving user:', error);

//       // Handle specific error cases
//       if (error.message.includes('already exists')) {
//         toast.error('Email already exists');
//         setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
//       } else if (error.message.includes('invalid')) {
//         toast.error('Invalid data provided');
//       } else {
//         toast.error(error.message || 'Failed to save user');
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loadingData) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
//         <span className="ml-2 text-gray-600 dark:text-gray-400">Loading form data...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full p-4 sm:p-6">
//       {/* Header with title and back button */}
//       <div className="flex items-center mb-6">
//         <button
//           onClick={() => router.push('/company-admin/users')}
//           className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//           aria-label="Go back"
//           disabled={isSubmitting}
//         >
//           <ArrowLeft size={20} />
//         </button>
//         <div className="flex items-center">
//           <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
//             <User className="text-blue-600 dark:text-blue-400" size={24} />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//               {isEdit ? 'Edit User' : 'Add New User'}
//             </h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               {isEdit ? 'Update user information and role assignments' : 'Create a new user account and assign roles'}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Form */}
//       <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Basic Information */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
//               Basic Information
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Email */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
//                   <Mail size={16} className="mr-2" /> Email Address *
//                 </label>
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleInputChange}
//                   className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-colors ${errors.email ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
//                     }`}
//                   placeholder="Enter email address"
//                   disabled={isSubmitting || isEdit}
//                 />
//                 {errors.email && (
//                   <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//                 )}
//                 {!isEdit && (
//                   <p className="text-xs text-gray-500 mt-1">
//                     A temporary password will be generated and emailed to the user
//                   </p>
//                 )}
//               </div>

//               {/* System Role */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
//                   <Shield size={16} className="mr-2" /> System Role *
//                 </label>
//                 <select
//                   name="systemRole"
//                   value={formData.systemRole}
//                   onChange={handleInputChange}
//                   className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.systemRole ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
//                     }`}
//                   disabled={isSubmitting}
//                 >
//                   <option value="">Select System Role</option>
//                   {systemRoles.map(role => (
//                     <option key={role.name} value={role.name}>
//                       {role.displayName}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.systemRole && (
//                   <p className="text-red-500 text-sm mt-1">{errors.systemRole}</p>
//                 )}
//               </div>

//               {/* Company Role */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
//                   <Briefcase size={16} className="mr-2" /> Company Role
//                 </label>
//                 <select
//                   name="companyRoleId"
//                   value={formData.companyRoleId}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                   disabled={isSubmitting}
//                 >
//                   <option value="">No Company Role</option>
//                   {availableRoles.map(role => (
//                     <option key={role.id} value={role.id}>
//                       {role.displayName}
//                     </option>
//                   ))}
//                 </select>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Optional: Assign additional company-specific permissions
//                 </p>
//               </div>

//               {/* Link to Employee (Optional) */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
//                   <Building size={16} className="mr-2" /> Link to Employee
//                 </label>
//                 <select
//                   name="employeeId"
//                   value={formData.employeeId}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                   disabled={isSubmitting}
//                 >
//                   <option value="">No Employee Link</option>
//                   {employees.map(emp => (
//                     <option key={emp.id} value={emp.id}>
//                       {emp.employeeId} - {emp.firstName} {emp.lastName}
//                     </option>
//                   ))}
//                 </select>
//                 <p className="text-xs text-gray-500 mt-1">
//                   Optional: Link this user account to an employee record
//                 </p>
//               </div>
//             </div>

//             {/* Status Toggle */}
//             <div className="flex items-center space-x-2 pt-2">
//               <input
//                 type="checkbox"
//                 name="isActive"
//                 checked={formData.isActive}
//                 onChange={handleInputChange}
//                 id="isActive"
//                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 disabled={isSubmitting}
//               />
//               <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
//                 Active Account (User can login)
//               </label>
//             </div>
//           </div>

//           {/* Password Information (for new users) */}
//           {!isEdit && (
//             <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
//               <div className="flex items-center gap-3">
//                 <div className="p-1.5 bg-blue-600 rounded-md flex-shrink-0">
//                   <Lock className="w-4 h-4 text-white" />
//                 </div>
//                 <div>
//                   <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
//                     Password Information
//                   </h4>
//                   <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
//                     A temporary password will be automatically generated and sent to the user's email address.
//                     They will be required to change it on first login.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Form Actions */}
//           <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
//             <button
//               type="button"
//               onClick={() => router.push('/company-admin/users')}
//               className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-center disabled:opacity-50"
//               disabled={isSubmitting}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm min-w-[120px]"
//             >
//               {isSubmitting ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   {isEdit ? 'Updating...' : 'Creating...'}
//                 </>
//               ) : (
//                 <>
//                   <Save size={18} />
//                   {isEdit ? 'Update User' : 'Create User'}
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
  User,
  Mail,
  Shield,
  Lock,
  Loader2,
  Briefcase,
  Building,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { userManagementService } from "@/services/userManagementService";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

export default function UserForm({ user = null, isEdit = false }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [errors, setErrors] = useState({});

  // Data Lists
  const [availableRoles, setAvailableRoles] = useState([]);
  const [systemRoles, setSystemRoles] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    email: "",
    systemRole: "",
    companyRoleId: "",
    employeeId: "",
    isActive: true,
  });

  // --- DATA LOADING LOGIC (Preserved) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        const [rolesResponse, sysRolesResponse, employeesResponse] =
          await Promise.all([
            userManagementService.getCompanyRoles(),
            userManagementService.getSystemRoles(),
            apiClient.get("/employees/get-employees?limit=10"),
          ]);
        console.log("employeesResponse", employeesResponse.data.data);

        if (rolesResponse.success)
          setAvailableRoles(
            rolesResponse.data?.roles || rolesResponse.data || [],
          );
        if (sysRolesResponse.success)
          setSystemRoles(sysRolesResponse.data || []);
        if (employeesResponse.success)
          setEmployees(employeesResponse.data.data || []);

        if (user && isEdit) {
          const userResponse = await userManagementService.getUserById(user.id);
          if (userResponse.success) {
            const userData = userResponse.data;
            setFormData({
              email: userData.email || "",
              systemRole: userData.systemRole || "",
              companyRoleId: userData.companyRoleId || "",
              employeeId: userData.employeeId || "",
              isActive:
                userData.isActive !== undefined ? userData.isActive : true,
            });
          }
        }
      } catch (error) {
        console.error("Error loading form data:", error);
        toast.error("Failed to load form data");
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [user, isEdit]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.systemRole) newErrors.systemRole = "System role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const apiData = {
        email: formData.email.trim(),
        systemRole: formData.systemRole,
        companyRoleId: formData.companyRoleId || null,
        employeeCode: formData.employeeId || null,
        isActive: formData.isActive,
      };

      if (isEdit) {
        await userManagementService.updateUser(user.id, apiData);
        toast.success("User updated successfully");
      } else {
        await userManagementService.createUser(apiData);
        toast.success("User created successfully");
      }
      router.push("/company-admin/users");
      router.refresh();
    } catch (error) {
      if (error.message.includes("already exists")) {
        toast.error("Email already exists");
        setErrors((prev) => ({
          ...prev,
          email: "This email is already registered",
        }));
      } else {
        toast.error(error.message || "Failed to save user");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
        <span className="text-gray-500 font-medium">Initializing form...</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
    >
      {/* --- LEFT COLUMN: Credential Identity --- */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-sm text-blue-600 dark:text-blue-400">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Credentials & Access
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Define login details and system-level permissions.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john.doe@company.com"
                  className={`block w-full pl-11 pr-4 py-3 rounded-sm border bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 transition-all ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  disabled={isSubmitting || isEdit}
                />
              </div>
              {errors.email ? (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <XCircle size={14} /> {errors.email}
                </p>
              ) : (
                !isEdit && (
                  <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                    <Info size={12} /> This will be used as the username for
                    login.
                  </p>
                )
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Employee ID (optional)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  placeholder="e.g. EMP-2026-00001"
                  className={`block w-full pl-11 pr-4 py-3 rounded-sm border bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 transition-all border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20`}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* System Role Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                System Role <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <select
                  name="systemRole"
                  value={formData.systemRole}
                  onChange={handleInputChange}
                  className={`block w-full pl-11 pr-10 py-3 rounded-sm border bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 transition-all appearance-none cursor-pointer ${
                    errors.systemRole
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-200 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500/20"
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Select Access Level</option>
                  {systemRoles.map((role) => (
                    <option key={role.name} value={role.name}>
                      {role.displayName || role.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                </div>
              </div>
              {errors.systemRole && (
                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                  <XCircle size={14} /> {errors.systemRole}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Info Alert: Password Generation */}
        {!isEdit && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-sm border border-blue-100 dark:border-blue-800 flex gap-4 items-start">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-sm shadow-sm text-blue-600 dark:text-blue-400">
              <Lock size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">
                Secure Access Setup
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                A temporary password will be automatically generated and emailed
                to the user. They will be required to set a new password upon
                their first login.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* --- RIGHT COLUMN: Context & Status --- */}
      <div className="space-y-6">
        {/* Organizational Context Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">
            <Building size={18} className="text-gray-400" />
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Organizational Context
            </h3>
          </div>

          <div className="space-y-5">
            {/* Company Role */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Company Role
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                <select
                  name="companyRoleId"
                  value={formData.companyRoleId}
                  onChange={handleInputChange}
                  className="block w-full pl-9 pr-8 py-2.5 rounded-sm border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                  disabled={isSubmitting}
                >
                  <option value="">No specific role</option>
                  {availableRoles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                Assigns department-specific permissions.
              </p>
            </div>

            {/* Employee Link */}
            {/* <div>
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Link to Employee
                 </label>
                 <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    <select
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleInputChange}
                        className="block w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                        disabled={isSubmitting}
                    >
                        <option value="">Unlinked User</option>
                        {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                            {emp.firstName} {emp.lastName} ({emp.employeeId})
                        </option>
                        ))}
                    </select>
                 </div>
                 <p className="text-[11px] text-gray-400 mt-1.5">Connects user account to HR records.</p>
              </div> */}
          </div>
        </div>

        {/* Status Card */}
        <div
          className={`p-5 rounded-sm border transition-all ${
            formData.isActive
              ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
          }`}
        >
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="sr-only peer"
                disabled={isSubmitting}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </div>
            <div className="flex-1">
              <span
                className={`block text-sm font-bold ${formData.isActive ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}
              >
                {formData.isActive ? "Active Account" : "Account Suspended"}
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1 leading-tight">
                {formData.isActive
                  ? "User is permitted to log in and access the system."
                  : "User will be blocked from accessing the platform immediately."}
              </span>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-3 bg-gray-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white rounded-sm font-bold shadow-lg shadow-gray-900/20 dark:shadow-blue-900/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Save size={18} />
            )}
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </form>
  );
}
