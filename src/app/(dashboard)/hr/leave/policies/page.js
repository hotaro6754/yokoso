"use client";
import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import PoliciesHeader from './comopnents/PoliciesHeader';
import PoliciesTable from './comopnents/PoliciesTable';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';


export default function LeavePolicies() {
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [applicableToFilter, setApplicableToFilter] = useState('all');
  const [accrualMethodFilter, setAccrualMethodFilter] = useState('all');

  // Initialize filters from URL search params if they exist
  useEffect(() => {
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const applicableTo = searchParams.get('applicableTo');
    const accrualMethod = searchParams.get('accrualMethod');
    
    if (search) setSearchTerm(search);
    if (status) setStatusFilter(status);
    if (applicableTo) setApplicableToFilter(applicableTo);
    if (accrualMethod) setAccrualMethodFilter(accrualMethod);
  }, [searchParams]);

  // Build search params object for the table
  const buildSearchParams = () => {
    const params = {};
    
    if (searchTerm && searchTerm !== '') params.search = searchTerm;
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
    if (applicableToFilter && applicableToFilter !== 'all') params.applicableTo = applicableToFilter;
    if (accrualMethodFilter && accrualMethodFilter !== 'all') params.accrualMethod = accrualMethodFilter;
    
    return params;
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        pages={[
          { name: 'HR', href: '/hr' },
          { name: 'Leave', href: '/hr/leave' },
          { name: 'Policies', href: '#' },
        ]}
        rightContent={
          <Link
            href="/hr/leave/policies/add"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition shadow-sm hover:shadow-md font-semibold"
          >
            <PlusCircle size={18} /> Add Policy
          </Link>
        }
      />

      <PoliciesHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        applicableToFilter={applicableToFilter}
        onApplicableToFilterChange={setApplicableToFilter}
        accrualMethodFilter={accrualMethodFilter}
        onAccrualMethodFilterChange={setAccrualMethodFilter}
      />

      <div className="mt-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <PoliciesTable
          searchParams={buildSearchParams()}
        />
      </div>
    </div>
  );
}