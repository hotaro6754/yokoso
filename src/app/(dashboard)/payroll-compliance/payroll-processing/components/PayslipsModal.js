"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, X, Eye, Send, FileText, Printer } from "lucide-react";
import { toast } from 'react-hot-toast';
import { authService } from '@/services/auth-services/authService';
import { useEffect } from "react";
import { payrollProcessService } from "@/services/payroll-role-services/payroll-process.service";
import { employeePayslipService } from "@/services/employee/payslip.service";

const PayslipsModal = ({ employeeList, payrollData, payslipsGenerated, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [shop, setShop] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const authPayload = await authService.getCurrentUser();
        const user = authPayload.data?.user || authPayload.user || authPayload.data;
        const company = user?.company || user?.employer;
        
        if (company) {
          setShop({
            name: company.name,
            address: company.address,
            phone: company.phone || company.contactPhone,
            email: company.contactEmail || company.email,
            gst: company.gstNumber || company.gst
          });
        }
      } catch (err) {
        console.error("Failed to fetch company details", err);
      }
    };
    fetchCompany();
  }, []);

  const getFormattedMonth = () => {
    if (payrollData.month && payrollData.year) {
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      return `${monthNames[payrollData.month - 1]} ${payrollData.year}`;
    }
    return payrollData.period;
  };

  const formatIndianCurrency = (amount) => {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return formatted.replace('₹', 'Rs.');
  };


  const handleViewPayslip = async (employee) => {
    const id = employee.payslipId || employee.id;
    if (!id) {
      toast.error('Payslip ID not found');
      return;
    }

    const toastId = toast.loading(`Opening payslip for ${employee.name}...`);
    try {
      await employeePayslipService.viewPayslip(id);
      toast.dismiss(toastId);
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to open payslip', { id: toastId });
    }
  };

  const handleDownloadPDF = async (employee) => {
    if (!employee.payslipId) {
      toast.error('Please generate payslips first');
      return;
    }

    const toastId = toast.loading(`Downloading payslip for ${employee.name}...`);
    try {
      await employeePayslipService.downloadPayslip(employee.payslipId);
      toast.success(`PDF downloaded for ${employee.name}`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to download PDF', { id: toastId });
    }
  };

  const handleDownloadAll = async () => {
    const toastId = toast.loading('Initiating batch download...');
    try {
      for (let i = 0; i < filteredEmployees.length; i++) {
        const emp = filteredEmployees[i];
        if (emp.payslipId) {
          // Stagger downloads to avoid browser/network issues
          await new Promise(resolve => setTimeout(resolve, 800));
          await employeePayslipService.downloadPayslip(emp.payslipId);
        }
      }
      toast.success('Batch download completed', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to download some payslips', { id: toastId });
    }
  };
    
  const handleSendEmail = async (employee) => {
    const toastId = toast.loading(`Sending payslip to ${employee.name}...`);
    try {
      await payrollProcessService.sendSinglePayslipEmail(payrollData.id, employee.id);
      toast.success(`Payslip sent to ${employee.name}`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error(error.message || `Failed to send payslip to ${employee.name}`, { id: toastId });
    }
  };

  const filteredEmployees = employeeList.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Employee Payslips - {getFormattedMonth()}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg dark:bg-primary-900/20 dark:text-primary-400 text-xs font-medium border border-primary-100 dark:border-primary-800/30 w-fit mb-6">
              <FileText size={14} />
              <span>
                Total Records: {employeeList.length}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 dark:bg-gray-700/50 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Employee</th>
                    <th className="px-6 py-4 font-semibold">Gross Pay</th>
                    <th className="px-6 py-4 font-semibold text-red-500">Deductions</th>
                    <th className="px-6 py-4 font-semibold text-green-600">Net Pay</th>
                    <th className="px-6 py-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredEmployees.map((employee) => (
                    <motion.tr
                      key={employee.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-600 dark:text-primary-400 font-semibold text-xs">
                              {employee.name.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                              {employee.name}
                            </p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                              {employee.empId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Rs.{employee.gross?.toLocaleString('en-IN') || '0'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          Rs.{employee.deductions?.toLocaleString('en-IN') || '0'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                          Rs.{employee.net?.toLocaleString('en-IN') || '0'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleViewPayslip(employee)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(employee)}
                            className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-600 dark:hover:text-white"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSendEmail(employee)}
                            disabled={!payslipsGenerated}
                            className="p-1.5 rounded-lg bg-secondary-50 text-secondary-600 hover:bg-secondary-600 hover:text-white transition-all dark:bg-secondary-900/30 dark:text-secondary-400 dark:hover:bg-secondary-600 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            title={payslipsGenerated ? "Email" : "Generate payslips first"}
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {filteredEmployees.length === 0 && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No matching employees found</p>
                </div>
              )}
            </div>

            {employeeList.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No payslips available. Please complete payroll calculation first.
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default PayslipsModal;

