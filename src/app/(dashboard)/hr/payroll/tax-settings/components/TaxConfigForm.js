// src/app/(dashboard)/hr/payroll/tax-settings/components/TaxConfigForm.js
"use client";
import { Info } from 'lucide-react';

const TaxConfigForm = ({ taxConfig, setTaxConfig }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaxConfig(prev => ({
      ...prev,
      [name]: name.endsWith('Rate') || name.endsWith('Threshold') || name.endsWith('Allowance') ? parseFloat(value) : value
    }));
  };

  return (
    <div className="text-left">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Tax Configuration</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tax Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tax Year
          </label>
          <select
            name="taxYear"
            value={taxConfig.taxYear}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-base border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>

        {/* Tax Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tax Calculation Method
          </label>
          <select
            name="taxMethod"
            value={taxConfig.taxMethod}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-base border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="PROGRESSIVE">Progressive</option>
            <option value="FLAT">Flat Rate</option>
            <option value="MARGINAL">Marginal</option>
          </select>
        </div>

        {/* Default Allowance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Allowance (₹)
          </label>
          <input
            type="number"
            name="defaultAllowance"
            value={taxConfig.defaultAllowance}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-base border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Social Security Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Social Security Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            name="socialSecurityRate"
            value={taxConfig.socialSecurityRate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-base border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Medicare Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Medicare Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            name="medicareRate"
            value={taxConfig.medicareRate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-base border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Additional Medicare Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Medicare Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            name="additionalMedicareRate"
            value={taxConfig.additionalMedicareRate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-base border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Additional Medicare Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Medicare Threshold (₹)
          </label>
          <input
            type="number"
            name="additionalMedicareThreshold"
            value={taxConfig.additionalMedicareThreshold}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-base border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* State Tax Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            State Tax Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            name="stateTaxRate"
            value={taxConfig.stateTaxRate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-base border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Unemployment Insurance Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Unemployment Insurance Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            name="unemploymentInsuranceRate"
            value={taxConfig.unemploymentInsuranceRate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-base border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="mt-6 ml-0 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300">
            These settings will affect all payroll calculations. Make sure to verify the current tax rates
            with your local tax authority before making changes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaxConfigForm;