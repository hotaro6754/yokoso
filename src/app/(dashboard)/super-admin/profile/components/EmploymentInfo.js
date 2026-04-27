// src/app/(dashboard)/hr/profile/components/EmploymentInfo.js
"use client";

import { Calendar, Building, Users, Briefcase, MapPin, UserCheck, Lock } from 'lucide-react';

export default function EmploymentInfo({ data }) {
  // All employment fields are read-only
  const employmentFields = [
    { 
      icon: Users, 
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      label: 'Employee ID', 
      value: data.employeeId,
      description: 'Unique employee identifier'
    },
    { 
      icon: Building, 
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      label: 'Department', 
      value: data.department,
      description: 'Department assigned'
    },
    { 
      icon: Briefcase, 
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      label: 'Designation', 
      value: data.designation,
      description: 'Job title'
    },
    { 
      icon: Calendar, 
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      label: 'Employment Type', 
      value: data.employmentType,
      description: 'Type of employment'
    },
    { 
      icon: Calendar, 
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      label: 'Joining Date', 
      value: data.joiningDate,
      description: 'Date of joining'
    },
    { 
      icon: MapPin, 
      iconColor: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-100 dark:bg-pink-900/30',
      label: 'Work Location', 
      value: data.workLocation,
      description: 'Office location'
    },
    { 
      icon: UserCheck, 
      iconColor: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      label: 'Manager', 
      value: data.manager,
      description: 'Reporting manager'
    },
    { 
      icon: Briefcase, 
      iconColor: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
      label: 'Manager Designation', 
      value: data.managerDesignation,
      description: 'Manager\'s designation'
    }
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Employment Information</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
          <Lock size={14} className="text-gray-500 dark:text-gray-400" />
          <span className="text-xs text-gray-600 dark:text-gray-400">View Only</span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-2">
          <Lock size={16} className="text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Employment information is managed by HR. Contact your HR department for any changes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employmentFields.map((field, index) => {
          const Icon = field.icon;
          return (
            <div 
              key={index} 
              className={`bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${
                field.label === 'Manager' || field.label === 'Manager Designation' ? 'md:col-span-2' : ''
              }`}
            >
              <div className="flex items-center mb-3">
                <div className={`p-2 ${field.bgColor} rounded-lg mr-3`}>
                  <Icon className={field.iconColor} size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{field.label}</p>
                  <p className="font-semibold text-gray-800 dark:text-white break-words">
                    {field.value || 'Not specified'}
                  </p>
                  {field.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {field.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}