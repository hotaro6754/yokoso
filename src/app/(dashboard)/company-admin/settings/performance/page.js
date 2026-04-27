"use client";

import { useEffect, useState } from "react";
import { companySettingsService } from "@/services/company-admin/companySettingsService";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Save, Clock, Star, Zap } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PerformanceSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState({
        defaultDuration: 90,
        extensionMaxDuration: 90,
        ratingScale: {
            "1": "Needs Improvement",
            "2": "Below Expectations",
            "3": "Meets Expectations",
            "4": "Exceeds Expectations",
            "5": "Outstanding"
        },
        autoConfirm: false,
        autoConfirmRules: {
            minRating: 4,
            minAttendance: 90
        }
    });

    const breadcrumbItems = [
        { label: "Settings", href: "/company-admin/settings" },
        { label: "Performance", href: "/company-admin/settings/performance" },
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await companySettingsService.getProbationSettings();
            if (res.data) {
                // Merge with defaults to ensure all fields exist
                setSettings(prev => ({
                    ...prev,
                    ...res.data,
                    ratingScale: res.data.ratingScale || prev.ratingScale,
                    autoConfirmRules: res.data.autoConfirmRules || prev.autoConfirmRules
                }));
            }
        } catch (error) {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await companySettingsService.updateProbationSettings(settings); // Send as is
            toast.success("Settings updated successfully");
        } catch (error) {
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    const updateRatingLabel = (rating, label) => {
        setSettings(prev => ({
            ...prev,
            ratingScale: {
                ...prev.ratingScale,
                [rating]: label
            }
        }));
    };

    if (loading) return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Probation Policy Settings</h1>
                    <p className="text-gray-500 mt-1">Configure probation rules, duration, and automation logic.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-70"
                >
                    {saving ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">

                {/* Duration Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                            <Clock size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Duration & Extension</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Default Probation (Days)
                            </label>
                            <input
                                type="number"
                                value={settings.defaultDuration}
                                onChange={(e) => setSettings({ ...settings, defaultDuration: e.target.value })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">Initial duration assigned to new employees.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Max Extension Duration (Days)
                            </label>
                            <input
                                type="number"
                                value={settings.extensionMaxDuration}
                                onChange={(e) => setSettings({ ...settings, extensionMaxDuration: e.target.value })}
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            />
                            <p className="text-xs text-gray-500 mt-1">Maximum days allowed for extending probation.</p>
                        </div>
                    </div>
                </div>

                {/* Rating Scale */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600">
                            <Star size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Rating Scale (1-5)</h2>
                    </div>

                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(rating => (
                            <div key={rating} className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full font-bold text-gray-600 dark:text-gray-300 text-sm">
                                    {rating}
                                </div>
                                <input
                                    type="text"
                                    value={settings.ratingScale?.[rating] || ""}
                                    onChange={(e) => updateRatingLabel(rating, e.target.value)}
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                                    placeholder={`Label for rating ${rating}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Automation Rules */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                            <Zap size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Auto-Confirmation Rules</h2>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg mb-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Enable Auto-Confirm</h3>
                            <p className="text-sm text-gray-500">Automatically confirm probation if conditions are met.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.autoConfirm}
                                onChange={(e) => setSettings({ ...settings, autoConfirm: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                        </label>
                    </div>

                    {settings.autoConfirm && (
                        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Minimum Rating (1-5)
                                </label>
                                <select
                                    value={settings.autoConfirmRules?.minRating || 4}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        autoConfirmRules: { ...settings.autoConfirmRules, minRating: parseInt(e.target.value) }
                                    })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                >
                                    {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">Average review rating required.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Minimum Attendance (%)
                                </label>
                                <input
                                    type="number"
                                    value={settings.autoConfirmRules?.minAttendance || 90}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        autoConfirmRules: { ...settings.autoConfirmRules, minAttendance: parseInt(e.target.value) }
                                    })}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                                <p className="text-xs text-gray-500 mt-1">Minimum attendance percentage required.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
