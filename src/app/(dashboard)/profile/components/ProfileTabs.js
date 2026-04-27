// src/app/(dashboard)/hr/profile/components/ProfileTabs.js
"use client";

import { useState } from 'react';
import { User, Briefcase, Banknote, FileText } from 'lucide-react';
import PersonalInfo from './PersonalInfo';
import EmploymentInfo from './EmploymentInfo';
import BankInfo from './BankInfo';
import Documents from './Documents';

export default function ProfileTabs({ activeTab, setActiveTab, profileData, onUpdateProfile, updating }) {
  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'employment', name: 'Employment', icon: Briefcase },
    { id: 'bank', name: 'Bank Details', icon: Banknote },
    { id: 'documents', name: 'Documents', icon: FileText },
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
      case 'employment':
        return (
          <EmploymentInfo
            data={profileData.employment}
          />
        );
      case 'bank':
        return (
          <BankInfo
            data={profileData.bank}
            onUpdate={(data) => onUpdateProfile('bank', data)}
            updating={updating}
          />
        );
      case 'documents':
        return (
          <Documents
            data={profileData.documents}
            onUpdate={(data) => onUpdateProfile('documents', data)}
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
                    ? 'border-brand-500 text-brand-700 dark:border-[#E0E2FE] dark:text-[#E0E2FE] bg-brand-50/60 dark:bg-[#E0E2FE]/10'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-[#BBBDEC] dark:hover:text-[#E0E2FE]'
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
