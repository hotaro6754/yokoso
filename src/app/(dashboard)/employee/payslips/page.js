"use client";

import React, { useState, useEffect } from "react";
import { Eye, Download, ArrowUpDown, Calendar, FileText, Layers } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { employeePayslipService } from "@/services/employee/payslip.service";
import { employeeSalaryStructureService } from "@/services/employee/salaryStructure.service";
import { authService } from "@/services/auth-services/authService";
import toast from "react-hot-toast";

export default function PayslipsPage() {
  const today = new Date();
  const currentYear = today.getFullYear();

  const [year, setYear] = useState(currentYear);
  const [sortConfig, setSortConfig] = useState({ key: "month", direction: "desc" });
  const [loading, setLoading] = useState(true);
  const [payslips, setPayslips] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);
  const [salaryStructure, setSalaryStructure] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        // Check if user has employee profile
        if (userData?.data?.employee?.employeeId) {
          // We need the internal ID for the API, but userData.data.employee.employeeId is likely the string ID.
          // Let's check authService response structure again.
          // It returns userData.employee.id as publicId usually?
          // The controller expects internal ID.
          // Wait, authService.getCurrentUser wraps response.data.
          // In auth.service.js: return { ...user, permissions };
          // The controller wraps it in { data: user }.
          // So userData is { data: { ...user } }.

          // In auth.service.js userSelectFields: employee: { select: { id: true, employeeId: true ... } }
          // So userData.data.employee.id should be the internal ID.
          setEmployeeId(userData.data.employee.id);
          
          // Fetch salary structure for Annual CTC info
          await fetchSalaryStructure();
          
          await fetchPayslips(userData.data.employee.id);
        } else {
          console.error("No employee profile found for user");
          toast.error("Employee profile not found");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [year]);

  const fetchSalaryStructure = async () => {
    try {
      const data = await employeeSalaryStructureService.getCurrentSalaryStructure();
      setSalaryStructure(data.data);
    } catch (error) {
      console.error("Error fetching salary structure:", error);
      // Don't show error toast for salary structure as it's not critical for payslips
    }
  };

  useEffect(() => {
    if (employeeId) {
      fetchPayslips();
    }
  }, [employeeId, year]);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const response = await employeePayslipService.getPayslips(employeeId, { year, limit: 100 });
      // response is { data: [...], pagination: ... } or just response.data
      // Based on controller: successResponse(res, { data: result.payslips, ... })
      // So real data is response.data

      const fetchedPayslips = response.data || [];
      const formattedPayslips = processPayslipData(fetchedPayslips);
      setPayslips(formattedPayslips);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load payslips");
    } finally {
      setLoading(false);
    }
  };

  const processPayslipData = (data) => {
    // Sort by date ascending to calc YTD correctly first
    const sorted = [...data].sort((a, b) => new Date(a.issueDate) - new Date(b.issueDate));

    let runningYtd = 0;

    return sorted.map(item => {
      const date = new Date(item.issueDate);
      
      // Extract basic salary from earnings or payrollItem
      let basicSalary = 0;
      if (item.earnings && item.earnings.basicSalary !== undefined) {
        basicSalary = Number(item.earnings.basicSalary);
      } else if (item.payrollItem?.basicSalary) {
        basicSalary = Number(item.payrollItem.basicSalary);
      } else if (item.payrollItem?.salaryStructure?.basicSalary) {
        basicSalary = Number(item.payrollItem.salaryStructure.basicSalary);
      }

      // Calculate gross earnings: basic salary + other earnings (excluding basicSalary if it's in earnings)
      const earnings = { ...item.earnings };
      if (earnings.basicSalary !== undefined) {
        delete earnings.basicSalary; // Remove to avoid double counting
      }
      const otherEarnings = Object.values(earnings || {}).reduce((a, b) => a + Number(b), 0);
      const gross = basicSalary + otherEarnings;
      
      // Calculate total deductions
      const totalDeductions = Object.values(item.deductions || {}).reduce((a, b) => a + Number(b), 0);

      runningYtd += gross;

      return {
        id: item.id,
        month: date.getMonth(),
        year: date.getFullYear(),
        gross,
        deductions: totalDeductions,
        netPay: item.netSalary,
        leave: 0, // Need to fetch leave balance if available, currently 0 or fetch from another API
        ytd: runningYtd,
        paymentDate: item.issueDate // Use issueDate from backend
      };
    }).sort((a, b) => {
      // Resort based on current sort config or default desc
      return new Date(b.paymentDate) - new Date(a.paymentDate);
    });
  };

  const handleDownload = async (id) => {
    try {
      toast.loading("Downloading payslip...");
      await employeePayslipService.downloadPayslip(id);
      toast.dismiss();
      toast.success("Download started");
    } catch (error) {
      toast.dismiss();
      toast.error("Download failed");
    }
  };

  let rows = [...payslips];

  // Sorting
  if (sortConfig !== null) {
    rows.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const breadcrumbItems = [
    { label: "Employee", href: "/employee" },
    { label: "Payslips", href: "/employee/payslips" },
  ];

  const totalGross = rows.reduce((sum, row) => sum + row.gross, 0);
  const totalDeductions = rows.reduce((sum, row) => sum + row.deductions, 0);
  const totalNetPay = rows.reduce((sum, row) => sum + row.netPay, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Annual CTC</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{salaryStructure?.annualCTC 
                    ? Number(salaryStructure.annualCTC).toLocaleString()
                    : ((totalGross * 12)).toLocaleString()
                  }
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <Layers className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Gross</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalGross.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Deductions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalDeductions.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Net Pay</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">₹{totalNetPay.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Tax Summary</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">Year-wise view</p>
            <button className="mt-3 px-4 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 text-sm font-medium">
              Open Tax Summary
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Salary Structure</p>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mt-2">
              <Layers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="font-semibold">View-only structure</span>
            </div>
            <button className="mt-3 px-4 py-2 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 text-sm font-medium dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
              View Salary Structure
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-5 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Latest Payslip</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">Download instantly</p>
            <button
              onClick={() => rows.length > 0 && handleDownload(rows[0].id)}
              disabled={rows.length === 0}
              className={`mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium ${rows.length > 0 ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Download Latest
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Year:</label>
              <div className="relative flex-1 sm:flex-initial sm:w-48">
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full appearance-none border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 px-4 py-2 pr-8 text-sm text-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {[currentYear - 1, currentYear].map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 dark:text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payslip Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-gray-700 dark:to-gray-800">
                <tr>
                  {[
                    { key: "month", label: "Month" },
                    { key: "year", label: "Year" },
                    { key: "gross", label: "Gross Earnings" },
                    { key: "deductions", label: "Deductions" },
                    { key: "netPay", label: "Net Pay" },
                    // { key: "leave", label: "Leave Balance" },
                    { key: "ytd", label: "YTD Gross" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="px-5 py-4 text-left font-semibold text-gray-700 dark:text-gray-200 cursor-pointer select-none hover:bg-primary-100/50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => requestSort(col.key)}
                    >
                      <div className="flex items-center gap-2">
                        {col.label}
                        <ArrowUpDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      </div>
                    </th>
                  ))}
                  <th className="px-5 py-4 text-center font-semibold text-gray-700 dark:text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-gray-500">
                      Loading payslips...
                    </td>
                  </tr>
                ) : rows.length > 0 ? (
                  rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-primary-50/30 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-100">{months[row.month]}</td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{row.year}</td>
                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300 font-medium">₹{row.gross.toLocaleString()}</td>
                      <td className="px-5 py-4 text-red-600 dark:text-red-400 font-medium">₹{row.deductions.toLocaleString()}</td>
                      <td className="px-5 py-4 text-primary-600 dark:text-primary-400 font-semibold">₹{row.netPay.toLocaleString()}</td>
                      {/* <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{row.leave} days</td> */}
                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300 font-medium">₹{row.ytd.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDownload(row.id)}
                            className="p-2 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-500/20 text-primary-600 dark:text-primary-400 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No payslips found for this year</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
