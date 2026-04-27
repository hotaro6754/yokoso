"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Banknote, FileText, Settings as SettingsIcon } from 'lucide-react';
import PersonalInfo from './PersonalInfo';
import EmploymentInfo from './EmploymentInfo';
import BankInfo from './BankInfo';
import Documents from './Documents';
import Settings from './Settings';

export default function ProfileTabs({ activeTab, setActiveTab, profileData, onUpdateProfile, updating }) {
  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'employment', name: 'Employment', icon: Briefcase },
    { id: 'bank', name: 'Bank Details', icon: Banknote },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
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
      case 'settings':
        return (
          <Settings
            data={profileData.settings}
            onUpdate={(data) => onUpdateProfile('settings', data)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl shadow-lg border border-border"
    >
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="-mb-px flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`py-4 px-6 text-sm font-medium border-b-2 flex items-center whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/50'
                }`}
              >
                <Icon size={18} className="mr-2" />
                {tab.name}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
