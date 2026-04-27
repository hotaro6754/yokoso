// src/app/(dashboard)/super-admin/profile/page.js
"use client";

import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileHeader from './components/ProfileHeader';
import ProfileTabs from './components/ProfileTabs';
import userService from '@/services/user-services/user.service';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

// Define allowed fields for update
const ALLOWED_UPDATE_FIELDS = [
    'firstName', 'lastName', 'phone', 'personalEmail', 'dateOfBirth', 'gender', 'maritalStatus',
    'bloodGroup', 'nationality', 'birthPlace', 'height', 'weight',
    'permanentAddress', 'currentAddress', 'city', 'state', 'pincode', 'country',
    'emergencyContactName', 'emergencyContactRelation', 'emergencyContactPhone',
    'bankName', 'accountNumber', 'ifscCode', 'accountHolderName', 'branchName',
    'accountType', 'panNumber', 'aadhaarNumber'
];

export default function CompanyAdminProfilePage() {
    const { user, updateLocalUser } = useAuth();
    const [activeTab, setActiveTab] = useState('personal');
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await userService.getProfile();

            if (response.success) {
                const transformedData = transformApiData(response.data);

                // Fallback to local storage for image if API misses it
                let fallbackImage = user?.profileImage;
                if (typeof window !== 'undefined') {
                    try {
                        const localUser = JSON.parse(localStorage.getItem('hrms_user'));
                        if (localUser?.profileImage) fallbackImage = localUser.profileImage;
                        else if (localUser?.employee?.profileImage) fallbackImage = localUser.employee.profileImage;
                    } catch (e) {
                        // silent
                    }
                }

                if (!transformedData.personal.profileImage && fallbackImage) {
                    transformedData.personal.profileImage = fallbackImage;
                }

                setProfileData(transformedData);
            } else {
                throw new Error(response.message || 'Failed to load profile');
            }
        } catch (error) {
            // Fallback for demo/bypass mode
            if (user) {
                setProfileData(prev => ({
                    personal: {
                        ...(prev?.personal || {}),
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        profileImage: user.profileImage || user.employee?.profileImage
                    },
                    employment: prev?.employment || {},
                    bank: prev?.bank || {},
                    documents: prev?.documents || [],
                    settings: prev?.settings || {}
                }));
            } else {
                toast.error(error.message || 'Failed to load profile data');
            }
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const transformApiData = (apiData) => {
        // Fallback if employee object isn't present (e.g. user exists without an employee record)
        const employee = apiData.employee || {};
        const user = apiData.user || {}; // User profile fields from users table
        const apiUser = apiData; // Main user object for basic info

        // Helper function to transform blood group enum to display format
        const transformBloodGroupForDisplay = (bloodGroup) => {
            const bloodGroupMapping = {
                'A_POSITIVE': 'A+',
                'A_NEGATIVE': 'A-',
                'B_POSITIVE': 'B+',
                'B_NEGATIVE': 'B-',
                'AB_POSITIVE': 'AB+',
                'AB_NEGATIVE': 'AB-',
                'O_POSITIVE': 'O+',
                'O_NEGATIVE': 'O-'
            };
            return bloodGroupMapping[bloodGroup] || bloodGroup;
        };

        // Use employee data if available, otherwise use user profile fields
        const profileSource = employee.id ? employee : user;

        return {
            personal: {
                firstName: employee.firstName || user.firstName || '',
                lastName: employee.lastName || user.lastName || '',
                email: employee.email || apiUser.email || user.email || '',
                profileImage: employee.profileImage || apiData.profileImage || user.profileImage || '',
                personalEmail: employee.personalEmail || user.personalEmail || '',
                phone: employee.phone || user.phone || '',
                dateOfBirth: employee.dateOfBirth || user.dateOfBirth ? formatDateForInput(employee.dateOfBirth || user.dateOfBirth) : '',
                gender: (employee.gender || user.gender) === 'MALE' ? 'Male' :
                    (employee.gender || user.gender) === 'FEMALE' ? 'Female' : 'Other',
                maritalStatus: employee.maritalStatus || user.maritalStatus || '',
                bloodGroup: transformBloodGroupForDisplay(employee.bloodGroup || user.bloodGroup || ''),
                nationality: employee.nationality || user.nationality || '',
                birthPlace: employee.birthPlace || user.birthPlace || '',
                height: employee.height ? String(employee.height) : '',
                weight: employee.weight ? String(employee.weight) : '',
                permanentAddress: employee.permanentAddress || user.permanentAddress || '',
                currentAddress: employee.currentAddress || user.currentAddress || '',
                city: employee.city || user.city || '',
                state: employee.state || user.state || '',
                pincode: employee.pincode || user.pincode || '',
                country: employee.country || user.country || '',
                address: employee.currentAddress || user.currentAddress || (employee.city || user.city && employee.country || user.country ? `${employee.city || user.city}, ${employee.country || user.country}` : '') || '',
                emergencyContactName: employee.emergencyContactName || user.emergencyContactName || '',
                emergencyContactRelation: employee.emergencyContactRelation || user.emergencyContactRelation || '',
                emergencyContactPhone: employee.emergencyContactPhone || user.emergencyContactPhone || ''
            },
            employment: {
                employeeId: employee.employeeId || '',
                designation: employee.designation?.name || 'Company Admin',
                department: employee.department?.name || 'Administration',
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
            documents: employee.documents || [],
            settings: {
                emailNotifications: true,
                smsNotifications: false,
                twoFactorAuth: true,
                language: 'English',
                timezone: apiData.company?.timezone || 'UTC'
            },
            originalApiData: apiData
        };
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const handleImageUpdate = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64String = reader.result;

            // 1. Optimistic Update (UI + Global State)
            const updates = { profileImage: base64String };
            if (user?.employee) updates.employee = { ...user.employee, profileImage: base64String };

            updateLocalUser(updates);

            setProfileData(prev => ({
                ...prev,
                personal: { ...prev.personal, profileImage: base64String }
            }));

            // 2. Call API
            try {
                // Assuming updateProfile can handle base64 image in 'profileImage' field or similar
                // Adjust payload structure as per backend requirement. 
                // For now, sending as part of employee object if backend accepts it there
                const updatePayload = {
                    employee: { profileImage: base64String }
                };

                await userService.updateProfile(updatePayload);
                toast.success('Profile picture updated');
            } catch (err) {
                console.error('Image upload API failed', err);
                toast.success('Profile picture updated locally');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateProfile = async (section, data) => {
        try {
            setUpdating(true);

            // Filter only allowed fields
            let updatePayload = { employee: {} };

            if (section === 'personal') {
                // Helper function to transform display format back to enum
                const transformBloodGroupForAPI = (displayBloodGroup) => {
                    const reverseBloodGroupMapping = {
                        'A+': 'A_POSITIVE',
                        'A-': 'A_NEGATIVE',
                        'B+': 'B_POSITIVE',
                        'B-': 'B_NEGATIVE',
                        'AB+': 'AB_POSITIVE',
                        'AB-': 'AB_NEGATIVE',
                        'O+': 'O_POSITIVE',
                        'O-': 'O_NEGATIVE'
                    };
                    return reverseBloodGroupMapping[displayBloodGroup] || displayBloodGroup;
                };

                // Structure data according to backend expectations
                updatePayload = {
                    user: {
                        firstName: data.firstName || null,
                        lastName: data.lastName || null
                    },
                    employee: {
                        phone: data.phone || null,
                        personalEmail: data.personalEmail || null,
                        dateOfBirth: data.dateOfBirth ? formatDateForAPI(data.dateOfBirth) : null,
                        gender: data.gender === 'Male' ? 'MALE' :
                            data.gender === 'Female' ? 'FEMALE' :
                                data.gender.toUpperCase() || null,
                        maritalStatus: data.maritalStatus || null,
                        bloodGroup: transformBloodGroupForAPI(data.bloodGroup) || null,
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
                    }
                };
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

                Object.keys(mappedData).forEach(key => {
                    if (ALLOWED_UPDATE_FIELDS.includes(key) && mappedData[key] !== undefined) {
                        updatePayload.employee[key] = mappedData[key];
                    }
                });
            }

            console.log('Sending update payload:', updatePayload);

            if (Object.keys(updatePayload.employee).length === 0) {
                toast.info('No editable fields were changed');
                return;
            }

            // 2. Call API
            const response = await userService.updateProfile(updatePayload);

            if (response.success) {
                toast.success('Profile updated successfully');

                // Update Local User Context
                updateLocalUser(data);

                setProfileData(prev => ({
                    ...prev,
                    [section]: {
                        ...prev[section],
                        ...data
                    }
                }));
            } else {
                toast.error(response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Update error details:', error);

            // Fallback for demo mode
            if (user) {
                updateLocalUser(data);
                setProfileData(prev => ({
                    ...prev,
                    [section]: {
                        ...prev[section],
                        ...data
                    }
                }));
                toast.success('Profile updated locally (Demo Mode)');
            } else {
                toast.error(error.message || 'Failed to update profile');
            }

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
            <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
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
                    <button onClick={fetchProfile} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
            <Breadcrumb pageTitle="Company Administrator Profile" rightContent={null} />
            <ProfileHeader
                profileData={profileData.personal}
                onImageUpload={handleImageUpdate}
            />
            <div className="mt-6">
                <ProfileTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    profileData={profileData}
                    onUpdateProfile={handleUpdateProfile}
                    updating={updating}
                    allowedFields={ALLOWED_UPDATE_FIELDS}
                />
            </div>
        </div>
    );
}
