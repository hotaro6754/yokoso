'use client';

import { useEffect, useState, useRef } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import { apiClient } from '@/lib/api';
import { UserCircle, Phone, Building, Camera } from 'lucide-react';
import DatePicker from '@/components/common/DatePicker';
import { getProfileImageUrl } from '@/utils/fileUrl';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const DEFAULT_PROFILE_DATA = {
  personal: {
    firstName: '',
    lastName: '',
    email: '',
    personalEmail: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    bloodGroup: '',
    nationality: '',

    birthPlace: '',
    permanentAddress: '',
    currentAddress: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    profileImage: ''
  },
  employment: {
    employeeId: '',
    designation: '',
    department: '',
    joiningDate: '',
    employmentType: '',
    workLocation: ''
  },
  bank: {
    bankName: '',
    accountNumber: '',
    accountType: '',
    ifscCode: '',
    accountHolderName: '',
    branchName: '',
    panNumber: '',
    aadhaarNumber: ''
  }
};

const toDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const coalesceEmptyStrings = (section = {}) => (
  Object.fromEntries(
    Object.entries(section).map(([key, value]) => [key, value ?? ''])
  )
);

const normalizeProfile = (payload) => ({
  personal: {
    ...DEFAULT_PROFILE_DATA.personal,
    ...coalesceEmptyStrings(payload?.personal),
    dateOfBirth: toDateInput(payload?.personal?.dateOfBirth),
    profileImage: payload?.personal?.profileImage || ''
  },
  employment: {
    ...DEFAULT_PROFILE_DATA.employment,
    ...coalesceEmptyStrings(payload?.employment),
    joiningDate: payload?.employment?.joiningDate
      ? new Date(payload.employment.joiningDate).toISOString().split('T')[0]
      : ''
  },
  bank: {
    ...DEFAULT_PROFILE_DATA.bank,
    ...coalesceEmptyStrings(payload?.bank)
  }
});

export default function MasterAdminProfilePage() {
  const { user, refreshUser, updateLocalUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState(DEFAULT_PROFILE_DATA);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/master-admin/profile');
        const normalized = normalizeProfile(response.data);

        // Fallback: Check direct localStorage for image if API missing it
        // This is necessary because AuthContext ('user') might be refreshed from server (stale)
        let fallbackImage = user?.profileImage;
        if (typeof window !== 'undefined') {
          try {
            const localUser = JSON.parse(localStorage.getItem('hrms_user'));
            if (localUser?.profileImage) fallbackImage = localUser.profileImage;
            else if (localUser?.employee?.profileImage) fallbackImage = localUser.employee.profileImage;
          } catch (e) {
            console.error("Error reading local storage for image fallback", e);
          }
        }

        if (!normalized.personal.profileImage && fallbackImage) {
          console.log("Restoring profile image from local storage");
          normalized.personal.profileImage = fallbackImage;
        }

        setProfileData(normalized);
        setError('');
      } catch (err) {
        console.error("Profile load failed", err);
        // Fallback to Auth Context user if API fails (e.g. bypass mode)
        if (user) {
          setProfileData(prev => normalizeProfile({
            personal: {
              ...prev.personal,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              profileImage: user.profileImage || user.employee?.profileImage
            },
            employment: prev.employment,
            bank: prev.bank
          }));
        } else {
          setError(err?.response?.data?.message || 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleUpdate = async (tab, formData) => {
    try {
      setUpdating(true);
      const response = await apiClient.put('/master-admin/profile', { [tab]: formData });

      // Update global context locally to reflect changes immediately (Sidebar, Header, etc.)
      if (tab === 'personal') {
        const updates = {};
        if (formData.profileImage) updates.profileImage = formData.profileImage;
        if (formData.firstName) updates.firstName = formData.firstName;
        if (formData.lastName) updates.lastName = formData.lastName;

        // Also update nested employee object for comprehensive coverage
        if (user?.employee) {
          updates.employee = { ...user.employee, ...updates };
        }

        updateLocalUser(updates);

        // Patch response data locally
        if (!response.data) response.data = {};
        if (!response.data.personal) response.data.personal = {};
        if (formData.profileImage) response.data.personal.profileImage = formData.profileImage;
      }

      setProfileData(normalizeProfile(response.data));
      setError('');
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error(err);

      // Fallback: Local Update for Demo/Bypass
      if (user) {
        const newProfile = { ...profileData };
        newProfile[tab] = { ...newProfile[tab], ...formData };
        setProfileData(newProfile);

        // Helper to update local storage for persistence in demo mode
        const savedUser = localStorage.getItem('hrms_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (tab === 'personal') {
            if (formData.firstName) parsed.firstName = formData.firstName;
            if (formData.lastName) parsed.lastName = formData.lastName;
            if (formData.profileImage) {
              parsed.profileImage = formData.profileImage;
              if (parsed.employee) parsed.employee.profileImage = formData.profileImage;
            }
            localStorage.setItem('hrms_user', JSON.stringify(parsed));
            // Trigger a refresh if possible
            window.location.reload();
          }
        }
        toast.success('Profile updated locally (Demo Mode)');
        setError('');
      } else {
        setError(err?.response?.data?.message || 'Failed to update profile');
        toast.error('Failed to update profile');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image size should be less than 5MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      // Update profile with new image immediately
      handleUpdate('personal', {
        ...profileData.personal,
        profileImage: base64String
      });
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: UserCircle },
    { id: 'employment', label: 'Employment Details', icon: Building },
    { id: 'bank', label: 'Bank Details', icon: Building },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <Breadcrumb
          items={[
            { label: 'Master Admin', href: '/master-admin/dashboard' },
            { label: 'Profile', href: '/master-admin/profile' }
          ]}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
                {profileData.personal.profileImage ? (
                  <img
                    src={getProfileImageUrl(profileData.personal.profileImage)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {profileData.personal.firstName ? profileData.personal.firstName.charAt(0).toUpperCase() : ''}
                    {profileData.personal.lastName ? profileData.personal.lastName.charAt(0).toUpperCase() : ''}
                  </>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={updating}
                className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer text-gray-600 dark:text-gray-300"
                type="button"
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profileData.personal.firstName} {profileData.personal.lastName}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{profileData.personal.email}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone size={16} />
                  {profileData.personal.phone || 'N/A'}
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Building size={16} />
                  Master Admin
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex space-x-1 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loading && (
              <div className="text-sm text-gray-500 dark:text-gray-400">Loading profile...</div>
            )}
            {activeTab === 'personal' && (
              <PersonalInfoTab
                data={profileData.personal}
                onUpdate={(data) => handleUpdate('personal', data)}
                updating={updating}
              />
            )}
            {activeTab === 'employment' && (
              <EmploymentTab
                data={profileData.employment}
                onUpdate={(data) => handleUpdate('employment', data)}
                updating={updating}
              />
            )}
            {activeTab === 'bank' && (
              <BankTab
                data={profileData.bank}
                onUpdate={(data) => handleUpdate('bank', data)}
                updating={updating}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Personal Info Tab Component
const PersonalInfoTab = ({ data, onUpdate, updating }) => {
  const [formData, setFormData] = useState(data);
  const [showIdentityWarning, setShowIdentityWarning] = useState(false);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {showIdentityWarning && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Editing first name, last name, or email affects login and audit history. Please verify before saving.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => {
              if (!showIdentityWarning) setShowIdentityWarning(true);
              setFormData({ ...formData, firstName: e.target.value });
            }}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => {
              if (!showIdentityWarning) setShowIdentityWarning(true);
              setFormData({ ...formData, lastName: e.target.value });
            }}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              if (!showIdentityWarning) setShowIdentityWarning(true);
              setFormData({ ...formData, email: e.target.value });
            }}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Personal Email</label>
          <input
            type="email"
            value={formData.personalEmail}
            onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
          <DatePicker
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            placeholder="Select date"
            dateFormat="d-m-Y"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={updating}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {updating ? 'Updating...' : 'Update Information'}
        </button>
      </div>
    </form>
  );
};

// Employment Tab Component
const EmploymentTab = ({ data, onUpdate, updating }) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee ID</label>
          <input
            type="text"
            value={formData.employeeId}
            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Designation</label>
          <input
            type="text"
            value={formData.designation}
            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Joining Date</label>
          <DatePicker
            name="joiningDate"
            value={formData.joiningDate}
            onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
            placeholder="Select date"
            dateFormat="d-m-Y"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employment Type</label>
          <input
            type="text"
            value={formData.employmentType}
            onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Work Location</label>
          <input
            type="text"
            value={formData.workLocation}
            onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={updating}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {updating ? 'Updating...' : 'Update Employment'}
        </button>
      </div>
    </form>
  );
};

// Bank Tab Component
const BankTab = ({ data, onUpdate, updating }) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bank Name</label>
          <input
            type="text"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Number</label>
          <input
            type="text"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IFSC Code</label>
          <input
            type="text"
            value={formData.ifscCode}
            onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Holder Name</label>
          <input
            type="text"
            value={formData.accountHolderName}
            onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch Name</label>
          <input
            type="text"
            value={formData.branchName}
            onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Type</label>
          <select
            value={formData.accountType}
            onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="SAVINGS">Savings</option>
            <option value="CURRENT">Current</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={updating}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {updating ? 'Updating...' : 'Update Bank Details'}
        </button>
      </div>
    </form>
  );
};
