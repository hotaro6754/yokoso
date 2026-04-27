"use client";

import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileHeader from './components/ProfileHeader';
import ProfileTabs from './components/ProfileTabs';
import { toast } from 'react-hot-toast';
import HRMSLoader from '@/components/common/HRMSLoader';

// Define allowed fields for update
const ALLOWED_UPDATE_FIELDS = [
  'phone', 'personalEmail', 'dateOfBirth', 'gender', 'maritalStatus',
  'bloodGroup', 'nationality', 'birthPlace',
  'permanentAddress', 'currentAddress', 'city', 'state', 'pincode', 'country',
  'emergencyContactName', 'emergencyContactRelation', 'emergencyContactPhone',
  'bankName', 'accountNumber', 'ifscCode', 'accountHolderName', 'branchName',
  'accountType', 'panNumber', 'aadhaarNumber'
];

export default function FinanceRoleProfilePage() {
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock profile data
      const mockProfileData = {
        personal: {
          firstName: 'Priya',
          lastName: 'Sharma',
          email: 'priya.sharma@company.com',
          personalEmail: 'priya.sharma.personal@gmail.com',
          phone: '+91-98765-43210',
          dateOfBirth: '1988-03-20',
          gender: 'Female',
          maritalStatus: 'Married',
          bloodGroup: 'B+',
          nationality: 'Indian',
          birthPlace: 'Delhi',
          height: '162',
          weight: '58',
          permanentAddress: '456, Finance Street, Delhi, NCR',
          currentAddress: '789, Corporate Avenue, Delhi, NCR',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001',
          country: 'India',
          emergencyContactName: 'Rajesh Sharma',
          emergencyContactRelation: 'Spouse',
          emergencyContactPhone: '+91 98765 43211'
        },
        employment: {
          employeeId: 'FIN001',
          designation: 'Finance Manager',
          department: 'Finance & Accounts',
          joiningDate: '2019-06-10',
          employmentType: 'Full Time',
          workLocation: 'Delhi Office',
          manager: 'CEO',
          managerDesignation: 'Chief Executive Officer'
        },
        bank: {
          bankName: 'HDFC Bank',
          accountNumber: '123456789012',
          accountType: 'SAVINGS',
          ifscCode: 'HDFC0001234',
          accountHolderName: 'Priya Sharma',
          branchName: 'Delhi Main Branch',
          panNumber: 'ABCDE1234F',
          aadhaarNumber: '1234 5678 9012',
          pfNumber: 'PF123456789',
          uanNumber: 'UAN123456789',
          esiNumber: 'ESI123456789'
        },
        documents: [
          { id: 1, name: 'PAN Card', type: 'PAN', status: 'Verified', uploadedDate: '2019-06-15' },
          { id: 2, name: 'Aadhaar Card', type: 'AADHAAR', status: 'Verified', uploadedDate: '2019-06-15' },
          { id: 3, name: 'Bank Statement', type: 'BANK', status: 'Verified', uploadedDate: '2019-06-20' }
        ],
        settings: {
          emailNotifications: true,
          smsNotifications: true,
          twoFactorAuth: true,
          language: 'English',
          timezone: 'Asia/Kolkata'
        }
      };

      setProfileData(mockProfileData);
    } catch (error) {
      toast.error(error.message || 'Failed to load profile data');
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (section, data) => {
    try {
      setUpdating(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      setProfileData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          ...data
        }
      }));

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update error details:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <HRMSLoader text="Loading profile..." variant="fullscreen" size="md" />;
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-10">
            <p className="text-gray-600 dark:text-gray-400">Failed to load profile data</p>
            <button
              onClick={fetchProfile}
              className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Finance", href: "/finance-role" },
    { label: "Profile", href: "/finance-role/profile" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Profile Header */}
        <ProfileHeader profileData={profileData.personal} />

        {/* Profile Tabs */}
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
