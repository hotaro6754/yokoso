"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileHeader from './components/ProfileHeader';
import ProfileTabs from './components/ProfileTabs';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Define allowed fields for update
const ALLOWED_UPDATE_FIELDS = [
  'phone', 'personalEmail', 'dateOfBirth', 'gender', 'maritalStatus',
  'bloodGroup', 'nationality', 'birthPlace',
  'permanentAddress', 'currentAddress', 'city', 'state', 'pincode', 'country',
  'emergencyContactName', 'emergencyContactRelation', 'emergencyContactPhone',
  'bankName', 'accountNumber', 'ifscCode', 'accountHolderName', 'branchName',
  'accountType', 'panNumber', 'aadhaarNumber'
];

export default function PayrollComplianceProfilePage() {
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
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@company.com',
          personalEmail: 'john.doe.personal@gmail.com',
          phone: '+91-98765-43210',
          dateOfBirth: '1990-05-15',
          gender: 'Male',
          maritalStatus: 'Married',
          bloodGroup: 'O+',
          nationality: 'Indian',
          birthPlace: 'Mumbai',
          height: '175',
          weight: '75',
          permanentAddress: '123, Main Street, Mumbai, Maharashtra',
          currentAddress: '456, Park Avenue, Mumbai, Maharashtra',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India',
          emergencyContactName: 'Jane Doe',
          emergencyContactRelation: 'Spouse',
          emergencyContactPhone: '+91 98765 43211'
        },
        employment: {
          employeeId: 'EMP001',
          designation: 'Payroll Manager',
          department: 'Payroll & Compliance',
          joiningDate: '2020-01-15',
          employmentType: 'Full Time',
          workLocation: 'Mumbai Office',
          manager: 'Sarah Smith',
          managerDesignation: 'HR Director'
        },
        bank: {
          bankName: 'State Bank of India',
          accountNumber: '123456789012',
          accountType: 'SAVINGS',
          ifscCode: 'SBIN0001234',
          accountHolderName: 'John Doe',
          branchName: 'Mumbai Main Branch',
          panNumber: 'ABCDE1234F',
          aadhaarNumber: '1234 5678 9012',
          pfNumber: 'PF123456789',
          uanNumber: 'UAN123456789',
          esiNumber: 'ESI123456789'
        },
        documents: [
          { id: 1, name: 'PAN Card', type: 'PAN', status: 'Verified', uploadedDate: '2020-01-20' },
          { id: 2, name: 'Aadhaar Card', type: 'AADHAAR', status: 'Verified', uploadedDate: '2020-01-20' },
          { id: 3, name: 'Bank Statement', type: 'BANK', status: 'Pending', uploadedDate: '2024-01-15' }
        ],
        settings: {
          emailNotifications: true,
          smsNotifications: false,
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
    return (
      <div className="bg-background min-h-screen p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-12 h-12 text-primary" />
          </motion.div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="bg-background min-h-screen p-4 sm:p-6">
        <div className="text-center py-10">
          <p className="text-muted-foreground">Failed to load profile data</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-md"
          >
            Retry
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen p-4 sm:p-6">
      <Breadcrumb
        pageTitle="My Profile"
        rightContent={null}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header */}
        <ProfileHeader profileData={profileData.personal} />

        {/* Profile Tabs */}
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
      </motion.div>
    </div>
  );
}
