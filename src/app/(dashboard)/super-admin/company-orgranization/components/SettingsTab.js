'use client';
import { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SettingsTab({ company, isLoading, onRefresh }) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        employeeIdPrefix: '',
        probationPeriodOptions: '30,60,90,180',
        noticePeriodOptions: '15,30,60,90',
    });

    useEffect(() => {
        if (company) {
            setFormData({
                timezone: company.timezone || 'Asia/Kolkata',
                currency: company.currency || 'INR',
                employeeIdPrefix: company.employeeIdPrefix || '',
                probationPeriodOptions: company.probationPeriodOptions || '30,60,90,180',
                noticePeriodOptions: company.noticePeriodOptions || '15,30,60,90',
            });
        }
    }, [company]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { companyOrganizationService } = await import('@/services/super-admin-services/companyOrganization.service');

            // Update company settings
            await companyOrganizationService.updateCurrentCompany({
                timezone: formData.timezone,
                currency: formData.currency,
                employeeIdPrefix: formData.employeeIdPrefix,
                probationPeriodOptions: formData.probationPeriodOptions,
                noticePeriodOptions: formData.noticePeriodOptions,
            });

            toast.success('Company settings updated successfully');
            onRefresh(formData);
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error(error?.response?.data?.message || 'Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-12 text-center text-gray-400">Loading system settings...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-900">Company Settings</h3>
                <p className="text-sm text-gray-500">Global configurations for your workspace.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
                <div className="space-y-6">
                    <div className="border-b pb-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employee ID Configuration</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">ID Prefix</label>
                            <input
                                type="text"
                                placeholder="e.g. EMP-"
                                className="w-full px-3 py-2 border rounded-sm text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
                                value={formData.employeeIdPrefix}
                                onChange={(e) => setFormData({ ...formData, employeeIdPrefix: e.target.value })}
                            />
                        </div>
                        <div className="p-3 bg-primary-50 border border-primary-100 rounded-sm flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[hsl(var(--primary))] uppercase">Preview</span>
                            <span className="font-mono text-sm font-bold text-[hsl(var(--primary))]">{formData.employeeIdPrefix || '???'}001</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="border-b pb-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Regional & Localization</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Workspace Timezone</label>
                            <select
                                className="w-full px-3 py-2 border rounded-sm text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
                                value={formData.timezone}
                                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                            >
                                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                <option value="UTC">UTC (Universal Coordinated Time)</option>
                                <option value="America/New_York">America/New_York (EST)</option>
                                <option value="Europe/London">Europe/London (GMT)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Default Currency</label>
                            <select
                                className="w-full px-3 py-2 border rounded-sm text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            >
                                <option value="INR">INR (₹) - Indian Rupee</option>
                                <option value="USD">USD ($) - US Dollar</option>
                                <option value="EUR">EUR (€) - Euro</option>
                                <option value="GBP">GBP (£) - British Pound</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="border-b pb-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employment Period Configuration</h4>
                        <p className="text-xs text-gray-500 mt-1">Define available period options (in days) for dropdowns</p>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Probation Period Options (Days)</label>
                            <input
                                type="text"
                                placeholder="e.g. 30,60,90,180"
                                className="w-full px-3 py-2 border rounded-sm text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
                                value={formData.probationPeriodOptions}
                                onChange={(e) => setFormData({ ...formData, probationPeriodOptions: e.target.value })}
                            />
                            <p className="text-xs text-gray-400">Enter comma-separated values (e.g., 30,60,90,180). These will appear in dropdown when setting employee probation periods.</p>
                            {formData.probationPeriodOptions && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-xs text-gray-500 font-semibold">Preview:</span>
                                    {formData.probationPeriodOptions.split(',').filter(v => v.trim()).map((val, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-primary-50 text-[hsl(var(--primary))] rounded text-xs font-medium border border-primary-200">
                                            {val.trim()} days
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase">Notice Period Options (Days)</label>
                            <input
                                type="text"
                                placeholder="e.g. 15,30,60,90"
                                className="w-full px-3 py-2 border rounded-sm text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
                                value={formData.noticePeriodOptions}
                                onChange={(e) => setFormData({ ...formData, noticePeriodOptions: e.target.value })}
                            />
                            <p className="text-xs text-gray-400">Enter comma-separated values (e.g., 15,30,60,90). These will appear in dropdown when setting employee notice periods.</p>
                            {formData.noticePeriodOptions && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-xs text-gray-500 font-semibold">Preview:</span>
                                    {formData.noticePeriodOptions.split(',').filter(v => v.trim()).map((val, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium border border-amber-200">
                                            {val.trim()} days
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 border-t">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 bg-[hsl(var(--primary))] text-white rounded-sm text-sm font-semibold hover:bg-[hsl(var(--primary))]/90 disabled:opacity-60 transition"
                    >
                        {isSaving ? 'Processing...' : 'Apply System Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
