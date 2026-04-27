// src/app/(dashboard)/hr/employees/page.js
"use client";
import { PlusCircle, Upload } from 'lucide-react';
import EmployeeTable from './components/EmployeesTable';
import EmployeeStatsCards from './components/EmployeeStatsCards';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function EmployeeDirectory() {
  const { user } = useAuth();
  const pathname = usePathname();
  const rawUserRole = user?.systemRole || user?.role || "";
  const userRole = String(rawUserRole)
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const isLdManagerRole =
    userRole === 'L_AND_D_MANAGER' ||
    userRole === 'L_D_MANAGER' ||
    userRole === 'LD_MANAGER' ||
    userRole === 'LND_MANAGER';
  const basePath = pathname?.startsWith('/it-admin')
    ? '/it-admin'
    : pathname?.startsWith('/payroll')
      ? '/payroll'
      : pathname?.startsWith('/finance-role')
        ? '/finance-role'
        : pathname?.startsWith('/manager')
          ? '/manager'
          : pathname?.startsWith('/dept-head')
            ? '/dept-head'
            : pathname?.startsWith('/ld')
              ? '/ld'
              : '/hr';
  const isViewOnly =
    userRole === 'PAYROLL_ADMIN' ||
    userRole === 'FINANCE_ADMIN' ||
    userRole === 'MANAGER' ||
    isLdManagerRole ||
    userRole === 'DEPT_HEAD' ||
    userRole === 'DEPARTMENT_HEAD' ||
    pathname?.startsWith('/payroll') ||
    pathname?.startsWith('/finance-role');

  const isLdEmployeesView = pathname?.startsWith('/ld') && isLdManagerRole;
  const allowFetch =
    userRole !== 'PAYROLL_ADMIN' &&
    userRole !== 'FINANCE_ADMIN' &&
    userRole !== 'MANAGER' &&
    (!isLdManagerRole || isLdEmployeesView);

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-3 sm:p-6 space-y-6">

      {/* Breadcrumb with Add Employee button */}
      <Breadcrumb
        rightContent={
          !isViewOnly && (
            <div className="flex items-center gap-2">
              <Link
                href={`${basePath}/employees/import`}
                className="inline-flex items-center gap-2 rounded-sm bg-white border border-gray-300 px-4 py-2.5 text-gray-700 hover:bg-gray-50 
                         dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm font-semibold"
              >
                <Upload size={18} /> Import / Export
              </Link>
              <Link
                href={`${basePath}/employees/add`}
                className="inline-flex items-center gap-2 rounded-sm bg-brand-500 px-4 py-2.5 text-white hover:bg-brand-600 
                         dark:bg-brand-500 dark:hover:bg-brand-600 transition-colors shadow-sm hover:shadow-md font-semibold"
              >
                <PlusCircle size={18} /> Add Employee
              </Link>
            </div>
          )
        }
      />

      {isViewOnly && !allowFetch && (
        <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          View-only access: employee data is restricted for this role.
        </div>
      )}

      {isViewOnly && allowFetch && isLdEmployeesView && (
        <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          View-only access: you can view and export employee data, but cannot add or edit employees.
        </div>
      )}

      <EmployeeStatsCards allowFetch={allowFetch} />

      <div className="bg-white rounded-sm shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700 overflow-visible">
        <EmployeeTable allowFetch={allowFetch} />
      </div>
    </div>
  );
}
