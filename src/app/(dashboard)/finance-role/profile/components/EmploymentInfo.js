"use client";

import { motion } from 'framer-motion';
import { Calendar, Building, Users, Briefcase, MapPin, UserCheck, Lock } from 'lucide-react';

export default function EmploymentInfo({ data }) {
  const employmentFields = [
    { 
      icon: Users, 
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      label: 'Employee ID', 
      value: data.employeeId,
      description: 'Unique employee identifier'
    },
    { 
      icon: Building, 
      iconColor: 'text-success',
      bgColor: 'bg-success/10',
      label: 'Department', 
      value: data.department,
      description: 'Department assigned'
    },
    { 
      icon: Briefcase, 
      iconColor: 'text-accent',
      bgColor: 'bg-accent/10',
      label: 'Designation', 
      value: data.designation,
      description: 'Job title'
    },
    { 
      icon: Calendar, 
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10',
      label: 'Employment Type', 
      value: data.employmentType,
      description: 'Type of employment'
    },
    { 
      icon: Calendar, 
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      label: 'Joining Date', 
      value: data.joiningDate,
      description: 'Date of joining'
    },
    { 
      icon: MapPin, 
      iconColor: 'text-accent',
      bgColor: 'bg-accent/10',
      label: 'Work Location', 
      value: data.workLocation,
      description: 'Office location'
    },
    { 
      icon: UserCheck, 
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10',
      label: 'Manager', 
      value: data.manager,
      description: 'Reporting manager'
    },
    { 
      icon: Briefcase, 
      iconColor: 'text-muted-foreground',
      bgColor: 'bg-muted',
      label: 'Manager Designation', 
      value: data.managerDesignation,
      description: 'Manager\'s designation'
    }
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-foreground">Employment Information</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full border border-border">
          <Lock size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">View Only</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 p-4 bg-muted/50 rounded-lg border border-border"
      >
        <div className="flex items-start gap-2">
          <Lock size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground">
            Employment information is managed by HR. Contact your HR department for any changes.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employmentFields.map((field, index) => {
          const Icon = field.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`glass-card p-4 rounded-xl border border-border shadow-sm ${
                field.label === 'Manager' || field.label === 'Manager Designation' ? 'md:col-span-2' : ''
              }`}
            >
              <div className="flex items-center mb-3">
                <div className={`p-2 ${field.bgColor} rounded-lg mr-3`}>
                  <Icon className={field.iconColor} size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{field.label}</p>
                  <p className="font-semibold text-foreground break-words mt-1">
                    {field.value || 'Not specified'}
                  </p>
                  {field.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {field.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
