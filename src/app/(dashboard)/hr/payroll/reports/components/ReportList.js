// src/app/(dashboard)/hr/payroll/reports/components/ReportList.js
"use client";
import { useState, useEffect } from 'react';
import { Download, Eye, FileText, Calendar, Trash2 } from 'lucide-react';
import { payrollService } from '@/services/hr-services/payroll.service';

const ReportList = ({ onDownload }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await payrollService.getPayrollReports({ limit: 6 });
        setReports(response.data.reports || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getReportIcon = (format) => {
    if (format?.toUpperCase() === 'PDF') {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else {
      return <FileText className="w-5 h-5 text-green-500" />;
    }
  };

  const getTypeBadge = (type) => {
    const typeMap = {
      'PAYROLL_SUMMARY': { label: 'Summary', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      'TAX_REPORT': { label: 'Tax', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
      'DEPARTMENT_WISE': { label: 'Department', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      'EMPLOYEE_WISE': { label: 'Employee', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      'default': { label: 'Report', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' }
    };

    const { label, color } = typeMap[type] || typeMap.default;
    return <span className={`px-2.5 py-0.5 rounded-xs text-xs font-medium ${color}`}>{label}</span>;
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        await payrollService.deleteReport(id);
        setReports(reports.filter(r => r.id !== id));
      } catch (err) {
        alert('Failed to delete report: ' + err.message);
      }
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 animate-pulse bg-gray-200 h-6 w-1/4 rounded"></h2>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 text-center">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 text-left">Recent Reports</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {reports.length === 0 && !loading && (
        <div className="py-8 text-gray-500 dark:text-gray-400">
          No reports found.
        </div>
      )}

      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700 gap-4 sm:gap-0">
            <div className="flex items-start sm:items-center space-x-4 w-full sm:w-auto">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm shrink-0">
                {getReportIcon(report.format)}
              </div>

              <div className="min-w-0 flex-1 text-left">
                <h3 className="font-medium text-gray-800 dark:text-white truncate">{report.name}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                  {getTypeBadge(report.type)}
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center whitespace-nowrap">
                    <Calendar className="w-3 h-3 mr-1" />
                    {payrollService.formatDate(report.createdAt || report.generatedDate)}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{report.period}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{(report.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                title="View"
                onClick={() => window.open(report.fileUrl, '_blank')}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDownload(report)}
                className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-all duration-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(report.id)}
                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
          View All Reports →
        </button>
      </div>
    </div>
  );
};

export default ReportList;
