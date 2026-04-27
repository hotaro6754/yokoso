"use client";

import { Banknote, Landmark, CreditCard, Hash, User, ShieldCheck, Info } from 'lucide-react';

export default function BankInfo({ data }) {
    const safeData = data || {};

    const maskValue = (value, visibleCount = 4) => {
        if (!value) return 'Not provided';
        const raw = String(value);
        if (raw.length <= visibleCount) return raw;
        return `${'•'.repeat(Math.max(0, raw.length - visibleCount))}${raw.slice(-visibleCount)}`;
    };

    const bankFields = [
        { icon: Landmark, label: 'Bank Name', value: safeData.bankName, hint: 'Primary bank' },
        { icon: User, label: 'Account Holder', value: safeData.accountHolderName, hint: 'As per bank records' },
        { icon: CreditCard, label: 'Account Number', value: maskValue(safeData.accountNumber), hint: 'Masked for security' },
        { icon: Hash, label: 'IFSC Code', value: safeData.ifscCode, hint: 'Branch routing code' },
        { icon: Banknote, label: 'Account Type', value: safeData.accountType, hint: 'Savings or current' },
        { icon: Landmark, label: 'Branch Name', value: safeData.branchName, hint: 'Bank branch' }
    ];

    const taxFields = [
        { icon: ShieldCheck, label: 'PAN Number', value: maskValue(safeData.panNumber), hint: 'Tax identifier' },
        { icon: ShieldCheck, label: 'Aadhaar Number', value: maskValue(safeData.aadhaarNumber), hint: 'Masked for security' }
    ];

    const statutoryFields = [
        { icon: Hash, label: 'PF Number', value: safeData.pfNumber, hint: 'HR managed' },
        { icon: Hash, label: 'UAN Number', value: safeData.uanNumber, hint: 'HR managed' },
        { icon: Hash, label: 'ESI Number', value: safeData.esiNumber, hint: 'HR managed' }
    ];

    const InfoCard = ({ icon: Icon, label, value, hint }) => (
        <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/40 p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-500/10">
                    <Icon size={18} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white break-words">
                        {value || 'Not provided'}
                    </p>
                    {hint && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {hint}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Bank & Tax Information</h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <Info size={14} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">View Only</span>
                </div>
            </div>

            <div className="mb-5 p-3 bg-primary-50 dark:bg-primary-500/10 rounded-lg">
                <div className="flex items-start gap-2">
                    <Info size={16} className="text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-primary-700 dark:text-primary-300">
                        Bank and tax details are managed by HR and Payroll. Contact HR for any updates.
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Bank Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {bankFields.map((field) => (
                            <InfoCard key={field.label} {...field} />
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tax Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {taxFields.map((field) => (
                            <InfoCard key={field.label} {...field} />
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Statutory Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {statutoryFields.map((field) => (
                            <InfoCard key={field.label} {...field} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
