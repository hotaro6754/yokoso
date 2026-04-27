// src/app/(dashboard)/hr/payroll/process/components/PayrollProcessForm.js
"use client";
import { useState, useMemo } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { payrollService } from '@/services/hr-services/payroll.service';
import CustomDropdown from '../../../leave/components/CustomDropdown';

export default function PayrollProcessForm({ payrollData, onChange, onNext }) {
  const [formData, setFormData] = useState(payrollData);

  const periods = useMemo(() => {
    const options = [];
    const today = new Date();

    // Generate options for last 6 months and next 3 months
    for (let i = -6; i <= 3; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const value = `${year}-${month.toString().padStart(2, '0')}`;
      const label = `${payrollService.getMonthName(month)} ${year}`;
      options.push({ value, label });
    }
    return options;
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If payrollPeriod changes, update the period label used in summary
    let updatedData = { ...formData, [name]: value };
    if (name === 'payrollPeriod') {
      const option = periods.find(p => p.value === value);
      updatedData.period = option ? option.label : '';
    }
    setFormData(updatedData);
    onChange(updatedData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.payrollPeriod && formData.paymentDate) {
      onNext();
    } else {
      alert('Please fill in all required fields');
    }
  };

  return (
    <div className="text-left">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 text-center">Select Payroll Period</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payroll Period *
            </label>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <CustomDropdown
                value={formData.payrollPeriod || ''}
                onChange={(value) => {
                  const option = periods.find(p => p.value === value);
                  const updatedData = { ...formData, payrollPeriod: value, period: option ? option.label : '' };
                  setFormData(updatedData);
                  onChange(updatedData);
                }}
                options={periods.map(p => ({ value: p.value, label: p.label }))}
                placeholder="Select Period"
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Date *
            </label>
            <div className="relative">
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className="w-full pl-3 pr-10 py-2 text-base border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Calendar className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 text-base border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
            placeholder="Add any notes about this payroll run..."
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-white hover:bg-brand-600 transition shadow-sm hover:shadow-md font-semibold w-full sm:w-auto"
          >
            Next: Select Employees
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
