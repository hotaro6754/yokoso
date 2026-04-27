// src/app/(dashboard)/employee/profile/page.js
"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import ProfileHeader from "./components/ProfileHeader";
import PersonalInfo from "./components/PersonalInfo";
import EmploymentInfo from "./components/EmploymentInfo";
import Documents from "./components/Documents";
import BankInfo from "./components/BankInfo";
import userService from "@/services/user-services/user.service";
import { toast } from "react-hot-toast";

// Define allowed fields for update
const ALLOWED_UPDATE_FIELDS = [
    'phone', 'personalEmail', 'dateOfBirth', 'gender', 'maritalStatus',
    'bloodGroup', 'nationality', 'birthPlace',
    'permanentAddress', 'currentAddress', 'city', 'state', 'pincode', 'country',
    'emergencyContactName', 'emergencyContactRelation', 'emergencyContactPhone',
    'bankName', 'accountNumber', 'ifscCode', 'accountHolderName', 'branchName',
    'accountType', 'panNumber', 'aadhaarNumber'
];

export default function ProfilePage() {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await userService.getProfile();

            if (response.success || response.data) { // Handle response structure
                const transformedData = transformApiData(response.data || response); // Fallback if data is at root
                setProfileData(transformedData);
            } else {
                throw new Error(response.message || 'Failed to load profile');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to load profile data');
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const transformApiData = (apiData) => {
        const employee = apiData.employee || {};
        const documents = (employee.documents || []).map((document) => ({
            id: document.id,
            name: document.name,
            type: document.type,
            uploadDate: document.createdAt ? formatDateForInput(document.createdAt) : '',
            url: document.url,
            status: document.status,
            description: document.description || ''
        }));

        return {
            personal: {
                firstName: employee.firstName || apiData.firstName || 'Employee',
                lastName: employee.lastName || apiData.lastName || '',
                email: employee.email || apiData.email || '',
                profileImage: employee.profileImage || apiData.profileImage || '',
                personalEmail: employee.personalEmail || '',
                phone: employee.phone || '',
                dateOfBirth: employee.dateOfBirth ? formatDateForInput(employee.dateOfBirth) : '',
                gender: employee.gender === 'MALE' ? 'Male' :
                    employee.gender === 'FEMALE' ? 'Female' : 'Other',
                maritalStatus: employee.maritalStatus || '',
                bloodGroup: employee.bloodGroup || '',
                nationality: employee.nationality || '',
                birthPlace: employee.birthPlace || '',
                height: employee.height ? String(employee.height) : '',
                weight: employee.weight ? String(employee.weight) : '',
                permanentAddress: employee.permanentAddress || '',
                currentAddress: employee.currentAddress || '',
                city: employee.city || '',
                state: employee.state || '',
                pincode: employee.pincode || '',
                country: employee.country || '',
                emergencyContactName: employee.emergencyContactName || '',
                emergencyContactRelation: employee.emergencyContactRelation || '',
                emergencyContactPhone: employee.emergencyContactPhone || ''
            },
            employment: {
                employeeId: employee.employeeId || '',
                designation: employee.designation?.name || '',
                department: employee.department?.name || '',
                joiningDate: employee.joiningDate ? formatDateForInput(employee.joiningDate) : '',
                employmentType: employee.employmentType || '',
                workLocation: employee.workLocation || '',
                manager: employee.reportingManager ?
                    `${employee.reportingManager.firstName || ''} ${employee.reportingManager.lastName || ''}`.trim() : '',
                managerDesignation: employee.reportingManager?.designation?.name || ''
            },
            bank: {
                bankName: employee.bankName || '',
                accountNumber: employee.accountNumber || '',
                accountType: employee.accountType || 'SAVINGS',
                ifscCode: employee.ifscCode || '',
                accountHolderName: employee.accountHolderName || '',
                branchName: employee.branchName || '',
                panNumber: employee.panNumber || '',
                aadhaarNumber: employee.aadhaarNumber || '',
                pfNumber: employee.pfNumber || '',
                uanNumber: employee.uanNumber || '',
                esiNumber: employee.esiNumber || ''
            },
            documents,
            employeeInternalId: employee.id || null,
            // settings: {
            //     emailNotifications: true,
            //     smsNotifications: false,
            //     twoFactorAuth: true,
            //     language: 'English',
            //     timezone: apiData.company?.timezone || 'UTC'
            // },
            originalApiData: apiData
        };
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const handleUpdateProfile = async (section, data) => {
        try {
            setUpdating(true);

            // Filter only allowed fields
            let updatePayload = { employee: {} };

            if (section === 'personal') {
                // Map form data to API field names
                const mappedData = {
                    phone: data.phone || null,
                    personalEmail: data.personalEmail || null,
                    dateOfBirth: data.dateOfBirth ? formatDateForAPI(data.dateOfBirth) : null,
                    gender: data.gender === 'Male' ? 'MALE' :
                        data.gender === 'Female' ? 'FEMALE' :
                            data.gender.toUpperCase() || null,
                    maritalStatus: data.maritalStatus || null,
                    bloodGroup: data.bloodGroup || null,
                    nationality: data.nationality || null,
                    birthPlace: data.birthPlace || null,
                    height: data.height ? parseInt(data.height) : null,
                    weight: data.weight ? parseInt(data.weight) : null,
                    permanentAddress: data.permanentAddress || null,
                    currentAddress: data.currentAddress || null,
                    city: data.city || null,
                    state: data.state || null,
                    pincode: data.pincode || null,
                    country: data.country || null,
                    emergencyContactName: data.emergencyContactName || null,
                    emergencyContactRelation: data.emergencyContactRelation || null,
                    emergencyContactPhone: data.emergencyContactPhone || null
                };

                // Only include allowed fields
                Object.keys(mappedData).forEach(key => {
                    if (ALLOWED_UPDATE_FIELDS.includes(key) && mappedData[key] !== undefined) {
                        updatePayload.employee[key] = mappedData[key];
                    }
                });
            } else if (section === 'bank') {
                const mappedData = {
                    bankName: data.bankName || null,
                    accountNumber: data.accountNumber || null,
                    ifscCode: data.ifscCode || null,
                    accountHolderName: data.accountHolderName || null,
                    branchName: data.branchName || null,
                    accountType: data.accountType || null,
                    panNumber: data.panNumber || null,
                    aadhaarNumber: data.aadhaarNumber || null
                };

                // Only include allowed fields
                Object.keys(mappedData).forEach(key => {
                    if (ALLOWED_UPDATE_FIELDS.includes(key) && mappedData[key] !== undefined) {
                        updatePayload.employee[key] = mappedData[key];
                    }
                });
            } else if (section === 'documents') {
                if (!data) {
                    toast('Please select a document to upload');
                    return;
                }

                if (!profileData?.employeeInternalId) {
                    toast.error('Employee information not available');
                    return;
                }

                const formData = new FormData();
                formData.append('file', data);
                formData.append('type', 'OTHER');
                formData.append('name', data.name);

                const response = await userService.uploadDocument(
                    profileData.employeeInternalId,
                    formData
                );

                if (response.success || response.data) {
                    toast.success('Document uploaded successfully');
                    await fetchProfile();
                } else {
                    toast.error(response.message || 'Failed to upload document');
                }
                return;
            }

            console.log('Sending update payload:', updatePayload);

            // Check if there are any fields to update
            if (Object.keys(updatePayload.employee).length === 0) {
                toast('No editable fields were changed');
                return;
            }

            const response = await userService.updateProfile(updatePayload);

            if (response.success) {
                toast.success('Profile updated successfully');

                // Update local state immediately
                setProfileData(prev => ({
                    ...prev,
                    [section]: {
                        ...prev[section],
                        ...data
                    }
                }));

                // Refresh from server after a short delay
                setTimeout(() => {
                    fetchProfile();
                }, 1000);
            } else {
                toast.error(response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Update error details:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toISOString();
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-primary-50/30 via-white to-primary-50/10 min-h-screen dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 sm:p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
                <div className="text-center py-10">
                    <p className="text-gray-600 dark:text-gray-400">Failed to load profile data</p>
                    <button
                        onClick={fetchProfile}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-primary-50/30 via-white to-primary-50/10 min-h-screen dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-4 sm:p-6">
            <Breadcrumb customTitle="My Profile" />

            <ProfileHeader profileData={profileData.personal} />

            <div className="mt-6 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <PersonalInfo
                        data={profileData.personal}
                        onUpdate={(data) => handleUpdateProfile("personal", data)}
                        updating={updating}
                    />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <Documents data={profileData.documents} onUpdate={(data) => handleUpdateProfile("documents", data)} />
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-4 sm:p-6">
                    <BankInfo
                        data={profileData.bank}
                        onUpdate={(data) => handleUpdateProfile("bank", data)}
                        updating={updating}
                    />
                </div>
            </div>
        </div>
    );
}
