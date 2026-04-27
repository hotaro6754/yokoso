"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Download, Calendar, FileText, Building2, User, CreditCard, Banknote, Eye } from "lucide-react";
import { authService } from "@/services/auth-services/authService";
import { employeePayslipService } from "@/services/employee/payslip.service";
import toast from "react-hot-toast";

export default function PayslipsPage() {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [loading, setLoading] = useState(false);
  const [payslip, setPayslip] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);
  const [viewState, setViewState] = useState('LIST'); // 'LIST' or 'DETAILS'
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isManagerView = pathname.startsWith("/manager");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        // Check if user has employee profile
        if (userData?.data?.employee?.employeeId) {
          setEmployeeId(userData.data.employee.id);
        } else {
          console.error("No employee profile found for user");
          toast.error("Employee profile not found");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (employeeId) {
      fetchAllPayslips();
    }
  }, [employeeId, selectedYear]);

  const fetchAllPayslips = async () => {
    try {
      setLoading(true);
      if (isManagerView) return;

      const response = await employeePayslipService.getPayslips(employeeId, { year: selectedYear, limit: 100 });
      setPayslips(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load payslips history");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (p) => {
    setPayslip(p);
    setViewState('DETAILS');
  };

  const handleDownload = async () => {
    if (!payslip) return;
    try {
      toast.loading("Downloading...");
      await employeePayslipService.downloadPayslip(payslip.id);
      toast.dismiss();
      toast.success("Download started");
    } catch (error) {
      toast.dismiss();
      toast.error("Download failed");
    }
  };

  const handleViewPdf = async (id) => {
    try {
      toast.loading("Opening...");
      const blob = await employeePayslipService.downloadPayslip(id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      toast.dismiss();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to open payslip");
    }
  };

  const breadcrumbItems = [
    { label: "Employee", href: "/employee" },
    { label: "Payslips", href: "/employee/payslips" },
    { label: "View Payslip", href: "/employee/payslips/pay-slips" },
  ];

  // Helper to safely format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(Number(amount) || 0);
  };

  // Prepare data for view
  // If no payslip found, show placeholder or empty state

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500">Loading payslip...</div>
      </div>
    );
  }

  if (viewState === 'LIST') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <Breadcrumb items={breadcrumbItems.slice(0, 2)} />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payslips History</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Access and download your previous payslips</p>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full sm:w-40 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {[2026, 2025, 2024, 2023].map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Period</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">Issue Date</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-right">Net Amount</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {payslips.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No payslips found for {selectedYear}</p>
                      </td>
                    </tr>
                  ) : (
                    payslips.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary-500" />
                            {p.period}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(p.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white text-right font-mono">
                          {formatCurrency(p.netSalary)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewPdf(p.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="View PDF"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleViewDetails(p)}
                              className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setPayslip(p);
                                handleDownload();
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate totals for detailed view
  const earnings = payslip ? ({ ...payslip.earnings } || {}) : {};
  const deductions = payslip?.deductions || {};

  let basicSalary = 0;
  if (payslip) {
    if (earnings.basicSalary) {
      basicSalary = Number(earnings.basicSalary);
      delete earnings.basicSalary;
    } else {
      basicSalary = payslip.payrollItem?.basicSalary || 0;
    }
  }

  // Filter out internal metadata keys (starting with _) from earnings and deductions
  const cleanAllowances = {};
  if (earnings) {
    Object.entries(earnings).forEach(([k, v]) => {
      if (!k.startsWith('_')) cleanAllowances[k] = v;
    });
  }

  const cleanDeductions = {};
  if (deductions) {
    Object.entries(deductions).forEach(([k, v]) => {
      if (!k.startsWith('_')) cleanDeductions[k] = v;
    });
  }

  const totalEarnings = (Number(basicSalary) || 0) + Object.values(cleanAllowances).reduce((a, b) => {
    const val = Number(b);
    return a + (isNaN(val) ? 0 : val);
  }, 0);

  const totalDeductions = Object.values(cleanDeductions).reduce((a, b) => {
    const val = Number(b);
    return a + (isNaN(val) ? 0 : val);
  }, 0);

  const displayData = payslip ? {
    companyName: payslip.company?.name || "Company Name",
    companyAddress: payslip.company?.address || "-",
    period: payslip.period,
    employeeName: `${payslip.employee?.firstName} ${payslip.employee?.lastName}`,
    location: payslip.employee?.location?.name || "-",
    joiningDate: payslip.employee?.joiningDate ? new Date(payslip.employee.joiningDate).toLocaleDateString('en-GB') : "-",
    panNumber: payslip.employee?.panNumber || "-",
    uanNumber: payslip.employee?.uanNumber || "-",
    pfNumber: payslip.employee?.pfNumber || "-",
    esiNumber: payslip.employee?.esiNumber || "-",
    basicSalary: basicSalary,
    allowances: cleanAllowances,
    totalEarnings,
    deductionsList: cleanDeductions,
    totalDeductions,
    netPayable: payslip.netSalary,
    netSalaryInWords: "-"
  } : {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Breadcrumb items={breadcrumbItems} />
          <button
            onClick={() => setViewState('LIST')}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            ← Back to List
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pay Slips</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Detailed view of your payslip</p>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        {/* Payslip Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100/50 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* ... existing header ... */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-gray-700 dark:to-gray-800 px-6 py-6 border-b border-primary-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayData.companyName}</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">{displayData.companyAddress}</p>
            <div className="flex items-center gap-2 mt-4 ml-9">
              <Calendar className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payslip for {displayData.period}
              </h3>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Same content as before */}
            {/* ... Personal Details, Bank Details, Earnings & Deductions, Net Pay, Notes ... */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-primary-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  Personal Details
                </h4>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  <div className="px-4 py-3 bg-white dark:bg-gray-800 flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Employee Name</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{displayData.employeeName}</span>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Employee ID</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{displayData.employeeId}</span>
                  </div>
                  <div className="px-4 py-3 bg-white dark:bg-gray-800 flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Department</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{displayData.department}</span>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Designation</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{displayData.designation}</span>
                  </div>
                  <div className="px-4 py-3 bg-white dark:bg-gray-800 flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Location</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{displayData.location}</span>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Joining Date</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{displayData.joiningDate}</span>
                  </div>
                  <div className="px-4 py-3 bg-white dark:bg-gray-800 flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">PAN Number</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{displayData.panNumber}</span>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">UAN Number</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{displayData.uanNumber}</span>
                  </div>
                  <div className="px-4 py-3 bg-white dark:bg-gray-800 flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">PF Number</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{displayData.pfNumber}</span>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ESI Number</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{displayData.esiNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-primary-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  Bank Details
                </h4>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="px-4 py-3 bg-white dark:bg-gray-800 flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Bank Name</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">{displayData.bankName}</span>
                </div>
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Number</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">{displayData.bankAccount}</span>
                </div>
                <div className="px-4 py-3 bg-white dark:bg-gray-800 flex justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">IFSC Code</span>
                  <span className="text-sm text-gray-900 dark:text-white font-medium">{displayData.bankIFSC}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-primary-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Earnings
                  </h4>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  <div className="px-4 py-3 bg-white dark:bg-gray-800 flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Basic Salary</span>
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{formatCurrency(displayData.basicSalary)}</span>
                  </div>
                  {Object.entries(displayData.allowances).map(([label, value], i) => (
                    <div key={label} className={`px-4 py-3 ${i % 2 !== 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/50"} flex justify-between`}>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">{label.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{formatCurrency(value)}</span>
                    </div>
                  ))}
                  <div className="px-4 py-3 bg-primary-50/50 dark:bg-gray-700/80 flex justify-between font-bold border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-900 dark:text-white">Total Earnings</span>
                    <span className="text-sm text-gray-900 dark:text-white">{formatCurrency(displayData.totalEarnings)}</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-fit">
                <div className="bg-primary-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                    Deductions
                  </h4>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(displayData.deductionsList).map(([label, value], i) => (
                    <div key={label} className={`px-4 py-3 ${i % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/50"} flex justify-between`}>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">{label.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{formatCurrency(value)}</span>
                    </div>
                  ))}
                  <div className="px-4 py-3 bg-primary-50/50 dark:bg-gray-700/80 flex justify-between font-bold border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-900 dark:text-white">Total Deductions</span>
                    <span className="text-sm text-gray-900 dark:text-white">{formatCurrency(displayData.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
              <p className="text-sm font-medium text-green-800 dark:text-green-300 uppercase tracking-widest mb-2">Net Payable Amount</p>
              <div className="text-3xl font-bold text-green-700 dark:text-green-400">{formatCurrency(displayData.netPayable)}</div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">Note: All amounts displayed in this payslip are in INR.</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">*This is computer generated statement, does not require signature.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

