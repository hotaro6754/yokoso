"use client";

import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileHeader from './components/ProfileHeader';
import ProfileTabs from './components/ProfileTabs';
import { deptHeadProfileService } from '@/services/dept-head-services/profile.service';
import { toast } from 'react-hot-toast';

const ALLOWED_UPDATE_FIELDS = [
    'phone', 'personalEmail', 'dateOfBirth', 'gender', 'maritalStatus',
    'bloodGroup', 'nationality', 'birthPlace',
    'permanentAddress', 'currentAddress', 'city', 'state', 'pincode', 'country',
    'emergencyContactName', 'emergencyContactRelation', 'emergencyContactPhone',
    'bankName', 'accountNumber', 'ifscCode', 'accountHolderName', 'branchName',
    'accountType', 'panNumber', 'aadhaarNumber'
];

export default function DeptHeadProfilePage() {
    const [activeTab, setActiveTab] = useState('personal');
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await deptHeadProfileService.getProfile();
            if (response.success) {
                const transformedData = transformApiData(response.data);
                setProfileData(transformedData);
            } else {
                throw new Error(response.message || 'Failed to load profile');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to load profile data');
            setProfileData({
                personal: {
                    firstName: 'Department',
                    lastName: 'Head',
                    email: 'depthead@globalhr.com',
                    personalEmail: 'dept.head@example.com',
                    phone: '+91-98765-43210',
                    dateOfBirth: '1985-06-15',
                    gender: 'Male',
                    maritalStatus: 'Married',
                    bloodGroup: 'O+',
                    nationality: 'Indian',
                    birthPlace: 'Mumbai',
                    permanentAddress: '123 Main St, Mumbai',
                    currentAddress: '123 Main St, Mumbai',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    pincode: '400001',
                    country: 'India',
                    emergencyContactName: 'Jane Doe',
                    emergencyContactRelation: 'Spouse',
                    emergencyContactPhone: '+91 98765 43211'
                },
                employment: {
                    employeeId: 'DEPT001',
                    designation: 'Department Head',
                    department: 'Engineering',
                    joiningDate: '2020-01-15',
                    employmentType: 'FULL_TIME',
                    workLocation: 'Mumbai',
                    manager: 'CEO'
                },
                bank: {
                    bankName: 'HDFC Bank',
                    accountNumber: '1234567890',
                    ifscCode: 'HDFC0001234',
                    accountHolderName: 'Department Head',
                    branchName: 'Mumbai Main',
                    accountType: 'Savings',
                    panNumber: 'ABCDE1234F',
                    aadhaarNumber: '1234 5678 9012'
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const transformApiData = (data) => {
        const employee = data.employee || {};
        return {
            personal: {
                firstName: employee.firstName || '',
                lastName: employee.lastName || '',
                email: data.email || '',
                personalEmail: employee.personalEmail || '',
                phone: employee.phone || '',
                dateOfBirth: employee.dateOfBirth ? formatDateForInput(employee.dateOfBirth) : '',
                gender: employee.gender || '',
                maritalStatus: employee.maritalStatus || '',
                bloodGroup: employee.bloodGroup || '',
                nationality: employee.nationality || '',
                birthPlace: employee.birthPlace || '',
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
                designation: employee.designation || '',
                department: employee.department?.name || '',
                joiningDate: employee.joiningDate ? formatDateForInput(employee.joiningDate) : '',
                employmentType: employee.employmentType || '',
                workLocation: employee.workLocation || '',
                manager: employee.reportingManager?.firstName + ' ' + employee.reportingManager?.lastName || 'Not assigned'
            },
            bank: {
                bankName: employee.bankName || '',
                accountNumber: employee.accountNumber || '',
                ifscCode: employee.ifscCode || '',
                accountHolderName: employee.accountHolderName || '',
                branchName: employee.branchName || '',
                accountType: employee.accountType || '',
                panNumber: employee.panNumber || '',
                aadhaarNumber: employee.aadhaarNumber || ''
            }
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
            let updatePayload = { employee: {} };
            const mappedData = { ...data };

            if (section === 'personal') {
                Object.keys(mappedData).forEach(key => {
                    if (ALLOWED_UPDATE_FIELDS.includes(key) && mappedData[key] !== undefined) {
                        updatePayload.employee[key] = mappedData[key];
                    }
                });
                if (mappedData.dateOfBirth) {
                    updatePayload.employee.dateOfBirth = formatDateForAPI(mappedData.dateOfBirth);
                }
            } else if (section === 'bank') {
                Object.keys(mappedData).forEach(key => {
                    if (ALLOWED_UPDATE_FIELDS.includes(key) && mappedData[key] !== undefined) {
                        updatePayload.employee[key] = mappedData[key];
                    }
                });
            }

            if (Object.keys(updatePayload.employee).length === 0) {
                toast.error('No valid fields to update');
                return;
            }

            const response = await deptHeadProfileService.updateProfile(updatePayload);
            if (response.success) {
                toast.success('Profile updated successfully');
                fetchProfile();
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))] mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <Breadcrumb
                    items={[
                        { label: "Department Head", href: "/dept-head" },
                        { label: "My Profile", href: "/dept-head/profile" },
                    ]}
                />

                <div className="mt-6">
                    <ProfileHeader
                        profileData={profileData}
                    />
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
        </div>
    );
}
