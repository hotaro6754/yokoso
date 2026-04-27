"use client";
import { PlusCircle } from 'lucide-react';
import LeaveRequestsTable from '../components/LeaveRequestsTable';
import LeaveRequestsStatsCards from '../components/LeaveRequestsStatsCards';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LeaveRequests() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to refresh data
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      {/* Breadcrumb with Add Leave Request button */}
      <Breadcrumb
        pages={[
          { name: 'HR', href: '/hr' },
          { name: 'Leave', href: '/hr/leave' },
          { name: 'Requests', href: '#' },
        ]}
        rightContent={
          <Link
            href="/hr/leave/requests/add"
            className="inline-flex items-center gap-2 rounded-sm bg-brand-500 px-4 py-2.5 text-white hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-semibold"
          >
            <PlusCircle size={18} /> Add Leave Request
          </Link>
        }
      />

      <div className="mt-6">
        <LeaveRequestsStatsCards key={`stats-${refreshTrigger}`} />
      </div>

      <div className="mt-6">
        <LeaveRequestsTable key={`table-${refreshTrigger}`} onRefresh={refreshData} />
      </div>
    </div>
  );
}