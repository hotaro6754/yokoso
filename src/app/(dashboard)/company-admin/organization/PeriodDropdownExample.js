// Example: How to use probation/notice period settings in a dropdown
// This is a reference implementation showing how to fetch and use the settings

import { useState, useEffect } from 'react';
import { companySettingsService } from '@/services/company-admin/companySettingsService';

export default function PeriodDropdownExample() {
    const [companySettings, setCompanySettings] = useState(null);
    const [selectedProbationPeriod, setSelectedProbationPeriod] = useState('');
    const [selectedNoticePeriod, setSelectedNoticePeriod] = useState('');

    useEffect(() => {
        // Fetch company settings on component mount
        const fetchSettings = async () => {
            try {
                const settings = await companySettingsService.getCompanySettings();
                setCompanySettings(settings);
            } catch (error) {
                console.error('Failed to fetch company settings:', error);
            }
        };

        fetchSettings();
    }, []);

    // Get dropdown options
    const probationOptions = companySettings
        ? companySettingsService.getProbationPeriodOptions(companySettings)
        : [];

    const noticeOptions = companySettings
        ? companySettingsService.getNoticePeriodOptions(companySettings)
        : [];

    return (
        <div className="space-y-4">
            {/* Probation Period Dropdown */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probation Period
                </label>
                <select
                    value={selectedProbationPeriod}
                    onChange={(e) => setSelectedProbationPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select probation period</option>
                    {probationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Notice Period Dropdown */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notice Period
                </label>
                <select
                    value={selectedNoticePeriod}
                    onChange={(e) => setSelectedNoticePeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select notice period</option>
                    {noticeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}

/* 
 * USAGE EXAMPLES:
 * 
 * 1. Parse comma-separated string to array:
 *    const periods = companySettingsService.parsePeriodOptions('30,60,90,180');
 *    // Returns: [30, 60, 90, 180]
 * 
 * 2. Get dropdown options:
 *    const options = companySettingsService.getProbationPeriodOptions(settings);
 *    // Returns: [{value: 30, label: '30 days'}, {value: 60, label: '60 days'}, ...]
 * 
 * 3. Use in a form:
 *    <select>
 *      {probationOptions.map(opt => (
 *        <option key={opt.value} value={opt.value}>{opt.label}</option>
 *      ))}
 *    </select>
 */
