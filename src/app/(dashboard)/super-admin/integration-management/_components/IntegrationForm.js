'use client';

import { useFormik, FormikProvider, FieldArray } from 'formik';
import * as Yup from 'yup';
import {
    Save,
    RotateCw,
    Key,
    Copy,
    Download,
    X,
    Server,
    Shield,
    Globe,
    Activity,
    Trash2,
    Plus
} from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { integrationService } from '@/services/super-admin-services/integration.service';

const getValidationSchema = () => {
    return Yup.object().shape({
        name: Yup.string().required('Integration Name is required'),
        type: Yup.string().required('Type is required'),
        environment: Yup.string().required('Environment is required'),
        status: Yup.string().required('Status is required'),
        syncFrequency: Yup.string().required('Sync Frequency is required'),

        // Dynamic Config Validation based on Type
        config: Yup.object().when('type', {
            is: 'BANK',
            then: (schema) => schema.shape({
                bank_code: Yup.string().required('Bank Code is required'),
                account_number: Yup.string().required('Account Number is required'),
                payout_format: Yup.string().required('Payout Format is required'),
            }),
            otherwise: (schema) => schema,
        }).when('type', {
            is: 'BIOMETRIC',
            then: (schema) => schema.shape({
                device_id: Yup.string().required('Device ID is required'),
                vendor: Yup.string().required('Vendor is required'),
                location_id: Yup.number().required('Location ID is required'),
            }),
            otherwise: (schema) => schema,
        }),

        webhookUrl: Yup.string().url('Must be a valid URL').nullable(),
        ipWhitelist: Yup.array().of(Yup.string().matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP Address')),
    });
};

export default function IntegrationForm({ initialValues, onSubmit, isEditing = false, integrationId, onCancel }) {
    const [generatingKey, setGeneratingKey] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [generatedApiKey, setGeneratedApiKey] = useState('');
    const [generatedAt, setGeneratedAt] = useState(null);

    const formik = useFormik({
        initialValues: initialValues || {
            name: '',
            type: 'BANK',
            status: 'ACTIVE',
            environment: 'SANDBOX',
            syncFrequency: 'MANUAL',
            config: {
                // Bank Defaults
                bank_code: '',
                account_number: '',
                payout_format: 'CSV',

                // Biometric Defaults
                device_id: '',
                vendor: '',
                location_id: '',

                // ERP Defaults
                api_endpoint: '',
                api_key: '',
                ledger_mapping: {},
            },
            ipWhitelist: [],
            webhookUrl: '',
        },
        validationSchema: getValidationSchema(),
        enableReinitialize: true,
        onSubmit: async (values) => {
            // Clean up config based on type before submitting
            const cleanConfig = {};
            if (values.type === 'BANK') {
                cleanConfig.bank_code = values.config.bank_code;
                cleanConfig.account_number = values.config.account_number;
                cleanConfig.payout_format = values.config.payout_format;
            } else if (values.type === 'BIOMETRIC') {
                cleanConfig.device_id = values.config.device_id;
                cleanConfig.vendor = values.config.vendor;
                cleanConfig.location_id = values.config.location_id;
            } else if (values.type === 'ERP') {
                cleanConfig.api_endpoint = values.config.api_endpoint;
                cleanConfig.api_key = values.config.api_key;
            }

            const cleanedWebhookUrl = values.webhookUrl?.trim() || undefined;
            const cleanedIpWhitelist = (values.ipWhitelist || [])
                .map((ip) => String(ip || '').trim())
                .filter(Boolean);

            const payload = {
                ...values,
                config: cleanConfig,
                webhookUrl: cleanedWebhookUrl,
                ipWhitelist: cleanedIpWhitelist
            };
            delete payload.companyId;

            await onSubmit(payload);
        },
    });

    const handleGenerateKey = async () => {
        if (!isEditing || !integrationId) return;
        if (!confirm('Generating a new API Key will revoke the old one. Continue?')) return;

        setGeneratingKey(true);
        try {
            const data = await integrationService.generateApiKey(integrationId);
            const apiKey = data?.data?.apiKey || data?.apiKey;
            toast.success('New API Key Generated');
            if (!apiKey) {
                toast.error('API key generated but not returned in response');
                return;
            }
            setGeneratedApiKey(apiKey);
            setGeneratedAt(new Date());
            setShowApiKeyModal(true);
        } catch (error) {
            toast.error('Failed to generate API Key');
        } finally {
            setGeneratingKey(false);
        }
    };

    const handleCopyApiKey = async () => {
        if (!generatedApiKey) return;
        try {
            await navigator.clipboard.writeText(generatedApiKey);
            toast.success('API key copied');
        } catch (error) {
            toast.error('Failed to copy API key');
        }
    };

    const handleDownloadApiKey = () => {
        if (!generatedApiKey) return;

        const safeName = (formik.values.name || 'integration')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const timestamp = (generatedAt || new Date()).toISOString();
        const content = [
            'Zodeck Integration API Key',
            '===========================',
            `Integration: ${formik.values.name || 'N/A'}`,
            `Type: ${formik.values.type || 'N/A'}`,
            `Environment: ${formik.values.environment || 'N/A'}`,
            'Company: Resolved automatically by backend',
            `Generated At: ${timestamp}`,
            '',
            `API Key: ${generatedApiKey}`,
            '',
            'Keep this key secure. It may not be shown again.'
        ].join('\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${safeName || 'integration'}-api-key.txt`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        toast.success('API key file downloaded');
    };

    const handleManualSync = async () => {
        if (!isEditing || !integrationId) return;
        setSyncing(true);
        try {
            await integrationService.syncIntegration(integrationId);
            toast.success('Sync triggered successfully');
        } catch (error) {
            toast.error('Sync failed triggered');
        } finally {
            setSyncing(false);
        }
    };

    const renderConfigFields = () => {
        switch (formik.values.type) {
            case 'BANK':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bank Code (IFSC/SWIFT)</label>
                            <input type="text" {...formik.getFieldProps('config.bank_code')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
                            {formik.touched.config?.bank_code && formik.errors.config?.bank_code && <div className="text-red-500 text-xs mt-1">{formik.errors.config.bank_code}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Account Number</label>
                            <input type="text" {...formik.getFieldProps('config.account_number')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
                            {formik.touched.config?.account_number && formik.errors.config?.account_number && <div className="text-red-500 text-xs mt-1">{formik.errors.config.account_number}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Payout Format</label>
                            <select {...formik.getFieldProps('config.payout_format')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
                                <option value="CSV">CSV</option>
                                <option value="XML">XML</option>
                                <option value="JSON">JSON</option>
                            </select>
                        </div>
                    </div>
                );
            case 'BIOMETRIC':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Device ID / Serial No</label>
                            <input type="text" {...formik.getFieldProps('config.device_id')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
                            {formik.touched.config?.device_id && formik.errors.config?.device_id && <div className="text-red-500 text-xs mt-1">{formik.errors.config.device_id}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Vendor</label>
                            <input type="text" {...formik.getFieldProps('config.vendor')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
                            {formik.touched.config?.vendor && formik.errors.config?.vendor && <div className="text-red-500 text-xs mt-1">{formik.errors.config.vendor}</div>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Location ID</label>
                            <input type="number" {...formik.getFieldProps('config.location_id')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
                            {formik.touched.config?.location_id && formik.errors.config?.location_id && <div className="text-red-500 text-xs mt-1">{formik.errors.config.location_id}</div>}
                        </div>
                    </div>
                );
            case 'ERP':
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">API Endpoint URL</label>
                            <input type="text" {...formik.getFieldProps('config.api_endpoint')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="https://api.erp-system.com/v1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">API Key / Token</label>
                            <input type="password" {...formik.getFieldProps('config.api_key')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm" />
                        </div>
                    </div>
                );
            default:
                return <div className="text-gray-500 italic text-sm">Select an integration type to view configuration.</div>;
        }
    };

    return (
        <FormikProvider value={formik}>
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Configuration Panel */}
                <div className="flex-1 space-y-6">
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        {/* Core Settings */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Server className="w-4 h-4 text-blue-600" /> Core Settings
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Integration Name</label>
                                    <input type="text" {...formik.getFieldProps('name')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                    {formik.touched.name && formik.errors.name && <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select {...formik.getFieldProps('type')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                        <option value="BANK">Bank (Payroll)</option>
                                        <option value="BIOMETRIC">Biometric Device</option>
                                        <option value="ERP">Accounting / ERP</option>
                                        <option value="JOB_PORTAL">Job Portal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Environment</label>
                                    <select {...formik.getFieldProps('environment')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                        <option value="SANDBOX">Sandbox / Test</option>
                                        <option value="PRODUCTION">Production</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sync Frequency</label>
                                    <select {...formik.getFieldProps('syncFrequency')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                        <option value="MANUAL">Manual Only</option>
                                        <option value="HOURLY">Hourly</option>
                                        <option value="DAILY">Daily</option>
                                        <option value="WEEKLY">Weekly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select {...formik.getFieldProps('status')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Dynamic Config */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-600" /> {formik.values.type} Configuration
                            </h3>
                            {renderConfigFields()}
                        </div>

                        {/* Webhook & IP Whitelist */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-600" /> Network & Webhooks
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Webhook URL (Optional)</label>
                                    <input type="text" {...formik.getFieldProps('webhookUrl')} className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm" placeholder="https://your-domain.com/webhook" />
                                    <p className="text-xs text-gray-500 mt-1">We will send events to this URL.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">IP Whitelist</label>
                                    <FieldArray
                                        name="ipWhitelist"
                                        render={arrayHelpers => (
                                            <div className="space-y-2">
                                                {formik.values.ipWhitelist.map((ip, index) => (
                                                    <div key={index} className="flex gap-2">
                                                        <input
                                                            name={`ipWhitelist.${index}`}
                                                            value={ip}
                                                            onChange={formik.handleChange}
                                                            className="block flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
                                                            placeholder="e.g. 192.168.1.1"
                                                        />
                                                        <button type="button" onClick={() => arrayHelpers.remove(index)} className="text-red-500">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => arrayHelpers.push('')} className="text-blue-600 text-sm font-medium flex items-center gap-1">
                                                    <Plus className="w-3 h-3" /> Add IP
                                                </button>
                                            </div>
                                        )}
                                    />
                                    <p className="text-xs text-gray-500">Only allow requests from these IPs (leave empty to allow all)</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium">Cancel</button>
                            <button type="submit" disabled={formik.isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                                <Save className="w-4 h-4" />
                                {isEditing ? 'Update Integration' : 'Create Integration'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Panel - Status & Actions (Only in Edit Mode) */}
                {isEditing && (
                    <div className="w-full lg:w-80 space-y-6">
                        {/* Status Widget */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase">Status</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-3 h-3 rounded-full ${formik.values.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="font-medium text-gray-900">{formik.values.status}</span>
                            </div>
                            <div className="text-xs text-gray-500 space-y-2">
                                <div className="flex justify-between">
                                    <span>Last Sync:</span>
                                    <span className="font-medium text-gray-700">2 hours ago</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Health:</span>
                                    <span className="font-medium text-green-600">Good</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions Widget */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase">Actions</h3>
                            <div className="space-y-3">
                                <button onClick={handleManualSync} disabled={syncing} className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100 flex items-center justify-center gap-2">
                                    <RotateCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                                    {syncing ? 'Syncing...' : 'Trigger Sync'}
                                </button>
                                <button onClick={handleGenerateKey} disabled={generatingKey} className="w-full py-2 bg-gray-50 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 flex items-center justify-center gap-2">
                                    <Key className="w-4 h-4" />
                                    Generate API Key
                                </button>
                            </div>
                        </div>

                        {/* Security Note */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div className="flex gap-2">
                                <Shield className="w-5 h-5 text-blue-600 shrink-0" />
                                <p className="text-xs text-blue-800">
                                    API Keys are securely hashed. You can only view a key once upon generation.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showApiKeyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-gray-200">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">New API Key Generated</h3>
                            <button
                                type="button"
                                onClick={() => setShowApiKeyModal(false)}
                                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-4">
                            <p className="text-sm text-gray-700">
                                Save this key now. For security reasons, it may not be shown again.
                            </p>

                            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">API Key</p>
                                <p className="font-mono text-sm break-all text-gray-900">{generatedApiKey}</p>
                            </div>

                            <div className="text-xs text-gray-500">
                                Generated at: {(generatedAt || new Date()).toISOString()}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-end border-t border-gray-200 px-6 py-4">
                            <button
                                type="button"
                                onClick={handleCopyApiKey}
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <Copy className="w-4 h-4" />
                                Copy
                            </button>
                            <button
                                type="button"
                                onClick={handleDownloadApiKey}
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                            >
                                <Download className="w-4 h-4" />
                                Download .txt
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowApiKeyModal(false)}
                                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </FormikProvider>
    );
}
