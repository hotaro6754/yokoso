"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2, FileText, Download } from "lucide-react";
import { toast } from 'react-hot-toast';
import Breadcrumb from "@/components/common/Breadcrumb";
import { payrollService } from "@/services/hr-services/payroll.service";
import Link from "next/link";

export default function ViewPayslipPage() {
  const { id } = useParams();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayslip = async () => {
      try {
        setLoading(true);
        const response = await payrollService.getPayslipById(id);
        setPayslip(response.data || response);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching payslip:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPayslip();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </div>
      </div>
    );
  }

  if (error || !payslip) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
          Error: {error || "Payslip not found"}
        </div>
      </div>
    );
  }

  const employee = payslip.employee || {};
  const earnings = payslip.earnings || [];
  const deductions = payslip.deductions || [];

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blob = await payrollService.downloadPayslip(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payslip-${employee.firstName || 'employee'}-${payslip.period}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Download failed', err);
      toast.error('Failed to download payslip');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "HR", href: "/hr" },
          { label: "Payroll Overview", href: "/hr/payroll" },
          { label: "Payslips", href: "/hr/payroll/payslips" },
          { label: "View Payslip" },
        ]}
      />

      <Link
        href="/hr/payroll/payslips"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Payslips
      </Link>

      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Payslip (Read-only)
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {employee.firstName || employee.name} {employee.lastName || ""} • {payslip.period || "Period pending"}
                </p>
              </div>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Earnings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Component
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {earnings.length > 0 ? (
                  earnings.map((earning, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{earning.name || earning.component || "-"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                        {payrollService.formatCurrency(earning.amount || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                      No earnings data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Deductions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Component
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {deductions.length > 0 ? (
                  deductions.map((deduction, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {deduction.name || deduction.component || "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                        {payrollService.formatCurrency(deduction.amount || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                      No deductions data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-brand-200 bg-brand-50 p-5 shadow-sm dark:border-brand-700 dark:bg-brand-900/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Net Pay</span>
            <span className="text-xl font-bold text-brand-600 dark:text-brand-400">
              {payrollService.formatCurrency(payslip.netSalary || payslip.netPay || 0)}
            </span>
          </div>
        </div>
      </div>
    </div >
  );
}
