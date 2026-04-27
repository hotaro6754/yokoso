// src/app/(dashboard)/hr/payroll/reports/page.js
"use client";
import { useState, useEffect } from 'react';
import { Download, BarChart3, FileText, TrendingUp } from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import ReportList from './components/ReportList';
import ReportFilters from './components/ReportFilters';
import ReportChart from './components/ReportChart';
import { payrollService } from '@/services/hr-services/payroll.service';

export default function PayrollReports() {
  const [selectedReportType, setSelectedReportType] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await payrollService.getPayrollAnalytics();
        setAnalytics(response.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleGenerateReport = async () => {
    try {
      let result;
      const data = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };

      if (selectedReportType === 'payroll-summary') {
        result = await payrollService.generatePayrollSummary(data);
      } else if (selectedReportType === 'tax-report') {
        result = await payrollService.generateTaxReport(data);
      } else if (selectedReportType === 'department-wise') {
        result = await payrollService.generateDepartmentWiseReport(data);
      } else if (selectedReportType === 'employee-wise') {
        result = await payrollService.generateEmployeeWiseReport(data);
      } else {
        alert('Please select a report type');
        return;
      }

      alert('Report generated successfully!');
      // Refresh report list if needed
      window.location.reload();
    } catch (error) {
      alert('Failed to generate report: ' + error.message);
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      const blob = await payrollService.downloadReport(report.id, report.format?.toLowerCase() || 'pdf');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.name || `report-${report.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to download report');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      {/* Breadcrumb */}
      <Breadcrumb
        pageTitle="Payroll Reports"
        rightContent={null}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters and Report List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg mr-4">
                  <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
                  <p className="text-xl font-semibold text-gray-800 dark:text-white">
                    {analytics?.totalReports || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-secondary-100 dark:bg-secondary-900/30 rounded-lg mr-4">
                  <Download className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                  <p className="text-xl font-semibold text-gray-800 dark:text-white">
                    {analytics?.reportsThisMonth || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg mr-4">
                  <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Distributed</p>
                  <p className="text-xl font-semibold text-gray-800 dark:text-white">
                    {analytics?.totalDistributed || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Report Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 sm:gap-0">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Generate Report</h2>
              <button
                onClick={handleGenerateReport}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition shadow-sm hover:shadow-md font-semibold w-full sm:w-auto justify-center"
              >
                <BarChart3 size={18} />
                Generate Report
              </button>
            </div>

            <ReportFilters
              selectedReportType={selectedReportType}
              setSelectedReportType={setSelectedReportType}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
          </div>

          {/* Report List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <ReportList onDownload={handleDownloadReport} />
          </div>
        </div>

        {/* Charts and Visualizations */}
        <div className="space-y-6">
          <ReportChart
            title="Payroll Distribution"
            type="doughnut"
            data={analytics?.distributionData || {
              labels: ['Basic Salary', 'Allowances', 'Deductions', 'Taxes', 'Bonuses'],
              datasets: [{
                data: [45, 25, 15, 10, 5],
                backgroundColor: [
                  '#070C8A', '#3032AD', '#5D5FEF', '#8183F4', '#A5A6F6'
                ]
              }]
            }}
          />

          <ReportChart
            title="Monthly Payroll Trend"
            type="line"
            data={analytics?.trendData || {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              datasets: [{
                label: 'Total Payroll',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                borderColor: '#070C8A',
                backgroundColor: 'rgba(7, 12, 138, 0.1)',
                fill: true
              }]
            }}
          />
        </div>
      </div>
    </div>
  );
}
