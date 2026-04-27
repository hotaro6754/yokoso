"use client";

import { User, Briefcase, Banknote } from 'lucide-react';
import PersonalInfo from './PersonalInfo';
import EmploymentInfo from './EmploymentInfo';
import BankInfo from './BankInfo';

export default function ProfileTabs({ activeTab, setActiveTab, profileData, onUpdateProfile, updating, allowedFields }) {
  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'employment', name: 'Employment', icon: Briefcase },
    { id: 'bank', name: 'Bank Details', icon: Banknote },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfo
            data={profileData?.personal}
            onUpdate={(data) => onUpdateProfile('personal', data)}
            updating={updating}
            allowedFields={allowedFields}
          />
        );
      case 'employment':
        return (
          <EmploymentInfo
            data={profileData?.employment}
            onUpdate={(data) => onUpdateProfile('employment', data)}
            updating={updating}
            allowedFields={allowedFields}
          />
        );
      case 'bank':
        return (
          <BankInfo
            data={profileData?.bank}
            onUpdate={(data) => onUpdateProfile('bank', data)}
            updating={updating}
            allowedFields={allowedFields}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))] bg-white dark:bg-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon size={18} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {renderTabContent()}
      </div>
    </div>
  );
}
