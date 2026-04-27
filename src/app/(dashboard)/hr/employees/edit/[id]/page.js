"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Save, Loader2, User, Phone, Briefcase, CreditCard, FileText
} from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import employeeService from "@/services/hr-services/employeeService";
import { toast } from "sonner";
import { authService } from "@/services/auth-services/authService";
import { companyOrganizationService } from "@/services/super-admin-services/companyOrganization.service";

// Shared Components from Add Employee workflow
import PersonalInfoForm from "../../add/components/PersonalInfoForm";
import ContactInfoForm from "../../add/components/ContactInfoForm";
import ProfessionalInfoForm from "../../add/components/ProfessionalInfoForm";
import BankingInfoForm from "../../add/components/BankingInfoForm";
import DocumentsManager from "../../components/DocumentsManager";
import { validateEmployeeForm } from "@/utils/validation";

export default function EditEmployeePage() {
    const { id } = useParams();
    const router = useRouter();
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const basePath = pathname.startsWith("/it-admin")
        ? "/it-admin"
        : pathname.startsWith("/hr")
            ? "/hr"
            : "/hr";
    const dashboardHref = basePath === "/it-admin" ? "/it-admin/dashboard" : "/hr";

    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('personal');
    const [dropdownData, setDropdownData] = useState({
        departments: [],
        designations: [],
        reportingManagers: [],
        locations: []
    });

    // Load dropdown data (same as Add Employee)
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [departmentsResponse, designationsResponse, managersResponse, userResponse] = await Promise.all([
                    employeeService.getDepartments(),
                    employeeService.getDesignations(),
                    employeeService.getManagers(),
                    authService.getCurrentUser()
                ]);

                const user = userResponse?.user || userResponse?.data?.user;
                const companyId = user?.company?.id || localStorage.getItem('company_id');

                const locationsResponse = companyId 
                    ? await companyOrganizationService.getLocations(companyId)
                    : { data: [] };

                setDropdownData({
                    departments: departmentsResponse.data || [],
                    designations: designationsResponse.data || [],
                    reportingManagers: managersResponse.data || [],
                    locations: locationsResponse.data || locationsResponse.locations || []
                });
            } catch (error) {
                console.error('Error loading dropdown data:', error);
                toast.error("Failed to load some form options");
            }
        };

        loadDropdownData();
    }, []);

    // Fetch employee data and map to form structure
    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await employeeService.getEmployeeById(id);
                if (response.success) {
                    const emp = { ...response.data, ...(response.data.employee || {}) };
                    
                    // Unified formData object for all shared components
                    setFormData({
                        // Personal
                        firstName: emp.firstName || '',
                        lastName: emp.lastName || '',
                        email: emp.email || '',
                        personalEmail: emp.personalEmail || '',
                        dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
                        gender: (emp.gender || '').toUpperCase(),
                        maritalStatus: (emp.maritalStatus || '').toUpperCase(),
                        bloodGroup: (emp.bloodGroup || '').toUpperCase(),
                        nationality: emp.nationality || 'Indian',
                        birthPlace: emp.birthPlace || '',
                        height: emp.height || '',
                        weight: emp.weight || '',
                        profileImage: emp.profileImage || null,
                        
                        // Repeaters
                        familyDetails: Array.isArray(emp.familyDetails) ? emp.familyDetails : [],
                        educationDetails: Array.isArray(emp.educationDetails) ? emp.educationDetails : [],
                        employmentDetails: Array.isArray(emp.employmentDetails) ? emp.employmentDetails : [],

                        // Contact
                        phone: emp.phone || '',
                        permanentAddress: emp.permanentAddress || '',
                        currentAddress: emp.currentAddress || '',
                        city: emp.city || '',
                        state: emp.state || '',
                        pincode: emp.pincode || '',
                        country: emp.country || 'India',
                        emergencyContactName: emp.emergencyContactName || '',
                        emergencyContactRelation: (emp.emergencyContactRelation || '').toUpperCase(),
                        emergencyContactPhone: emp.emergencyContactPhone || '',

                        // Professional
                        systemRole: emp.systemRole || 'EMPLOYEE',
                        employeeId: emp.employeeId || '',
                        departmentId: emp.departmentId?.toString() || '',
                        designationId: emp.designationId?.toString() || '',
                        reportingManagerId: emp.reportingManagerId?.toString() || '',
                        joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '',
                        totalExperience: emp.totalExperience || '',
                        relevantExperience: emp.relevantExperience || '',
                        employmentType: emp.employmentType || 'FULL_TIME',
                        locationId: emp.locationId || '',
                        ctc: (emp.ctc || emp.baseSalary)?.toString() || '',
                        variablePay: emp.variablePay?.toString() || '',
                        salaryTemplateId: emp.salaryTemplateId?.toString() || '',
                        status: (emp.status || 'ACTIVE').toUpperCase(),
                        onboardingStatus: (emp.onboardingStatus || 'PENDING').toUpperCase(),
                        probationPeriod: emp.probationPeriod?.toString() || '0',
                        noticePeriod: emp.noticePeriod?.toString() || '0',
                        confirmationDate: emp.confirmationDate ? emp.confirmationDate.split('T')[0] : '',
                        workShift: emp.workShift || '',
                        biometricId: emp.biometricId || '',

                        // One-time Bonus Fields
                        joiningBonusAmount: emp.joiningBonusAmount?.toString() || '',
                        joiningBonusDate: emp.joiningBonusDate ? emp.joiningBonusDate.split('T')[0] : '',
                        referralBonusAmount: emp.referralBonusAmount?.toString() || '',
                        referralBonusDate: emp.referralBonusDate ? emp.referralBonusDate.split('T')[0] : '',
                        performanceBonusAmount: emp.performanceBonusAmount?.toString() || '',
                        performanceBonusDate: emp.performanceBonusDate ? emp.performanceBonusDate.split('T')[0] : '',

                        // Banking
                        bankName: emp.bankName || '',
                        accountNumber: emp.accountNumber || '',
                        ifscCode: emp.ifscCode || '',
                        accountHolderName: emp.accountHolderName || '',
                        accountType: (emp.accountType || 'SAVINGS').toUpperCase(),
                        panNumber: emp.panNumber || '',
                        aadhaarNumber: emp.aadhaarNumber || '',
                        uanNumber: emp.uanNumber || '',
                        passportNumber: emp.passportNumber || '',
                        taxRegime: emp.taxRegime || 'NEW',
                        
                        // Breakdown fields for prefill
                        basicSalary: 0,
                        hra: 0,
                        pf: 0,
                        specialAllowance: 0,
                        otherAllowances: [],
                        deductions: [],
                        
                        dbId: emp.id // numeric ID for update API
                    });
                }
            } catch (error) {
                console.error("Error fetching employee:", error);
                toast.error("Failed to load employee details");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchEmployee();
    }, [id]);

    const handleInputChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error if exists
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            // Client-side validation across all tabs
            const allErrors = {
                ...validateEmployeeForm(formData, 1),
                ...validateEmployeeForm(formData, 2),
                ...validateEmployeeForm(formData, 3),
                ...validateEmployeeForm(formData, 4),
            };

            if (Object.keys(allErrors).length > 0) {
                setErrors(allErrors);
                toast.error("Please fix the errors before saving");
                
                // Switch to the first tab with an error
                const firstErrorField = Object.keys(allErrors)[0];
                if (['firstName', 'lastName', 'dateOfBirth', 'gender', 'maritalStatus'].includes(firstErrorField)) {
                    setActiveTab('personal');
                } else if (['email', 'phone', 'permanentAddress', 'currentAddress'].includes(firstErrorField)) {
                    setActiveTab('contact');
                } else if (['departmentId', 'designationId', 'joiningDate', 'probationPeriod', 'employmentType', 'joiningBonusDate', 'referralBonusDate', 'performanceBonusDate'].includes(firstErrorField)) {
                    setActiveTab('professional');
                } else if (['bankName', 'accountNumber', 'ifscCode', 'accountType', 'panNumber', 'aadhaarNumber'].includes(firstErrorField)) {
                    setActiveTab('banking');
                }
                
                setSubmitting(false);
                return;
            }

            // employeeId in backend maps to employeeCode/employeeId field
            const payload = { ...formData };
            const response = await employeeService.updateEmployee(formData.dbId || id, payload);

            if (response.success) {
                toast.success("Employee updated successfully");
                setTimeout(() => {
                    router.push(`${basePath}/employees`);
                }, 1000);
            }
        } catch (error) {
            console.error("Update error:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to update employee";
            toast.error(errorMessage);
            
            if (error.errors) {
                setErrors(error.errors);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
                <p className="text-gray-500">Employee not found or failed to load.</p>
                <button onClick={() => router.back()} className="text-primary-600 hover:underline">
                    Go back
                </button>
            </div>
        );
    }

    const tabs = [
        { id: 'personal', label: 'Personal', icon: User },
        { id: 'contact', label: 'Contact', icon: Phone },
        { id: 'professional', label: 'Professional', icon: Briefcase },
        { id: 'banking', label: 'Banking', icon: CreditCard },
        { id: 'documents', label: 'Documents', icon: FileText },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'personal':
                return <PersonalInfoForm formData={formData} errors={errors} onChange={handleInputChange} dropdownData={dropdownData} />;
            case 'contact':
                return <ContactInfoForm formData={formData} errors={errors} onChange={handleInputChange} />;
            case 'professional':
                return <ProfessionalInfoForm formData={formData} errors={errors} onChange={handleInputChange} dropdownData={dropdownData} />;
            case 'banking':
                return <BankingInfoForm formData={formData} errors={errors} onChange={handleInputChange} />;
            case 'documents':
                return <DocumentsManager employeeId={formData.dbId || id} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-transparent pb-12">
            <div className="my-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Breadcrumb
                        items={[
                            { label: basePath === "/it-admin" ? "IT Admin" : "Dashboard", href: dashboardHref },
                            { label: "Employees", href: `${basePath}/employees` },
                            { label: "Edit Employee", active: true },
                        ]}
                    />
                    <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                        Edit: <span className="text-primary-600">{formData.firstName} {formData.lastName}</span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 disabled:opacity-50"
                    >
                        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Main Tabs Container */}
            <div className="mb-0 overflow-visible rounded-2xl border border-gray-100 bg-white/50 shadow-sm backdrop-blur-xl dark:border-gray-700/50 dark:bg-gray-900/50">
                {/* Custom Tab Navigation */}
                <div className="flex flex-wrap border-b border-gray-100 px-4 dark:border-gray-700/50">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                                    activeTab === tab.id
                                        ? "text-primary-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-primary-600"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-white"
                                }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Form Content */}
                <div className="p-4 sm:p-8">
                    {activeTab === 'documents' ? (
                        <DocumentsManager employeeId={formData.dbId || id} />
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {renderTabContent()}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
