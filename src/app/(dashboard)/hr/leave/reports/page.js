"use client";
import { useState } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import LeaveReportsHeader from './components/LeaveReportsHeader';
import LeaveStatsCards from './components/LeaveStatsCards';
import LeaveTrendChart from './components/LeaveTrendChart';
import LeaveByTypeChart from './components/LeaveByTypeChart';
import LeaveByDepartmentChart from './components/LeaveByDepartmentChart';
import EmployeeLeaveTable from './components/EmployeeLeaveTable';
import ReportFilters from './components/ReportFilters';
import SavedReportsList from './components/SavedReportsList';

export default function LeaveReports() {
  const [filters, setFilters] = useState({
    dateRange: 'this_month',
    department: 'all',
    employee: 'all'
  });
  const [savedReportsKey, setSavedReportsKey] = useState(0);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleReportSaved = () => {
    setSavedReportsKey(prev => prev + 1);
  };

  const handleApplyReport = (savedFilters) => {
    setFilters(savedFilters);
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        pages={[
          { name: 'HR', href: '/hr' },
          { name: 'Leave', href: '/hr/leave' },
          { name: 'Reports', href: '#' },
        ]}
      />

      <LeaveReportsHeader filters={filters} onReportSaved={handleReportSaved} />

      <div className="mt-6">
        <ReportFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      <div className="mt-6">
        <SavedReportsList key={savedReportsKey} onApplyReport={handleApplyReport} />
      </div>

      <div className="mt-6">
        <LeaveStatsCards filters={filters} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <LeaveTrendChart filters={filters} />
        <LeaveByTypeChart filters={filters} />
      </div>

      <div className="mt-6">
        <LeaveByDepartmentChart filters={filters} />
      </div>

      <div className="mt-6">
        <EmployeeLeaveTable filters={filters} showImportExport />
      </div>
    </div>
  );
}
