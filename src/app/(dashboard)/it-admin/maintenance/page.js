"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  MoreVertical,
  X
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { itDeviceService } from '@/services/it-admin-services/itDevice.service';
import Pagination from '@/components/common/Pagination';

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const statusParam =
          statusFilter === 'In Progress'
            ? 'in_progress'
            : statusFilter === 'Repaired'
            ? 'repaired'
            : statusFilter === 'Not Repairable'
            ? 'not_repairable'
            : 'all';

        const res = await itDeviceService.getMaintenance({
          page: currentPage,
          limit: itemsPerPage,
          repairStatus: statusParam,
          search: searchTerm?.trim() || undefined
        });

        if (res?.success) {
          setMaintenanceRecords(res.data?.maintenanceRecords || []);
          setPagination(
            res.data?.pagination || {
              currentPage,
              totalPages: 1,
              totalItems: (res.data?.maintenanceRecords || []).length,
              itemsPerPage
            }
          );
        }
      } catch (e) {
        toast.error(e?.message || 'Failed to load maintenance records');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [statusFilter, searchTerm, currentPage, itemsPerPage]);

  // Reset to first page on filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  const totalCost = useMemo(
    () => maintenanceRecords.reduce((sum, r) => sum + (Number(r.repairCost) || 0), 0),
    [maintenanceRecords]
  );

  const getStatusBadge = (status) => {
    const badges = {
      'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Repaired': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Not Repairable': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const MaintenanceRowActions = ({ record }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);

    const MENU_WIDTH = 176; // w-44
    const GAP = 8;

    useEffect(() => {
      const onMouseDown = (e) => {
        if (!isOpen) return;
        const target = e.target;
        if (target?.closest?.(`[data-maintenance-actions="${record.id}"]`)) return;
        setIsOpen(false);
      };
      const onKeyDown = (e) => {
        if (e.key === 'Escape') setIsOpen(false);
      };

      document.addEventListener('mousedown', onMouseDown);
      document.addEventListener('keydown', onKeyDown);
      return () => {
        document.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('keydown', onKeyDown);
      };
    }, [isOpen, record.id]);

    useEffect(() => {
      if (!isOpen) return;
      const btn = buttonRef?.current;
      if (!btn) return;

      const compute = () => {
        const rect = btn.getBoundingClientRect();
        let left = rect.right - MENU_WIDTH;
        let top = rect.bottom + GAP;

        const minLeft = 8;
        const maxLeft = window.innerWidth - MENU_WIDTH - 8;
        left = Math.min(Math.max(left, minLeft), Math.max(maxLeft, minLeft));

        const approxMenuHeight = record.repairStatus === 'In Progress' ? 96 : 52;
        if (top + approxMenuHeight > window.innerHeight - 8) {
          top = rect.top - approxMenuHeight - GAP;
        }
        top = Math.max(top, 8);

        setMenuPos({ top, left });
      };

      compute();
      window.addEventListener('resize', compute);
      window.addEventListener('scroll', compute, true);
      return () => {
        window.removeEventListener('resize', compute);
        window.removeEventListener('scroll', compute, true);
      };
    }, [isOpen, record.repairStatus]);

    return (
      <div className="relative inline-block" data-maintenance-actions={record.id}>
        <button
          ref={buttonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((v) => !v);
          }}
          className="p-2 text-gray-600 hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/10 rounded-lg transition-all"
          title="Actions"
        >
          <MoreVertical size={18} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />

            <div
              className="fixed z-[100] w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
            >
              <button
                type="button"
                onClick={() => {
                  handleViewDetails(record);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Eye size={16} />
                View
              </button>

              {record.repairStatus === 'In Progress' && (
                <Link
                  href={`/it-admin/maintenance/${record.id}/edit`}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Edit size={16} />
                  Edit
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Breadcrumb
          items={[
            { label: "IT Admin", href: "/it-admin" },
            { label: "Maintenance", href: "/it-admin/maintenance" },
          ]}
        />

        {/* Header */}
        <div className="mt-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[hsl(var(--primary))] rounded-xl">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Maintenance Management
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Track device repairs and maintenance lifecycle
              </p>
            </div>
            <Link
              href="/it-admin/maintenance/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              New Maintenance Request
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by device, issue, or vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="all">All Status</option>
                <option value="In Progress">In Progress</option>
                <option value="Repaired">Repaired</option>
                <option value="Not Repairable">Not Repairable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Maintenance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading && (
            <div className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              Loading maintenance records...
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Completion
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {maintenanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {record.deviceSerial}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {record.deviceBrand} {record.deviceModel}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {record.issueDescription}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Reported: {new Date(record.issueReportDate).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {record.repairVendor}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ₹{(record.repairCost || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(record.repairStatus)}`}>
                        {record.repairStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {record.completionDate ? new Date(record.completionDate).toLocaleDateString() : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <MaintenanceRowActions record={record} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination + totals */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-end">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page Cost: <span className="font-semibold text-gray-900 dark:text-white">
                  ₹{totalCost.toLocaleString()}
                </span>
              </p>
            </div>
            <Pagination
              currentPage={pagination.currentPage || currentPage}
              totalItems={pagination.totalItems || 0}
              itemsPerPage={pagination.itemsPerPage || itemsPerPage}
              onPageChange={(p) => setCurrentPage(p)}
              onItemsPerPageChange={(n) => {
                setItemsPerPage(n);
                setCurrentPage(1);
              }}
              itemsPerPageOptions={[10, 20, 30, 40, 50, 100, 200]}
            />
          </div>
        </div>

        {/* Maintenance Details Modal */}
        {showDetailsModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Maintenance Details
                  </h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Device</label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{selectedRecord.deviceSerial}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedRecord.deviceBrand} {selectedRecord.deviceModel}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedRecord.repairStatus}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Issue</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedRecord.issueDescription}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Issue Report Date</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {selectedRecord.issueReportDate ? new Date(selectedRecord.issueReportDate).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Completion Date</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {selectedRecord.completionDate ? new Date(selectedRecord.completionDate).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Vendor</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedRecord.repairVendor || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Cost</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">₹{(selectedRecord.repairCost || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
