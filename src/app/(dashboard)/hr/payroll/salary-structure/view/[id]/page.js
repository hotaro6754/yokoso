"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, IndianRupee } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { payrollService } from "@/services/hr-services/payroll.service";
import Link from "next/link";

export default function ViewSalaryStructurePage() {
  const { id } = useParams();
  const router = useRouter();
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        setLoading(true);
        const response = await payrollService.getSalaryStructureById(id);
        setStructure(response.data || response);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching salary structure:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStructure();
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

  if (error || !structure) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
          Error: {error || "Salary structure not found"}
        </div>
      </div>
    );
  }

  const employee = structure.employee || {};
  const earnings = structure.earnings || [];
  const deductions = structure.deductions || [];
  const grossSalary = structure.grossSalary || structure.monthlyGross || 0;
  const totalDeductions = deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
  const netPay = grossSalary - totalDeductions;

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "HR", href: "/hr" },
          { label: "Payroll Overview", href: "/hr/payroll" },
          { label: "Salary Structure", href: "/hr/payroll/salary-structure" },
          { label: "View Structure" },
        ]}
      />

      <Link
        href="/hr/payroll/salary-structure"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Salary Structure
      </Link>

      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            <IndianRupee className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Salary Structure Breakdown (Read-only)
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {employee.firstName || employee.name} {employee.lastName || ""} • {employee.employeeId || "ID pending"}
            </p>
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
                    Monthly Amount
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
                    Monthly Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {deductions.length > 0 ? (
                  deductions.map((deduction, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {deduction.name || deduction.component || "-"}
                        {deduction.name === "PF" && <span className="ml-2 text-xs text-gray-500">(Read Only)</span>}
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

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
              <p className="text-xs text-gray-500 dark:text-gray-400">Gross Salary</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {payrollService.formatCurrency(grossSalary)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/40">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Deductions</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {payrollService.formatCurrency(totalDeductions)}
              </p>
            </div>
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 dark:border-brand-700 dark:bg-brand-900/20">
              <p className="text-xs text-gray-500 dark:text-gray-400">Net Pay (Estimated)</p>
              <p className="text-lg font-semibold text-brand-600 dark:text-brand-400 mt-1">
                {payrollService.formatCurrency(netPay)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
