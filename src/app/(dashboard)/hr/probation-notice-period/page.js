'use client';

import { useState } from 'react';
import { Clock, Users, Calendar } from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProbationTable from './components/ProbationTable';
import NoticePeriodTable from './components/NoticePeriodTable';

export default function ProbationNoticePeriodPage() {
  const [activeTab, setActiveTab] = useState('probation');

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-3 sm:p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-sm">
            <Clock className="w-6 h-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Probation / Notice Period Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage employee probation periods and notice periods
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('probation')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'probation'
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Probation
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notice')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'notice'
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Notice Period
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 overflow-visible p-3 sm:p-6">
        {activeTab === 'probation' ? <ProbationTable /> : <NoticePeriodTable />}
      </div>
    </div>
  );
}
