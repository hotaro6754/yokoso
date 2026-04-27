"use client";

import { Camera, Phone, Mail, MapPin, User } from 'lucide-react';

export default function ProfileHeader({ profileData }) {
  const personalData = profileData?.personal || {};
  const employmentData = profileData?.employment || {};
  
  const initials = personalData.firstName && personalData.lastName
    ? `${personalData.firstName.charAt(0)}${personalData.lastName.charAt(0)}`
    : 'DH';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
      {/* Cover Photo */}
      <div className="h-40 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/90 to-[hsl(var(--accent))]/90"></div>
      </div>

      {/* Profile Content */}
      <div className="px-6 pb-6 -mt-20">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Profile Photo */}
          <div className="relative">
            <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 bg-[hsl(var(--primary))] shadow-xl flex items-center justify-center">
              <span className="text-4xl font-bold text-white">
                {initials}
              </span>
            </div>
            <button className="absolute bottom-2 right-2 p-2.5 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white rounded-xl shadow-lg transition-all">
              <Camera size={18} />
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center sm:text-left mt-4 sm:mt-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {personalData.firstName || 'Department'} {personalData.lastName || 'Head'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">
              {employmentData.designation || 'Department Head'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              {employmentData.department || 'Department'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
              {personalData.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail size={16} className="text-[hsl(var(--primary))]" />
                  <span>{personalData.email}</span>
                </div>
              )}
              {personalData.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone size={16} className="text-[hsl(var(--primary))]" />
                  <span>{personalData.phone}</span>
                </div>
              )}
              {employmentData.workLocation && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin size={16} className="text-[hsl(var(--primary))]" />
                  <span>{employmentData.workLocation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
