// src/app/(dashboard)/hr/payroll/tax-settings/components/TaxBracketForm.js
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Percent } from 'lucide-react';
import { payrollService } from '@/services/hr-services/payroll.service';

export default function TaxBracketForm({ bracket = null, isEdit = false }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taxSettingId, setTaxSettingId] = useState(null);
  const [formData, setFormData] = useState({
    minIncome: 0,
    maxIncome: '',
    rate: 0,
    regime: 'NEW',
    description: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await payrollService.getTaxSettings();
        const data = response.data || response;
        setTaxSettingId(data?.id);
      } catch (err) {
        console.error('Error fetching tax settings:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (bracket) {
      setFormData({
        minIncome: bracket.minIncome || 0,
        maxIncome: bracket.maxIncome || '',
        rate: bracket.rate || 0,
        regime: bracket.regime || 'NEW',
        description: bracket.description || '',
        status: bracket.status || 'ACTIVE',
      });
    }
  }, [bracket]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'minIncome' || name === 'maxIncome' || name === 'rate'
        ? (value === '' ? '' : parseFloat(value))
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taxSettingId) {
      alert('Tax settings not loaded. Please try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        ...formData,
        taxSettingId,
        maxIncome: formData.maxIncome === '' ? null : formData.maxIncome
      };

      if (isEdit) {
        await payrollService.updateTaxBracket(bracket.id, data);
      } else {
        await payrollService.createTaxBracket(data);
      }

      router.push('/hr/payroll/tax-settings');
      router.refresh();
    } catch (error) {
      alert('Error saving tax bracket: ' + error.message);
      console.error('Error saving tax bracket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 text-left">
      {/* Header with title and back button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push('/hr/payroll/tax-settings')}
          className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
            <Percent className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Tax Bracket' : 'Add New Tax Bracket'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEdit ? 'Update tax bracket information' : 'Create a new tax bracket for payroll calculations'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Tax Regime */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tax Regime *
              </label>
              <select
                name="regime"
                value={formData.regime}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                required
              >
                <option value="NEW">New Regime</option>
                <option value="OLD">Old Regime</option>
              </select>
            </div>

            {/* Minimum Income */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Income *
              </label>
              <input
                type="number"
                name="minIncome"
                value={formData.minIncome}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors"
                placeholder="Enter minimum income"
                required
              />
            </div>

            {/* Maximum Income */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Income
              </label>
              <input
                type="number"
                name="maxIncome"
                value={formData.maxIncome}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors"
                placeholder="Leave empty for no limit"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to indicate no upper income limit
              </p>
            </div>

            {/* Tax Rate */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tax Rate (%) *
              </label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700  dark:text-white dark:placeholder-gray-400 transition-colors"
                placeholder="Enter tax rate percentage"
                required
              />
            </div>

            {/* Description */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-colors"
                placeholder="e.g., First bracket, Second bracket, etc."
                required
              />
            </div>

            {/* Status */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status *
              </label>
              <div className="relative">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none transition-colors"
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">About Tax Brackets</h3>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Tax brackets define the income ranges and corresponding tax rates. The minimum income is required,
              while maximum income can be left empty to indicate no upper limit. Tax rates should be expressed as
              percentages (e.g., 10 for 10%). Select the appropriate Tax Regime (Old vs New) for this bracket.
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => router.push('/hr/payroll/tax-settings')}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 text-center"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Save size={18} />
              {isSubmitting
                ? (isEdit ? 'Updating...' : 'Creating...')
                : (isEdit ? 'Update Tax Bracket' : 'Create Tax Bracket')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
