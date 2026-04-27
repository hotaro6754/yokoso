// src/app/(dashboard)/hr/profile/components/ProfileHeader.js
"use client";

import { useRef, useState, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { getProfileImageUrl } from '@/utils/fileUrl';

export default function ProfileHeader({ profileData, onImageUpload, uploadingImage }) {
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState("/images/users/user-01.png");

  useEffect(() => {
    setImageSrc(getProfileImageUrl(profileData.profileImage));
  }, [profileData.profileImage]);

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

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
        <div className="h-32 bg-gradient-to-r from-brand-500 to-brand-600 dark:from-brand-600 dark:to-brand-700"></div>
        {/* Profile Content */}
        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
                <img
                  src={imageSrc}
                  onError={() => setImageSrc("/images/users/user-01.png")}
                  alt={`${profileData.firstName} ${profileData.lastName}`}
                  className="w-full h-full object-cover"
                />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              <button
                onClick={handleCameraClick}
                disabled={uploadingImage}
                className="absolute bottom-2 right-2 p-2 bg-brand-500 text-white rounded-full hover:bg-brand-600 transition shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Camera size={16} />
              </button>
            </div>

            <div className="mt-12 sm:mt-10 sm:ml-6 text-center sm:text-left pt-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-[#E0E2FE]">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <p className="mt-2 text-sm font-medium text-gray-900 dark:text-[#BBBDEC]">
                {profileData.email}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start mt-3 gap-4">
                {profileData.phone && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-[#BBBDEC]">
                    <Phone size={16} className="mr-1" />
                    {profileData.phone}
                  </div>
                )}
                {profileData.address && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-[#BBBDEC]">
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
