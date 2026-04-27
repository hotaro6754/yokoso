"use client";
import { Download, DollarSign, FileText } from "lucide-react";
import Link from "next/link";

export default function PayrollWidget({ data }) {
    if (!data) return <div className="animate-pulse h-full bg-gray-100 dark:bg-gray-800 rounded-2xl"></div>;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-primary-100/50 dark:border-gray-700 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl">
                    <DollarSign size={18} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Payroll Snapshot</h3>
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Last Salary Paid</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{data.month || "Current Month"}</p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white flex items-baseline gap-1">
                        <span className="text-lg font-medium text-gray-500 dark:text-gray-400">{data.currency || "₹"}</span>
                        {data.lastPayslipAmount?.toLocaleString() || "0"}
                    </div>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        Pay Date: <span className="font-medium text-gray-700 dark:text-gray-300">{data.payDate || "Pending"}</span>
                    </div>
                </div>

                <div className="pt-4 mt-auto space-y-2">
                    <Link
                        href="/employee/payslips/pay-slips"
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-500/10 dark:hover:bg-primary-500/20 text-primary-700 dark:text-primary-400 rounded-xl transition-all duration-200 font-medium text-sm border border-primary-200/50 dark:border-primary-500/20 hover:border-primary-300 dark:hover:border-primary-500/30"
                    >
                        <Download size={16} />
                        <span>Download Payslip</span>
                    </Link>
                    <Link
                        href="/employee/payslips/tax-info"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <FileText size={16} />
                        Tax Summary
                    </Link>
                </div>
            </div>
        </div>
    );
}
