// src/app/(dashboard)/super-admin/profile/components/ProfileHeader.js
"use client";

import { useRef } from 'react';
import { Camera, Mail, Phone, MapPin } from 'lucide-react';
import { getProfileImageUrl } from '@/utils/fileUrl';

export default function ProfileHeader({ profileData, onImageUpload }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow dark:bg-gray-800 overflow-hidden">
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800"></div>

        {/* Profile Content */}
        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img
                  src={getProfileImageUrl(profileData.profileImage, "/images/users/user-01.png")}
                  alt={`${profileData.firstName} ${profileData.lastName}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition cursor-pointer"
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            {/* Profile Info */}
            <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{profileData.email}</p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start mt-3 gap-4">
                {profileData.phone && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Phone size={16} className="mr-1" />
                    {profileData.phone}
                  </div>
                )}
                {profileData.address && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <MapPin size={16} className="mr-1" />
                    {profileData.address}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}