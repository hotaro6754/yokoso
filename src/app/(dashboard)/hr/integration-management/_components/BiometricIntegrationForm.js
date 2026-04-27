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

const validationSchema = Yup.object().shape({
    name: Yup.string().required('Integration Name is required'),
    environment: Yup.string().required('Environment is required'),
    status: Yup.string().required('Status is required'),
    syncFrequency: Yup.string().required('Sync Frequency is required'),
    config: Yup.object().shape({
        device_id: Yup.string().required('Device ID is required'),
        vendor: Yup.string().required('Vendor is required'),
        location_id: Yup.number().typeError('Location ID must be a number').required('Location ID is required'),
    }),
    webhookUrl: Yup.string().url('Must be a valid URL').nullable(),
    ipWhitelist: Yup.array().of(
        Yup.string().matches(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP Address')
    ),
});

export default function BiometricIntegrationForm({
    initialValues,
    onSubmit,
    isEditing = false,
    integrationId,
    onCancel,
}) {
    const [generatingKey, setGeneratingKey] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [generatedApiKey, setGeneratedApiKey] = useState('');
    const [generatedAt, setGeneratedAt] = useState(null);

    const formik = useFormik({
        initialValues: initialValues || {
            name: '',
            type: 'BIOMETRIC',
            status: 'ACTIVE',
            environment: 'PRODUCTION',
            syncFrequency: 'MANUAL',
            config: {
                device_id: '',
                vendor: '',
                location_id: '',
            },
            ipWhitelist: [],
            webhookUrl: '',
        },
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values) => {
            const payload = {
                ...values,
                type: 'BIOMETRIC', // always locked
                config: {
                    device_id: values.config.device_id,
                    vendor: values.config.vendor,
                    location_id: Number(values.config.location_id),
                },
                webhookUrl: values.webhookUrl?.trim() || undefined,
                ipWhitelist: (values.ipWhitelist || [])
                    .map((ip) => String(ip || '').trim())
                    .filter(Boolean),
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
            if (!apiKey) {
                toast.error('API key generated but not returned in response');
                return;
            }
            toast.success('New API Key Generated');
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
        try {
            await navigator.clipboard.writeText(generatedApiKey);
            toast.success('API key copied');
        } catch {
            toast.error('Failed to copy API key');
        }
    };

    const handleDownloadApiKey = () => {
        const safeName = (formik.values.name || 'integration')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const timestamp = (generatedAt || new Date()).toISOString();
        const content = [
            'Zodeck Biometric Integration API Key',
            '=====================================',
            `Integration: ${formik.values.name || 'N/A'}`,
            `Type: BIOMETRIC`,
            `Environment: ${formik.values.environment || 'N/A'}`,
            `Generated At: ${timestamp}`,
            '',
            `API Key: ${generatedApiKey}`,
            '',
            'Keep this key secure. It may not be shown again.',
        ].join('\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${safeName}-api-key.txt`;
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
        } catch {
            toast.error('Sync failed');
        } finally {
            setSyncing(false);
        }
    };

    return (
        <FormikProvider value={formik}>
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Form */}
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
                                    <input
                                        type="text"
                                        {...formik.getFieldProps('name')}
                                        placeholder="e.g. ZKTeco Office Device"
                                        className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                    {formik.touched.name && formik.errors.name && (
                                        <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>
                                    )}
                                </div>

                                {/* Type — locked, display only */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <div className="mt-1 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                                        Biometric Device
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Environment</label>
                                    <select
                                        {...formik.getFieldProps('environment')}
                                        className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="SANDBOX">Sandbox / Test</option>
                                        <option value="PRODUCTION">Production</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sync Frequency</label>
                                    <select
                                        {...formik.getFieldProps('syncFrequency')}
                                        className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="MANUAL">Manual Only</option>
                                        <option value="HOURLY">Hourly</option>
                                        <option value="DAILY">Daily</option>
                                        <option value="WEEKLY">Weekly</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        {...formik.getFieldProps('status')}
                                        className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Biometric Device Config */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-600" /> Device Configuration
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Device ID / Serial No</label>
                                    <input
                                        type="text"
                                        {...formik.getFieldProps('config.device_id')}
                                        placeholder="e.g. ZKT-001"
                                        className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    />
                                    {formik.touched.config?.device_id && formik.errors.config?.device_id && (
                                        <p className="text-red-500 text-xs mt-1">{formik.errors.config.device_id}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Vendor</label>
                                    <input
                                        type="text"
                                        {...formik.getFieldProps('config.vendor')}
                                        placeholder="e.g. ZKTeco"
                                        className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    />
                                    {formik.touched.config?.vendor && formik.errors.config?.vendor && (
                                        <p className="text-red-500 text-xs mt-1">{formik.errors.config.vendor}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location ID</label>
                                    <input
                                        type="number"
                                        {...formik.getFieldProps('config.location_id')}
                                        placeholder="e.g. 1"
                                        className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    />
                                    {formik.touched.config?.location_id && formik.errors.config?.location_id && (
                                        <p className="text-red-500 text-xs mt-1">{formik.errors.config.location_id}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Network & Webhooks */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-600" /> Network & Webhooks
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Webhook URL (Optional)</label>
                                    <input
                                        type="text"
                                        {...formik.getFieldProps('webhookUrl')}
                                        className="mt-1 block w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                        placeholder="https://your-domain.com/webhook"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">We will send sync events to this URL.</p>
                                    {formik.touched.webhookUrl && formik.errors.webhookUrl && (
                                        <p className="text-red-500 text-xs mt-1">{formik.errors.webhookUrl}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">IP Whitelist</label>
                                    <FieldArray
                                        name="ipWhitelist"
                                        render={(arrayHelpers) => (
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
                                                        <button
                                                            type="button"
                                                            onClick={() => arrayHelpers.remove(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => arrayHelpers.push('')}
                                                    className="text-blue-600 text-sm font-medium flex items-center gap-1 hover:text-blue-700"
                                                >
                                                    <Plus className="w-3 h-3" /> Add IP
                                                </button>
                                            </div>
                                        )}
                                    />
                                    <p className="text-xs text-gray-500">Leave empty to allow all IPs.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={formik.isSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {isEditing ? 'Update Integration' : 'Create Integration'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Panel — Edit mode only */}
                {isEditing && (
                    <div className="w-full lg:w-80 space-y-6">
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

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase">Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleManualSync}
                                    disabled={syncing}
                                    className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100 flex items-center justify-center gap-2"
                                >
                                    <RotateCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                                    {syncing ? 'Syncing...' : 'Trigger Sync'}
                                </button>
                                <button
                                    onClick={handleGenerateKey}
                                    disabled={generatingKey}
                                    className="w-full py-2 bg-gray-50 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-100 flex items-center justify-center gap-2"
                                >
                                    <Key className="w-4 h-4" />
                                    Generate API Key
                                </button>
                            </div>
                        </div>

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

            {/* API Key Modal */}
            {showApiKeyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-gray-200">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">New API Key Generated</h3>
                            <button
                                type="button"
                                onClick={() => setShowApiKeyModal(false)}
                                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <p className="text-sm text-gray-700">
                                Save this key now. For security reasons, it will not be shown again.
                            </p>
                            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                                <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">API Key</p>
                                <p className="font-mono text-sm break-all text-gray-900">{generatedApiKey}</p>
                            </div>
                            <p className="text-xs text-gray-500">
                                Generated at: {(generatedAt || new Date()).toISOString()}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-end border-t border-gray-200 px-6 py-4">
                            <button
                                type="button"
                                onClick={handleCopyApiKey}
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                <Copy className="w-4 h-4" /> Copy
                            </button>
                            <button
                                type="button"
                                onClick={handleDownloadApiKey}
                                className="inline-flex items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                            >
                                <Download className="w-4 h-4" /> Download .txt
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
