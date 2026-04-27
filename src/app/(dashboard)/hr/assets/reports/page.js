// src/app/(dashboard)/hr/assets/reports/page.js
"use client";
import { useState, useEffect } from 'react';
import { Download, Filter, BarChart3, PieChart, TrendingUp, Calendar, DollarSign, Package } from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import dynamic from 'next/dynamic';
import { assetService } from '../../../../../services/hr-services/asset.service';
import { toast } from 'react-hot-toast';

// Dynamically import chart components (to avoid SSR issues)
const InventoryCharts = dynamic(() => import('./components/InventoryCharts'), { ssr: false });
const MaintenanceCharts = dynamic(() => import('./components/MaintenanceCharts'), { ssr: false });
const DepreciationCharts = dynamic(() => import('./components/DepreciationCharts'), { ssr: false });
const AssignmentCharts = dynamic(() => import('./components/AssignmentCharts'), { ssr: false });

// Import DateRangePicker
import DateRangePicker from '@/components/form/date/DateRangePicker';

export default function AssetReports() {
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState('inventory');
  const [dateRange, setDateRange] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);

  const reports = [
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Complete inventory of all assets',
      icon: Package
    },
    {
      id: 'maintenance',
      title: 'Maintenance Costs',
      description: 'Maintenance expense analysis',
      icon: DollarSign
    },
    {
      id: 'depreciation',
      title: 'Depreciation',
      description: 'Asset depreciation reports',
      icon: TrendingUp
    },
    {
      id: 'assignments',
      title: 'Assignment History',
      description: 'Assignment and return analysis',
      icon: BarChart3
    }
  ];

  // Function to fetch report data from API
  const fetchReportData = async (type = activeReport, forceRefresh = false) => {
    try {
      if (!forceRefresh && reportData && reportData.title) {
        return; // Don't fetch if we already have data for this report
      }

      setLoading(true);
      setError(null);

      const params = {};

      // Add date range to params if available
      if (dateRange.length === 2 && (type === 'maintenance' || type === 'assignments')) {
        params.fromDate = dateRange[0].toISOString().split('T')[0];
        params.toDate = dateRange[1].toISOString().split('T')[0];
      }

      let response;

      switch (type) {
        case 'inventory':
          response = await assetService.getAssetInventoryReport(params);
          break;
        case 'maintenance':
          response = await assetService.getMaintenanceCostReport(params);
          break;
        case 'depreciation':
          response = await assetService.getAssetDepreciationReport(params);
          break;
        case 'assignments':
          response = await assetService.getAssetInventoryAssignmentReport(params);
          break;
        default:
          throw new Error(`Invalid report type: ${type}`);
      }

      if (response.success && response.data) {
        setReportData(response.data);
      } else {
        setError(response.message || `Failed to fetch ${type} report`);
        // Fallback to mock data if API fails
        loadMockData(type);
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to fetch report data. Please try again.');
      // Fallback to mock data
      loadMockData(type);
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock data function
  const loadMockData = (type) => {
    const mockData = {
      inventory: {
        title: "Asset Inventory Report",
        description: "Complete inventory of all company assets",
        data: {
          totalAssets: 0,
          totalValue: 0,
          byCategory: [],
          byStatus: []
        }
      },
      maintenance: {
        title: "Maintenance Cost Report",
        description: "Analysis of maintenance costs by category and time period",
        data: {
          totalCost: 0,
          averageCost: 0,
          byCategory: [],
          byMonth: []
        }
      },
      depreciation: {
        title: "Asset Depreciation Report",
        description: "Depreciation analysis of company assets",
        data: {
          totalDepreciation: 0,
          currentValue: 0,
          avgDepreciationRate: 0,
          byCategory: [],
          forecast: []
        }
      },
      assignments: {
        title: "Assignment History Report",
        description: "Historical analysis of asset assignments and returns",
        data: {
          totalAssignments: 0,
          activeAssignments: 0,
          byDepartment: [],
          byMonth: []
        }
      }
    };

    setReportData(mockData[type]);
  };

  useEffect(() => {
    fetchReportData(activeReport, true);
  }, [activeReport]);

  const handleGenerateReport = async () => {
    await fetchReportData(activeReport, true);
    toast.success('Report generated successfully');
  };

  const handleExport = async (format) => {
    try {
      const params = {};

      // Add date range to params if available
      if (dateRange.length === 2 && (activeReport === 'maintenance' || activeReport === 'assignments')) {
        params.fromDate = dateRange[0].toISOString().split('T')[0];
        params.toDate = dateRange[1].toISOString().split('T')[0];
      }

      // In a real implementation, this would export the report
      // For now, we'll show a toast and log to console
      toast.success(`Exporting ${activeReport} report as ${format.toUpperCase()}`);
      console.log(`Exporting ${activeReport} report as ${format}`, params);

      // If you have an export API endpoint, you can call it here:
      // const response = await assetService.exportReport(activeReport, format, params);
      // if (response.success && response.data.downloadUrl) {
      //   window.open(response.data.downloadUrl, '_blank');
      // }
    } catch (err) {
      console.error('Error exporting report:', err);
      toast.error('Failed to export report');
    }
  };

  const renderCharts = () => {
    if (!reportData || !reportData.data) return null;

    switch (activeReport) {
      case 'inventory':
        return <InventoryCharts data={reportData.data} />;
      case 'maintenance':
        return <MaintenanceCharts data={reportData.data} />;
      case 'depreciation':
        return <DepreciationCharts data={reportData.data} />;
      case 'assignments':
        return <AssignmentCharts data={reportData.data} />;
      default:
        return null;
    }
  };

  // Add safe access functions
  const getSafeValue = (value) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('en-IN', {
      maximumFractionDigits: 0
    });
  };

  const getSafeNumber = (value) => {
    return value || 0;
  };

  const getCurrencyValue = (value) => {
    if (value === undefined || value === null) return '$0';
    return `$${value.toLocaleString('en-IN', {
      maximumFractionDigits: 2
    })}`;
  };

  // Calculate average value for inventory
  const getAverageValue = () => {
    if (!reportData?.data) return 0;
    const totalAssets = getSafeNumber(reportData.data.totalAssets);
    const totalValue = getSafeNumber(reportData.data.totalValue);
    return totalAssets > 0 ? Math.round(totalValue / totalAssets) : 0;
  };

  // Calculate return rate for assignments
  const getReturnRate = () => {
    if (!reportData?.data) return 0;
    const totalAssignments = getSafeNumber(reportData.data.totalAssignments);
    const activeAssignments = getSafeNumber(reportData.data.activeAssignments);
    return totalAssignments > 0
      ? Math.round(((totalAssignments - activeAssignments) / totalAssignments) * 100)
      : 0;
  };

  if (loading && !reportData) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <Breadcrumb />
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        rightContent={
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleExport('pdf')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <Download size={18} /> Export PDF
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <Download size={18} /> Export Excel
            </button>
          </div>
        }
      />

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
          <div className="flex items-center">
            <span>{error}</span>
            <button
              onClick={() => fetchReportData(activeReport, true)}
              className="ml-auto text-sm font-medium hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Selection Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Types</h2>
            <div className="space-y-2">
              {reports.map((report) => {
                const Icon = report.icon;
                return (
                  <button
                    key={report.id}
                    onClick={() => {
                      setActiveReport(report.id);
                      setReportData(null); // Clear data to show loading for new report
                    }}
                    className={`w-full text-left p-4 rounded-lg transition-colors ${activeReport === report.id
                      ? 'bg-brand-50 border border-brand-200 text-brand-700 dark:bg-brand-900/20 dark:border-brand-800 dark:text-brand-300'
                      : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                  >
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 mr-3" />
                      <div>
                        <h3 className="font-medium">{report.title}</h3>
                        <p className="text-sm opacity-75">{report.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-6">
            {reportData && (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportData.title || 'Asset Reports'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      {reportData.description || 'Select a report type to view details'}
                    </p>
                  </div>
                </div>

                {/* Filters - Updated with DateRangePicker */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date Range {['maintenance', 'assignments'].includes(activeReport) ? '(Optional)' : ''}
                    </label>
                    <DateRangePicker
                      value={dateRange}
                      onChange={setDateRange}
                      placeholder="Select date range for report"
                    />
                    {!['maintenance', 'assignments'].includes(activeReport) && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Date range is not applicable for this report type
                      </p>
                    )}
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleGenerateReport}
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm hover:shadow-md font-semibold"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      {loading ? 'Generating...' : 'Generate Report'}
                    </button>
                  </div>
                </div>

                {/* Report Content */}
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeReport === 'inventory' && (
                      <>
                        <div className="bg-brand-50 rounded-lg p-4 dark:bg-brand-900/20">
                          <h3 className="text-sm font-medium text-brand-800 dark:text-brand-300">Total Assets</h3>
                          <p className="text-2xl font-bold text-brand-900 dark:text-brand-100">
                            {getSafeValue(reportData.data.totalAssets)}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 dark:bg-green-900/20">
                          <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Total Value</h3>
                          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                            {getCurrencyValue(reportData.data.totalValue)}
                          </p>
                        </div>
                        <div className="bg-brand-50 rounded-lg p-4 dark:bg-brand-900/20">
                          <h3 className="text-sm font-medium text-brand-800 dark:text-brand-300">Avg. Value</h3>
                          <p className="text-2xl font-bold text-brand-900 dark:text-brand-100">
                            {getCurrencyValue(getAverageValue())}
                          </p>
                        </div>
                      </>
                    )}
                    {activeReport === 'maintenance' && (
                      <>
                        <div className="bg-brand-50 rounded-lg p-4 dark:bg-brand-900/20">
                          <h3 className="text-sm font-medium text-brand-800 dark:text-brand-300">Total Cost</h3>
                          <p className="text-2xl font-bold text-brand-900 dark:text-brand-100">
                            {getCurrencyValue(reportData.data.totalCost)}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 dark:bg-green-900/20">
                          <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Average Cost</h3>
                          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                            {getCurrencyValue(reportData.data.averageCost)}
                          </p>
                        </div>
                        <div className="bg-brand-50 rounded-lg p-4 dark:bg-brand-900/20">
                          <h3 className="text-sm font-medium text-brand-800 dark:text-brand-300">Maintenance Events</h3>
                          <p className="text-2xl font-bold text-brand-900 dark:text-brand-100">
                            {getSafeValue(reportData.data.maintenanceEvents)}
                          </p>
                        </div>
                      </>
                    )}
                    {activeReport === 'depreciation' && (
                      <>
                        <div className="bg-brand-50 rounded-lg p-4 dark:bg-brand-900/20">
                          <h3 className="text-sm font-medium text-brand-800 dark:text-brand-300">Total Depreciation</h3>
                          <p className="text-2xl font-bold text-brand-900 dark:text-brand-100">
                            {getCurrencyValue(reportData.data.totalDepreciation)}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 dark:bg-green-900/20">
                          <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Current Value</h3>
                          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                            {getCurrencyValue(reportData.data.currentValue)}
                          </p>
                        </div>
                        <div className="bg-brand-50 rounded-lg p-4 dark:bg-brand-900/20">
                          <h3 className="text-sm font-medium text-brand-800 dark:text-brand-300">Avg. Depreciation Rate</h3>
                          <p className="text-2xl font-bold text-brand-900 dark:text-brand-100">
                            {getSafeNumber(reportData.data.avgDepreciationRate)}%
                          </p>
                        </div>
                      </>
                    )}
                    {activeReport === 'assignments' && (
                      <>
                        <div className="bg-brand-50 rounded-lg p-4 dark:bg-brand-900/20">
                          <h3 className="text-sm font-medium text-brand-800 dark:text-brand-300">Total Assignments</h3>
                          <p className="text-2xl font-bold text-brand-900 dark:text-brand-100">
                            {getSafeValue(reportData.data.totalAssignments)}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 dark:bg-green-900/20">
                          <h3 className="text-sm font-medium text-green-800 dark:text-green-300">Active Assignments</h3>
                          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                            {getSafeValue(reportData.data.activeAssignments)}
                          </p>
                        </div>
                        <div className="bg-brand-50 rounded-lg p-4 dark:bg-brand-900/20">
                          <h3 className="text-sm font-medium text-brand-800 dark:text-brand-300">Return Rate</h3>
                          <p className="text-2xl font-bold text-brand-900 dark:text-brand-100">
                            {getSafeNumber(reportData.data.returnRate)}%
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Charts Section */}
                  {renderCharts()}

                  {/* Data Tables */}
                  <div className="bg-gray-50 rounded-lg p-4 dark:bg-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      {activeReport === 'inventory' && 'Assets by Category'}
                      {activeReport === 'maintenance' && 'Costs by Category'}
                      {activeReport === 'depreciation' && 'Depreciation by Category'}
                      {activeReport === 'assignments' && 'Assignments by Department'}
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                              {activeReport === 'inventory' ? 'Category' :
                                activeReport === 'maintenance' ? 'Category' :
                                  activeReport === 'depreciation' ? 'Category' : 'Department'}
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                              {activeReport === 'inventory' ? 'Count' :
                                activeReport === 'maintenance' ? 'Cost' :
                                  activeReport === 'depreciation' ? 'Depreciation' : 'Count'}
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                              {activeReport === 'inventory' ? 'Value' :
                                activeReport === 'maintenance' ? 'Events' :
                                  activeReport === 'depreciation' ? 'Rate' : 'Percentage'}
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                              Percentage
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                          {activeReport === 'inventory' && reportData.data.byCategory?.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.category}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.count}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{getCurrencyValue(item.value)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {item.percentage || Math.round(item.count / getSafeNumber(reportData.data.totalAssets) * 100)}%
                              </td>
                            </tr>
                          ))}
                          {activeReport === 'maintenance' && reportData.data.byCategory?.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.category}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{getCurrencyValue(item.cost)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.count}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {item.percentage || Math.round(item.cost / getSafeNumber(reportData.data.totalCost) * 100)}%
                              </td>
                            </tr>
                          ))}
                          {activeReport === 'depreciation' && reportData.data.byCategory?.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.category}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{getCurrencyValue(item.depreciation)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.rate}%</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {Math.round(item.depreciation / getSafeNumber(reportData.data.totalDepreciation) * 100)}%
                              </td>
                            </tr>
                          ))}
                          {activeReport === 'assignments' && reportData.data.byDepartment?.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.department}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{item.count}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {item.percentage || Math.round(item.count / getSafeNumber(reportData.data.totalAssignments) * 100)}%
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                  <div
                                    className="bg-brand-500 h-2 rounded-full"
                                    style={{
                                      width: `${item.percentage || Math.round(item.count / getSafeNumber(reportData.data.totalAssignments) * 100)}%`
                                    }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Empty State */}
                    {(activeReport === 'inventory' && (!reportData.data.byCategory || reportData.data.byCategory.length === 0)) ||
                      (activeReport === 'maintenance' && (!reportData.data.byCategory || reportData.data.byCategory.length === 0)) ||
                      (activeReport === 'depreciation' && (!reportData.data.byCategory || reportData.data.byCategory.length === 0)) ||
                      (activeReport === 'assignments' && (!reportData.data.byDepartment || reportData.data.byDepartment.length === 0)) ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No data available for this report</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}