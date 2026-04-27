'use client';

import React, { useState, useEffect, useCallback } from "react";
import Link from 'next/link';
import Breadcrumb from '@/components/common/Breadcrumb';
import ActionDropdown from '@/app/(dashboard)/master-admin/components/ActionDropdown';
import {
  Users,
  Search,
  Filter,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Trash2,
  Loader2,
} from 'lucide-react';
import TablePagination from '@/components/common/TablePagination';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '@/lib/dateUtils';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    plan: 'All',
    paymentStatus: 'All',
    paymentType: 'All',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    customerId: null,
    customerName: ''
  });

  // Fetch Customers from API
  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        status: filters.status !== 'All' ? filters.status : undefined,
        plan: filters.plan !== 'All' ? filters.plan : undefined,
      };

      const response = await apiClient.get('/master-admin/customers', { params });

      // Map data and calculate status locally if not done by backend
      const rawData = response.data.customers || [];
      const processedData = rawData.map(customer => {
        // Extract active subscription details
        const activeSub = customer.companySubscriptions?.[0]; // Assuming order by createdAt desc in backend
        const planDetails = activeSub?.subscription;

        const paid = customer.paidAmount || 0;
        const total = planDetails ? planDetails.price : (customer.totalAmount || 0); // Use plan price if available

        // Determine payment status based on whether a plan exists
        // If there is a plan, we might assume it's "Active" or check payment/invoice logic if that existed
        // For now, let's keep it simple: if there is a plan, show it as 'Paid' or 'Recurring'
        let pStatus = 'Pending';
        if (paid >= total && total > 0) pStatus = 'Paid';
        else if (paid > 0) pStatus = 'Partially Paid';
        else if (planDetails) pStatus = 'Recurring'; // Just a placeholder status for subscription based

        return {
          ...customer,
          status: customer.status || activeSub?.status || 'INACTIVE', // Prioritize direct company status
          employees: customer.employeeCount || customer.employees || 0, // Map employeeCount
          planName: planDetails?.name || customer.plan || 'Standard',
          planPrice: planDetails?.price || customer.totalAmount || 0,
          planCurrency: planDetails?.currency || 'INR',
          billingCycle: planDetails?.billingCycle || customer.billingCycle || 'Monthly',
          paymentStatus: pStatus,
          // pendingAmount: total - paid
        };
      });

      setCustomers(processedData);
      setTotalCustomers(response.data.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      toast.error("Error loading customers");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, filters.status, filters.plan]);

  // Handle Search and Filter changes with Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  const clearFilters = () => {
    setFilters({ status: 'All', plan: 'All', paymentStatus: 'All', paymentType: 'All' });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCustomers / itemsPerPage);
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = Math.min(indexOfFirstItem + itemsPerPage, totalCustomers);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleItemsPerPageChange = (val) => {
    setItemsPerPage(val);
    setCurrentPage(1);
  };

  const openDeleteDialog = (customerId, customerName) => {
    setDeleteDialog({ isOpen: true, customerId, customerName });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, customerId: null, customerName: '' });
  };

  const handleDeleteCustomer = async () => {
    try {
      await apiClient.delete(`/master-admin/customers/${deleteDialog.customerId}`);
      toast.success('Customer deleted successfully');
      fetchCustomers();
      closeDeleteDialog();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'TRIAL':
      case 'Trial': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'SUSPENDED':
      case 'Suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'INACTIVE':
      case 'Inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Partially Paid': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Pending': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getPaymentTypeDisplay = (type) => {
    switch (type) {
      case 'full': return 'Full Payment';
      case 'half': return 'Half Payment';
      case 'monthly': return 'Monthly';
      default: return type || 'N/A';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: currency, minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== 'All').length;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <Breadcrumb
          items={[
            { label: 'Master Admin', href: '/master-admin/dashboard' },
            { label: 'Customers', href: '/master-admin/customers' }
          ]}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalCustomers}</p>
              </div>
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
          {/* Active/Trial counts can be updated if backend provides a summary object */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Customers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {customers.filter(c => c.status === 'ACTIVE' || c.status === 'Active').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="text-green-600" size={20} />
              </div>
            </div>
          </div>
          {/* Add more stats mapping here */}
        </div>

        {/* Search and Filter */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-sm bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-50 transition-colors"
              >
                <Filter size={20} />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-[11px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {isFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                  <div className="absolute right-0 mt-2 w-[320px] z-50 rounded-xl border border-gray-200 bg-white dark:bg-gray-800 shadow-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">Filters</div>
                      <button onClick={() => setIsFilterOpen(false)} className="p-1 rounded-md hover:bg-gray-100 text-gray-500"><X size={16} /></button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                        >
                          {['All', 'ACTIVE', 'TRIAL', 'INACTIVE', 'SUSPENDED'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      {/* Plan Filter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Plan</label>
                        <select
                          value={filters.plan}
                          onChange={(e) => setFilters((f) => ({ ...f, plan: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
                        >
                          <option value="All">All</option>
                          {['ENTERPRISE', 'PREMIUM', 'STANDARD', 'FREE'].map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <button onClick={clearFilters} className="text-sm font-semibold text-gray-600 hover:text-gray-900">Clear</button>
                        <button onClick={() => setIsFilterOpen(false)} className="px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold">Done</button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <Link href="/master-admin/customers/add" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-sm hover:bg-primary-700 transition-colors">
              <Users size={20} />
              <span>Add Customer</span>
            </Link>
          </div>
        </div>

        {/* Customers Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
            <p className="text-sm text-gray-500">Fetching customer data...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full">
                <thead className="bg-primary-50 dark:bg-primary-900/20 border-b border-primary-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-primary-700 dark:text-white uppercase tracking-wider">Company Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-primary-700 dark:text-white uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-primary-700 dark:text-white uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-primary-700 dark:text-white uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-primary-700 dark:text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-primary-700 dark:text-white uppercase tracking-wider">Billing</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-primary-700 dark:text-white uppercase tracking-wider">Since</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-primary-700 dark:text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-gray-700 dark:text-gray-300">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Building2 size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white block">{customer.name}</span>
                              <span className="text-xs text-gray-500">{customer.employees || 0} employees</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm"><Mail size={14} />{customer.contactEmail || customer.email}</div>
                            <div className="flex items-center gap-2 text-sm"><Phone size={14} />{customer.phone || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm"><MapPin size={14} />{customer.address || customer.city || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              {customer.planName}
                            </span>
                            <div className="text-xs text-gray-500">{customer.billingCycle}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white block">
                              {formatCurrency(customer.planPrice, customer.planCurrency)}
                            </span>
                            {/* 
                            <div className={`text-[10px] font-bold uppercase ${customer.paymentStatus === 'Paid' ? 'text-green-600' : 'text-orange-500'}`}>
                              {customer.paymentStatus}
                            </div>
                            */}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{formatDate(customer.createdAt)}</td>
                        <td className="px-6 py-4 text-right">
                          <ActionDropdown
                            viewUrl={`/master-admin/customers/${customer.id}`}
                            editUrl={`/master-admin/customers/${customer.id}/edit`}
                            onDelete={() => openDeleteDialog(customer.id, customer.name)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No customers found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && customers.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalCustomers}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteDialog.isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4 border dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg"><Trash2 size={20} className="text-red-600" /></div>
              <h3 className="text-lg font-semibold dark:text-white">Delete Customer</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Permanently delete <strong>{deleteDialog.customerName}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={closeDeleteDialog} className="px-4 py-2 border rounded-lg dark:text-gray-300">Cancel</button>
              <button onClick={handleDeleteCustomer} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"><Trash2 size={16} />Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}