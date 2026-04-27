'use client';

import React, { useEffect, useState, useCallback } from "react";
import Breadcrumb from '@/components/common/Breadcrumb';
import { Building2, Plus, Search, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';
import TablePagination from '@/components/common/TablePagination';
import CompanyDeleteDialog from './components/CompanyDeleteDialog';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import ActionDropdown from '@/app/(dashboard)/master-admin/components/ActionDropdown';

export default function CompanyPage() {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null, name: '' });

  // 1. Fetch Companies from Backend
  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
      };

      const response = await apiClient.get('/master-admin/company', { params });

      // Map response based on your controller: successResponse(res, { companies, pagination })
      const { companies: fetchedCompanies, pagination } = response.data;

      setCompanies(fetchedCompanies || []);
      setTotalCompanies(pagination?.total || 0);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      toast.error("Failed to load company data");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  // 2. Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchCompanies]);

  // Pagination Helper logic
  const totalPages = Math.ceil(totalCompanies / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(indexOfFirstItem + itemsPerPage, totalCompanies);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const openDelete = (company) => {
    setDeleteDialog({ isOpen: true, id: company.id, name: company.name });
  };

  const closeDelete = () => {
    setDeleteDialog({ isOpen: false, id: null, name: '' });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await apiClient.delete(`/master-admin/company/${deleteDialog.id}`);
      toast.success("Company deleted successfully");
      fetchCompanies();
      closeDelete();
    } catch (error) {
      toast.error("Error deleting company");
    }
  };

  // Helper for dynamic status logic
  const getCompanyDetails = (company) => {
    const activeSub = company.companySubscriptions?.[0];
    const planName = activeSub?.subscription?.name || company.plan || 'Standard';

    // Statuses
    let subRawStatus = activeSub?.status || 'NONE';
    const compRawStatus = company.status || 'INACTIVE';

    if (subRawStatus === 'NONE' && company.trialEndsAt) {
      subRawStatus = 'TRIAL';
    }

    const formatStatus = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

    const subscriptionStatus = formatStatus(subRawStatus);
    const companyStatus = formatStatus(compRawStatus);

    // Expiration
    let daysLeft = null;
    let endDate = activeSub?.endDate || company.trialEndsAt;
    
    if (endDate) {
      const end = new Date(endDate);
      const now = new Date();
      const diff = end - now;
      daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    const onboardingStatus = company.onboardingStatus || 'PENDING';
    return { planName, subscriptionStatus, companyStatus, onboardingStatus, daysLeft };
  };

  const getStatusBadgeClasses = (status) => {
    const s = status.toLowerCase();
    if (s === 'active') return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    if (s === 'trial') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    if (s === 'suspended') return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
  };

  const getPlanBadgeClasses = (planName) => {
    const name = planName?.toUpperCase() || '';
    if (name.includes('ENTERPRISE')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    if (name.includes('PREMIUM') || name.includes('PROFESSIONAL')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400';
    return 'bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300';
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: 'Master Admin', href: '/master-admin/dashboard' },
              { label: 'Company', href: '/master-admin/company' }
            ]}
          />
          <Link
            href="/master-admin/company/add"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Company</span>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, subdomain, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter size={20} />
            <span className="dark:text-white">Filter</span>
          </button>
        </div>

        {/* Companies Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
            <p className="text-sm text-gray-500">Loading companies...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Company Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Subdomain</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase tracking-wider">City, Country</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Sub. Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Comp. Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Onboarding</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Expire In</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {companies.length > 0 ? (
                    companies.map((company) => {
                      const { planName, subscriptionStatus, companyStatus, daysLeft } = getCompanyDetails(company);
                      const isExpiringSoon = daysLeft !== null && daysLeft < 30;

                      return (
                        <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Building2 size={20} className="text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{company.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-900 dark:text-white">{company.subdomain}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                            {(company.city || '—')}{company.country ? `, ${company.country}` : ''}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanBadgeClasses(planName)}`}>
                              {planName}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(subscriptionStatus)}`}>
                              {subscriptionStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(companyStatus)}`}>
                              {companyStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              company.onboardingStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                              company.onboardingStatus === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {company.onboardingStatus || 'PENDING'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {daysLeft !== null ? (
                              <span className={`text-sm font-bold ${isExpiringSoon ? 'text-red-600' : 'text-green-600 dark:text-green-400'}`}>
                                {daysLeft} Days
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <ActionDropdown
                              viewUrl={`/master-admin/company/${company.id}`}
                              editUrl={`/master-admin/company/${company.id}/edit`}
                              onDelete={() => openDelete(company)}
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No companies found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && companies.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCompanies}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>

      <CompanyDeleteDialog
        isOpen={deleteDialog.isOpen}
        companyName={deleteDialog.name}
        onCancel={closeDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}