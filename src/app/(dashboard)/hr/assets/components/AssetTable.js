"use client";
import { useState } from 'react';
import {
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  Filter,
  Eye
} from 'lucide-react';
import ActionDropdown from '../../../master-admin/components/ActionDropdown';
import Pagination from '@/components/common/Pagination';
import CustomDropdown from '../../leave/components/CustomDropdown';

export default function AssetTable({
  assets,
  loading,
  filters,
  onFilterChange,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
    setCurrentPage(1);
  };

  // Pagination Logic
  const totalItems = assets.length;
  // Slice data for current page
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const currentAssets = assets.slice(indexOfFirstItem, indexOfFirstItem + itemsPerPage);

  const statusColors = {
    available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    assigned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    retired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  const conditionColors = {
    excellent: 'text-green-600 dark:text-green-400 font-medium',
    good: 'text-blue-600 dark:text-blue-400 font-medium',
    fair: 'text-orange-600 dark:text-orange-400 font-medium',
    poor: 'text-red-600 dark:text-red-400 font-medium'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-1/3 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-sm border border-gray-200 dark:border-gray-700 mb-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Package size={16} />
            <span className="font-medium">Total Assets: {totalItems}</span>
          </div>

          <div className="flex flex-wrap gap-2 items-center w-full lg:w-auto">
            <div className="relative flex-grow lg:flex-grow-0">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="h-9 w-full lg:w-64 rounded-sm border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 outline-none transition-all"
              />
            </div>

            <CustomDropdown
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'Laptop', label: 'Laptop' },
                { value: 'Mobile', label: 'Mobile' },
                { value: 'Desktop', label: 'Desktop' },
                { value: 'Other', label: 'Other' }
              ]}
              placeholder="Category"
              className="w-[140px] h-9 [&>button]:h-9 [&>button]:text-sm"
            />

            <CustomDropdown
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'available', label: 'Available' },
                { value: 'assigned', label: 'Assigned' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'retired', label: 'Retired' }
              ]}
              placeholder="Status"
              className="w-[120px] h-9 [&>button]:h-9 [&>button]:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-900 dark:bg-brand-900/20 dark:text-brand-100 border-b border-brand-100 dark:border-brand-800">
            <tr>
              <th className="px-4 py-3 font-medium text-left">Asset Name</th>
              <th className="px-4 py-3 font-medium text-left">Category</th>
              <th className="px-4 py-3 font-medium text-left">Serial Number</th>
              <th className="px-4 py-3 font-medium text-left">Model</th>
              <th className="px-4 py-3 font-medium text-left">Status</th>
              <th className="px-4 py-3 font-medium text-left">Condition</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {currentAssets.length > 0 ? (
              currentAssets.map((asset) => (
                <tr key={asset.id} className="text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    {asset.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{asset.category}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{asset.serialNumber}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{asset.model}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full ${statusColors[asset.status] || 'bg-gray-100 text-gray-600'}`}>
                      {asset.status ? asset.status : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={conditionColors[asset.condition] || 'text-gray-500'}>
                      {asset.condition ? asset.condition.charAt(0).toUpperCase() + asset.condition.slice(1) : 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end">
                      <ActionDropdown
                        customActions={[
                          { label: 'View Details', href: `/hr/assets/view/${asset.id}`, icon: Eye }
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                    <p>No assets found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          showWhenEmpty={true}
        />
      </div>
    </div>
  );
}