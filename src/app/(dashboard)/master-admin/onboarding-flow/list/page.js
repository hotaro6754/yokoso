'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Users,
  Building2,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  ArrowRight,
  Loader2,
  ChevronDown
} from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import TablePagination from '@/components/common/TablePagination';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function OnboardingFlowListPage() {
  const [flows, setFlows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchFlows = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        status: statusFilter || undefined
      };

      const response = await apiClient.get('/master-admin/onboarding-flow', { params });

      if (response.data.success) {
        setFlows(response.data.flows || []);
        setTotalItems(response.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch onboarding flows:', error);
      toast.error('Failed to load onboarding flows');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFlows();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchFlows]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: 'Master Admin', href: '/master-admin/dashboard' },
              { label: 'Onboarding Flow', href: '/master-admin/onboarding-flow' },
              { label: 'All Flows', href: '/master-admin/onboarding-flow/list' },
            ]}
          />
          <Link
            href="/master-admin/onboarding-flow/add"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 font-medium text-sm"
          >
            <Users size={18} />
            <span>New Onboarding</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">All Status</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
              <p className="text-gray-500 text-sm">Loading onboarding flows...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Progress</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Last Updated</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {flows.length > 0 ? (
                    flows.map((flow) => (
                      <tr key={flow.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                              {flow.companyName ? flow.companyName.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-white">{flow.companyName}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Building2 size={10} /> {flow.companyId ? `ID: ${flow.companyId}` : 'No ID'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(flow.status)}`}>
                            {flow.status === 'COMPLETED' && <CheckCircle2 size={12} className="mr-1" />}
                            {flow.status === 'IN_PROGRESS' && <Clock size={12} className="mr-1" />}
                            {flow.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full max-w-[100px]">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium">{flow.progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary-600 rounded-full transition-all duration-500"
                                style={{ width: `${flow.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {flow.subscriptionPlan || 'Not Selected'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(flow.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 transition-opacity">
                            <Link 
                              href={`/master-admin/onboarding-flow/${flow.id}`}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <ArrowRight size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No onboarding flows found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && flows.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(limit) => {
                setItemsPerPage(limit);
                setCurrentPage(1);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
