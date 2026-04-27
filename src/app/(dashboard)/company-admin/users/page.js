'use client';

import React from 'react';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { Toaster } from 'sonner';

import UserTable from '@/app/(dashboard)/super-admin/users/components/UserTable';

export default function UsersListPage() {
    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-transparent p-6 space-y-6">
            <Toaster position="top-right" />

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <nav className="text-sm text-gray-500 dark:text-[#BBBDEC] mb-1">
                        <Link href="/company-admin/dashboard" className="hover:text-primary-600 dark:hover:text-[#E0E2FE] transition-colors">Company Admin</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium dark:text-[#E0E2FE]">Users</span>
                    </nav>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-[#E0E2FE] tracking-tight">User Management</h1>
                </div>

                <Link
                    href="/company-admin/users/add"
                    className="group inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:scale-[1.02] active:scale-95 dark:bg-[#BBBDEC] dark:text-[#111827] dark:hover:bg-[#E0E2FE]"
                >
                    <UserPlus className="h-4 w-4" />
                    <span>Add New User</span>
                </Link>
            </div>

            {/* Main Content */}
            <UserTable />
        </div>
    );
}
