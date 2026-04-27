"use client";

import { motion } from "framer-motion";
import { Download, Printer, X } from "lucide-react";
import jsPDF from 'jspdf';

export default function ReportViewModal({ 
  show, 
  onClose, 
  report, 
  onDownload 
}) {
  if (!show || !report) return null;

  const generateReportContent = (report) => {
    const reportData = report.data || {};
    const content = {
      'payroll-summary': {
        title: 'Payroll Summary Report',
        data: reportData.summary
          ? [
              { label: 'Total Employees', value: reportData.summary.totalEmployees ?? '-' },
              { label: 'Total Payroll', value: `₹${Number(reportData.summary.totalPayroll || 0).toLocaleString()}` },
              { label: 'Average Salary', value: `₹${Number(reportData.summary.averageSalary || 0).toLocaleString()}` },
              { label: 'Active Departments', value: Object.keys(reportData.departmentSummary || {}).length }
            ]
          : [
              { label: 'Total Employees', value: '-' },
              { label: 'Total Payroll', value: '-' },
              { label: 'Average Salary', value: '-' },
              { label: 'Active Departments', value: '-' },
            ]
      },
      'tax-report': {
        title: 'Tax Compliance Report',
        data: reportData.totalTax !== undefined
          ? [
              { label: 'Total Tax Deducted', value: `₹${Number(reportData.totalTax || 0).toLocaleString()}` },
              { label: 'Total Employees', value: reportData.totalEmployees ?? '-' },
              { label: 'Total Income', value: `₹${Number(reportData.totalIncome || 0).toLocaleString()}` },
              { label: 'Average Tax', value: `₹${Number(reportData.averageTax || 0).toLocaleString()}` },
            ]
          : [
              { label: 'Total Tax Deducted', value: '-' },
              { label: 'Total Employees', value: '-' },
              { label: 'Total Income', value: '-' },
              { label: 'Average Tax', value: '-' },
            ]
      },
      'department-wise': {
        title: 'Department Wise Payroll Report',
        data: Array.isArray(reportData.departmentData)
          ? reportData.departmentData.map((dept) => ({
              label: dept.departmentName || 'Department',
              value: `₹${Number(dept.totalSalary || 0).toLocaleString()} (${dept.employeeCount || 0} employees)`
            }))
          : [
              { label: 'Departments', value: '-' }
            ]
      },
      'employee-wise': {
        title: 'Employee Wise Payroll Report',
        data: reportData.employee
          ? [
              { label: 'Employee', value: reportData.employee?.employeeName || '-' },
              { label: 'Department', value: reportData.employee?.department || '-' },
              { label: 'Designation', value: reportData.employee?.designation || '-' },
              { label: 'Total Payroll', value: `₹${Number(reportData.totalPayroll || 0).toLocaleString()}` },
            ]
          : [
              { label: 'Employee', value: '-' },
              { label: 'Department', value: '-' },
              { label: 'Designation', value: '-' },
              { label: 'Total Payroll', value: '-' },
            ]
      }
    };
    
    return content[report.type] || content['payroll-summary'];
  };

  const handlePrint = () => {
    window.print();
  };

  const reportContent = generateReportContent(report);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {report.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {report.period} • {report.format} • {report.fileSize}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* Report Summary */}
            <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-6 border border-brand-200 dark:border-brand-800">
              <h3 className="text-lg font-bold text-brand-900 dark:text-brand-100 mb-4">
                {reportContent.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportContent.data.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Report Details */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Report Information
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Generated Date:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {new Date(report.generatedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Report Type:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {report.type.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {report.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Sample Chart Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Visual Analytics
              </h4>
              <div className="h-48 bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/30 dark:to-brand-800/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-brand-600 dark:bg-brand-400 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-sm"></div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Interactive charts would be displayed here
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDownload(report)}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 font-medium"
            >
              <Printer className="w-4 h-4" />
              Print
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
