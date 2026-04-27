"use client";

import { Calendar, Building, Users, Briefcase, MapPin, UserCheck } from 'lucide-react';
import DatePicker from '@/components/common/DatePicker';

export default function EmploymentInfo({ data, onUpdate, updating, allowedFields = [] }) {
  const safeData = data || {};
  
  // Employment fields are read-only for Department Head
  const employmentFields = [
    {
      icon: Users,
      iconColor: 'text-[hsl(var(--primary))]',
      bgColor: 'bg-[hsl(var(--primary))]/10 dark:bg-[hsl(var(--primary))]/20',
      label: 'Employee ID',
      value: safeData.employeeId,
      description: 'Unique employee identifier'
    },
    {
      icon: Building,
      iconColor: 'text-[hsl(var(--primary))]',
      bgColor: 'bg-[hsl(var(--primary))]/10 dark:bg-[hsl(var(--primary))]/20',
      label: 'Department',
      value: safeData.department,
      description: 'Department assigned'
    },
    {
      icon: Briefcase,
      iconColor: 'text-[hsl(var(--primary))]',
      bgColor: 'bg-[hsl(var(--primary))]/10 dark:bg-[hsl(var(--primary))]/20',
      label: 'Designation',
      value: safeData.designation,
      description: 'Job title'
    },
    {
      icon: Calendar,
      iconColor: 'text-[hsl(var(--primary))]',
      bgColor: 'bg-[hsl(var(--primary))]/10 dark:bg-[hsl(var(--primary))]/20',
      label: 'Employment Type',
      value: safeData.employmentType,
      description: 'Type of employment'
    },
    {
      icon: Calendar,
      iconColor: 'text-[hsl(var(--primary))]',
      bgColor: 'bg-[hsl(var(--primary))]/10 dark:bg-[hsl(var(--primary))]/20',
      label: 'Joining Date',
      value: safeData.joiningDate,
      description: 'Date of joining'
    },
    {
      icon: MapPin,
      iconColor: 'text-[hsl(var(--primary))]',
      bgColor: 'bg-[hsl(var(--primary))]/10 dark:bg-[hsl(var(--primary))]/20',
      label: 'Work Location',
      value: safeData.workLocation,
      description: 'Office location'
    },
    {
      icon: UserCheck,
      iconColor: 'text-[hsl(var(--primary))]',
      bgColor: 'bg-[hsl(var(--primary))]/10 dark:bg-[hsl(var(--primary))]/20',
      label: 'Reporting Manager',
      value: safeData.manager,
      description: 'Your reporting manager'
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Employment Information</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">View your employment details (Read-only)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employmentFields.map((field, index) => {
          const Icon = field.icon;
          return (
            <div
              key={index}
              className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 ${field.bgColor} rounded-xl`}>
                  <Icon className={`h-5 w-5 ${field.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    {field.label}
                  </p>
                  <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    {field.value || 'Not specified'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {field.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
