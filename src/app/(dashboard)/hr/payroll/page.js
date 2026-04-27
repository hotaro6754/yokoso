// src/app/(dashboard)/hr/payroll/tax-settings/page.js
"use client";
import { useState, useEffect } from 'react';
import { Save, Download, Upload } from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import TaxConfigForm from './components/TaxConfigForm';
import TaxBracketsTable from './components/TaxBracketsTable';
import TaxExemptionsList from './components/TaxExemptionsList';
import { payrollService } from '@/services/hr-services/payroll.service';

export default function TaxSettings() {
  const [activeTab, setActiveTab] = useState('configuration');
  const [taxConfig, setTaxConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaxSettings = async () => {
      try {
        setLoading(true);
        const response = await payrollService.getTaxSettings();
        // Handle different response structures: { success, data: {...} } or {...}
        let data = response.data || response;

        // If it's an array, take the first one (most common setting)
        if (Array.isArray(data)) {
          data = data[0];
        }

        if (data) {
          setTaxConfig(data);
          setError(null);
        } else {
          // Initialize with defaults if no settings exist
          setTaxConfig({
            taxYear: new Date().getFullYear().toString(),
            taxMethod: 'PROGRESSIVE',
            defaultAllowance: 0,
            socialSecurityRate: 0,
            medicareRate: 0,
            additionalMedicareRate: 0,
            additionalMedicareThreshold: 0,
            stateTaxRate: 0,
            unemploymentInsuranceRate: 0
          });
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching tax settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await payrollService.updateTaxSettings(taxConfig);
      alert('Tax settings saved successfully!');
    } catch (err) {
      alert('Failed to save tax settings: ' + err.message);
    }
  };

  const handleExportSettings = () => {
    // Implement export if needed
    alert('Tax settings exported successfully!');
  };

  const handleImportSettings = () => {
    // Implement import if needed
    alert('Tax settings imported successfully!');
  };

  const tabs = [
    { id: 'configuration', name: 'Configuration' },
    { id: 'brackets', name: 'Tax Brackets' },
    { id: 'exemptions', name: 'Exemptions' }
  ];

  if (loading && !taxConfig) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="animate-pulse flex flex-col gap-6">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-white dark:bg-gray-800 rounded-lg shadow mt-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      {/* Breadcrumb */}
      <Breadcrumb
        pageTitle="Tax Settings"
        rightContent={
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleImportSettings}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 transition dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 w-full sm:w-auto"
            >
              <Upload size={18} />
              Import
            </button>
            <button
              onClick={handleExportSettings}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition w-full sm:w-auto"
            >
              <Download size={18} />
              Export
            </button>
            <button
              onClick={handleSaveSettings}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition w-full sm:w-auto"
            >
              <Save size={18} />
              Save Settings
            </button>
          </div>
        }
      />

      {error && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          Error: {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-6">
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="-mb-px flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'configuration' && taxConfig && (
            <TaxConfigForm
              taxConfig={taxConfig}
              setTaxConfig={setTaxConfig}
            />
          )}

          {activeTab === 'brackets' && (
            <TaxBracketsTable taxSettingId={taxConfig?.id} />
          )}

          {activeTab === 'exemptions' && (
            <TaxExemptionsList taxSettingId={taxConfig?.id} />
          )}
        </div>
      </div>
    </div>
  );
}
