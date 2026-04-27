// src/app/(dashboard)/company-admin/roles-permissions/components/RoleForm.js (served via middleware rewrite)
// "use client";
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { Save, ArrowLeft, Shield, Loader2 } from 'lucide-react';
// import { roleService } from '@/services/super-admin-services/user-roleService';
// import { toast } from 'sonner';

// export default function RoleForm({ role = null, isEdit = false }) {
//   const router = useRouter();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [formData, setFormData] = useState({
//     displayName: "",
//     description: "",
//     status: "Active"
//   });

//   useEffect(() => {
//     if (role && isEdit) {
//       setFormData({
//         // name: role.name || "",
//         // displayName: role.displayName || role.name || "",
//         displayName: role.displayName || role.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "",
//         description: role.description || "",
//         status: role.status ? role.status.charAt(0) + role.status.slice(1).toLowerCase() : "Active"
//       });
//     }
//   }, [role, isEdit]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));

//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };


//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.displayName?.trim()) {
//       newErrors.displayName = "Role name is required";
//     } else if (formData.displayName.trim().length < 2) {
//       newErrors.displayName = "Role name must be at least 2 characters";
//     } else {
//       // Validate that the auto-generated name will be valid
//       const generatedName = formData.displayName.trim()
//         .toUpperCase()
//         .replace(/\s+/g, '_')
//         .replace(/[^A-Z0-9_]/g, '');

//       if (generatedName.length < 2) {
//         newErrors.displayName = "Role name contains invalid characters";
//       } else if (generatedName.length > 50) {
//         newErrors.displayName = "Role name is too long (max 50 characters after conversion)";
//       }
//     }

//     if (!formData.description.trim()) {
//       newErrors.description = "Description is required";
//     } else if (formData.description.trim().length < 10) {
//       newErrors.description = "Description must be at least 10 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) return;

//     setIsSubmitting(true);

//     try {
//       // Generate the internal name from displayName
//       const name = formData.displayName.trim()
//         .toUpperCase()
//         .replace(/\s+/g, '_')
//         .replace(/[^A-Z0-9_]/g, '');

//       // Prepare data for API (convert status to uppercase)
//       // Prepare data for API 
//       const apiData = {
//         name: name,
//         displayName: formData.displayName.trim(),
//         description: formData.description.trim(),
//         isActive: formData.status === 'Active' // Convert to boolean
//       };

//       console.log('Submitting:', apiData);

//       let response;

//       if (isEdit) {
//         response = await roleService.updateRole(role.id, apiData);
//         toast.success('Role updated successfully');
//         router.push('/company-admin/roles-permissions');
//       } else {
//         response = await roleService.createRole(apiData);
//         toast.success('Role created successfully');
//         // Redirect to permissions page with the new role ID
//         router.push(`/company-admin/roles-permissions/${response.data.id}/permissions`);
//       }

//       router.refresh();
//     } catch (error) {
//       console.error('Error saving role:', error);

//       // Handle specific error cases
//       if (error.message.includes('already exists')) {
//         toast.error('Role name already exists');
//         setErrors(prev => ({ ...prev, displayName: 'This role name is already taken' }));
//       } else if (error.message.includes('System roles')) {
//         toast.error('Cannot modify system roles');
//       } else {
//         toast.error(error.message || 'Failed to save role');
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="w-full p-4 sm:p-6">
//       {/* Header with title and back button */}
//       <div className="flex items-center mb-6">
//         <button
//           onClick={() => router.push('/company-admin/roles-permissions')}
//           className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
//           aria-label="Go back"
//           disabled={isSubmitting}
//         >
//           <ArrowLeft size={20} />
//         </button>
//         <div className="flex items-center">
//           <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
//             <Shield className="text-blue-600 dark:text-blue-400" size={24} />
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//               {isEdit ? 'Edit Role' : 'Add New Role'}
//             </h1>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               {isEdit ? 'Update role information' : 'Create a new role with basic information'}
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

//             <div className="grid grid-cols-1 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Role Name *
//                 </label>
//                 <input
//                   type="text"
//                   name="displayName"
//                   value={formData.displayName}
//                   onChange={handleInputChange}
//                   className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-colors ${errors.displayName ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
//                     }`}
//                   placeholder="Enter role name (e.g., HR Manager)"
//                   disabled={isSubmitting}
//                 />
//                 {errors.displayName && (
//                   <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>
//                 )}
//                 {/* <p className="text-xs text-gray-500 mt-1">Minimum 2 characters</p> */}

//                 {/* Show auto-generated name preview */}
//                 {formData.displayName && (
//                   <p className="text-xs text-blue-500 mt-1">
//                     Internal ID: {formData.displayName.trim().toUpperCase().replace(/\s+/g, '_')}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Description *
//                 </label>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   rows={3}
//                   className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-colors ${errors.description ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
//                     }`}
//                   placeholder="Describe the role's purpose, responsibilities, and permissions..."
//                   disabled={isSubmitting}
//                 />
//                 {errors.description && (
//                   <p className="text-red-500 text-sm mt-1">{errors.description}</p>
//                 )}
//                 <p className="text-xs text-gray-500 mt-1">Minimum 10 characters</p>
//               </div>

//               {isEdit && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Status
//                   </label>
//                   <select
//                     name="status"
//                     value={formData.status}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
//                     disabled={isSubmitting}
//                   >
//                     <option value="Active">Active</option>
//                     <option value="Inactive">Inactive</option>
//                   </select>
//                   <p className="text-xs text-gray-500 mt-1">Inactive roles cannot be assigned to users</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Form Actions */}
//           <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
//             <button
//               type="button"
//               onClick={() => router.push('/company-admin/roles-permissions')}
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
//                   {isEdit ? 'Update Role' : 'Create Role'}
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
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, LayoutGrid, CheckCircle2, XCircle, Terminal, FileText, Info } from 'lucide-react';
import { roleService } from '@/services/super-admin-services/user-roleService';
import { toast } from 'sonner';

export default function RoleForm({ role = null, isEdit = false }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    displayName: "",
    description: "",
    status: "Active"
  });

  // --- LOGIC PRESERVED FROM ORIGINAL ---
  useEffect(() => {
    if (role && isEdit) {
      setFormData({
        displayName: role.displayName || role.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "",
        description: role.description || "",
        status: role.status ? role.status.charAt(0) + role.status.slice(1).toLowerCase() : "Active"
      });
    }
  }, [role, isEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.displayName?.trim()) {
      newErrors.displayName = "Role name is required";
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = "Role name must be at least 2 characters";
    } else {
      const generatedName = formData.displayName.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
      if (generatedName.length < 2) newErrors.displayName = "Role name contains invalid characters";
      else if (generatedName.length > 50) newErrors.displayName = "Role name is too long";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const name = formData.displayName.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
      const apiData = {
        name: name,
        displayName: formData.displayName.trim(),
        description: formData.description.trim(),
        isActive: formData.status === 'Active'
      };

      let response;
      if (isEdit) {
        response = await roleService.updateRole(role.id, apiData);
        toast.success('Role updated successfully');
        router.push('/company-admin/roles-permissions');
      } else {
        response = await roleService.createRole(apiData);
        toast.success('Role created successfully');
        router.push(`/company-admin/roles-permissions/${response.data.id}/permissions`);
      }
      router.refresh();
    } catch (error) {
      console.error('Error saving role:', error);
      if (error.message.includes('already exists')) {
        toast.error('Role name already exists');
        setErrors(prev => ({ ...prev, displayName: 'This role name is already taken' }));
      } else {
        toast.error(error.message || 'Failed to save role');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HELPER FOR INTERNAL ID ---
  const internalId = formData.displayName
    ? formData.displayName.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '')
    : 'ROLE_ID';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* --- LEFT COLUMN: FORM --- */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">

          {/* Section: Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
              <FileText size={18} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Role Identity</h3>
            </div>

            {/* Role Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  placeholder="e.g. Regional Manager"
                  className={`block w-full rounded-sm border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all ${errors.displayName ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                  disabled={isSubmitting}
                />
                {/* Internal ID Badge (Input Adornment) */}
                <div className="absolute right-3 top-3 px-2 py-0.5 rounded-sm bg-gray-200 dark:bg-gray-700 text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 pointer-events-none transition-opacity opacity-50 group-hover:opacity-100">
                  {internalId}
                </div>
              </div>
              {errors.displayName ? (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><XCircle size={14} /> {errors.displayName}</p>
              ) : (
                <p className="mt-1.5 text-xs text-gray-500">Visible name shown in user profiles and tables.</p>
              )}
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Briefly describe the responsibilities and access level for this role..."
                className={`block w-full rounded-sm border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                disabled={isSubmitting}
              />
              <div className="flex justify-between mt-1.5">
                {errors.description ? (
                  <p className="text-sm text-red-500 flex items-center gap-1"><XCircle size={14} /> {errors.description}</p>
                ) : (
                  <span className="text-xs text-gray-500">Minimum 10 characters</span>
                )}
                <span className={`text-xs ${formData.description.length < 10 ? 'text-orange-500' : 'text-green-500'}`}>
                  {formData.description.length} chars
                </span>
              </div>
            </div>
          </div>

          {/* Section: Configuration (Status) */}
          {isEdit && (
            <div className="mt-8 space-y-6">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                <LayoutGrid size={18} className="text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Configuration</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Role Status</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Active Card */}
                  <div
                    onClick={() => !isSubmitting && handleInputChange({ target: { name: 'status', value: 'Active' } })}
                    className={`cursor-pointer relative flex items-start p-4 rounded-sm border-2 transition-all ${formData.status === 'Active' ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={formData.status === 'Active'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="ml-3">
                      <span className={`block text-sm font-semibold ${formData.status === 'Active' ? 'text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'}`}>
                        Active
                      </span>
                      <span className={`block text-xs mt-1 ${formData.status === 'Active' ? 'text-primary-700 dark:text-primary-300' : 'text-gray-500'}`}>
                        Role can be assigned to new users.
                      </span>
                    </div>
                  </div>

                  {/* Inactive Card */}
                  <div
                    onClick={() => !isSubmitting && handleInputChange({ target: { name: 'status', value: 'Inactive' } })}
                    className={`cursor-pointer relative flex items-start p-4 rounded-sm border-2 transition-all ${formData.status === 'Inactive' ? 'border-red-600 bg-red-50 dark:bg-red-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        name="status"
                        value="Inactive"
                        checked={formData.status === 'Inactive'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="ml-3">
                      <span className={`block text-sm font-semibold ${formData.status === 'Inactive' ? 'text-red-900 dark:text-red-100' : 'text-gray-900 dark:text-gray-100'}`}>
                        Inactive
                      </span>
                      <span className={`block text-xs mt-1 ${formData.status === 'Inactive' ? 'text-red-700 dark:text-red-300' : 'text-gray-500'}`}>
                        Temporarily disable this role.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full sm:w-auto px-6 py-3 rounded-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              <ArrowLeft size={18} /> Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-8 py-3 rounded-sm bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Save size={18} /> {isEdit ? 'Update Role' : 'Save & Continue'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* --- RIGHT COLUMN: LIVE PREVIEW & HELP --- */}
      <div className="space-y-6">

        {/* Live Preview Card */}
        <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Live Preview</h3>

          <div className="p-4 rounded-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-primary-600 shadow-sm">
                <LayoutGrid size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 dark:text-white truncate">
                  {formData.displayName || 'Role Name'}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${formData.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {formData.status === 'Active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    {formData.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Terminal size={14} className="text-gray-400" />
                <span className="text-xs font-mono text-gray-500">System ID</span>
              </div>
              <code className="block w-full p-2 rounded bg-gray-200 dark:bg-gray-800 text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                {internalId}
              </code>
            </div>
          </div>

          {/* Helper Info */}
          <div className="mt-6 flex gap-3 text-sm text-gray-500 dark:text-gray-400 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-sm border border-primary-100 dark:border-primary-800">
            <Info className="shrink-0 text-primary-600 dark:text-primary-400" size={18} />
            <p>
              {!isEdit
                ? "After saving basic details, you will be redirected to the Permissions Matrix to configure access levels."
                : "Modifying the role name will automatically update the Display Name in all user profiles."}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}