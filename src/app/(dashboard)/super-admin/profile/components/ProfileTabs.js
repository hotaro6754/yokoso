// src/app/(dashboard)/hr/profile/components/ProfileTabs.js
"use client";

import Link from 'next/link';
import { User, Briefcase, Banknote, FileText, Settings as SettingsIcon } from 'lucide-react';
import PersonalInfo from './PersonalInfo';

export default function ProfileTabs({ activeTab, setActiveTab, profileData, onUpdateProfile, updating }) {
  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: User },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfo
            data={profileData.personal}
            onUpdate={(data) => onUpdateProfile('personal', data)}
            updating={updating}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow dark:bg-gray-800">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center whitespace-nowrap ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                <Icon size={18} className="mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}