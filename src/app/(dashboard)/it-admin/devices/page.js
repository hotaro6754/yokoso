"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import { 
  Laptop, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  CheckCircle2,
  AlertCircle,
  Package,
  Wrench,
  Activity,
  Smartphone,
  Monitor,
  MoreVertical,
  X,
  UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { itDeviceService } from '@/services/it-admin-services/itDevice.service';
import Pagination from '@/components/common/Pagination';

export default function DeviceManagementPage() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [devices, setDevices] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Initialize filters from URL (dashboard links)
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (!filter) return;

    if (filter === 'new') setConditionFilter('New');
    if (filter === 'good') setConditionFilter('Good');
    if (filter === 'damaged') setConditionFilter('Damaged');
    if (filter === 'retired') setStatusFilter('Retired');
  }, [searchParams]);

  // Fetch devices (server-side filtering + lightweight client-side filtering)
  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage
        };

        if (statusFilter !== 'all') params.lifecycleStatus = statusFilter.toLowerCase();
        if (conditionFilter !== 'all') params.condition = conditionFilter.toLowerCase().replaceAll(' ', '_');
        if (searchTerm) params.search = searchTerm;

        const res = await itDeviceService.getDevices(params);
        if (res?.success) {
          setDevices(res.data?.devices || []);
          setPagination(
            res.data?.pagination || {
              currentPage,
              totalPages: 1,
              totalItems: (res.data?.devices || []).length,
              itemsPerPage
            }
          );
        }
      } catch (e) {
        toast.error(e?.message || 'Failed to load devices');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [searchTerm, statusFilter, conditionFilter, currentPage, itemsPerPage]);

  // Reset to first page on filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, conditionFilter]);

  const getStatusBadge = (status) => {
    const badges = {
      'Available': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Assigned': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Maintenance': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Retired': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getConditionBadge = (condition) => {
    const badges = {
      'New': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Good': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Used': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Damaged': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Beyond Repair': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return badges[condition] || 'bg-gray-100 text-gray-700';
  };

  const getDeviceIcon = (type) => {
    switch(type) {
      case 'Laptop': return <Laptop className="h-5 w-5" />;
      case 'Mobile': return <Smartphone className="h-5 w-5" />;
      case 'Desktop': return <Monitor className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const handleViewDetails = (device) => {
    setSelectedDevice(device);
    setShowDetailsModal(true);
  };

  const DeviceRowActions = ({ device }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const buttonRef = useRef(null);

    const MENU_WIDTH = 176; // w-44
    const GAP = 8; // spacing below button

    // Close on outside click / ESC
    useEffect(() => {
      const onMouseDown = (e) => {
        if (!isOpen) return;
        const target = e.target;
        // If click is on menu/button, ignore.
        if (target?.closest?.(`[data-device-actions="${device.id}"]`)) return;
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
    }, [isOpen, device.id]);

    // Reposition menu on open + on resize/scroll
    useEffect(() => {
      if (!isOpen) return;
      const btn = buttonRef?.current;
      if (!btn) return;

      const compute = () => {
        const rect = btn.getBoundingClientRect();
        let left = rect.right - MENU_WIDTH;
        let top = rect.bottom + GAP;

        // Keep within viewport
        const minLeft = 8;
        const maxLeft = window.innerWidth - MENU_WIDTH - 8;
        left = Math.min(Math.max(left, minLeft), Math.max(maxLeft, minLeft));

        const approxMenuHeight = 96; // enough for two rows
        if (top + approxMenuHeight > window.innerHeight - 8) {
          top = rect.top - approxMenuHeight - GAP;
        }
        top = Math.max(top, 8);

        setMenuPos({ top, left });
      };

      compute();

      window.addEventListener('resize', compute);
      // capture scroll from any scroll container
      window.addEventListener('scroll', compute, true);
      return () => {
        window.removeEventListener('resize', compute);
        window.removeEventListener('scroll', compute, true);
      };
    }, [isOpen]);

    return (
      <div className="relative inline-block" data-device-actions={device.id}>
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
            {/* Backdrop */}
            <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />

            {/* Menu (fixed so it can overflow table container) */}
            <div
              className="fixed z-[100] w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
            >
              <button
                type="button"
                onClick={() => {
                  handleViewDetails(device);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Eye size={16} />
                View
              </button>

              <Link
                href={`/it-admin/devices/${device.id}/edit`}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Edit size={16} />
                Edit
              </Link>
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
            { label: "Device Management", href: "/it-admin/devices" },
          ]}
        />

        {/* Header */}
        <div className="mt-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[hsl(var(--primary))] rounded-xl">
                  <Laptop className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Device Management
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Track and manage all IT assets with condition and status monitoring
              </p>
            </div>
            <Link
              href="/it-admin/devices/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              Add Device
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search devices..."
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
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            {/* Condition Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="all">All Conditions</option>
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Used">Used</option>
                <option value="Damaged">Damaged</option>
                <option value="Beyond Repair">Beyond Repair</option>
              </select>
            </div>
          </div>
        </div>

        {/* Devices Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading && (
            <div className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              Loading devices...
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
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[hsl(var(--primary))]/10 rounded-lg">
                          {getDeviceIcon(device.deviceType)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {device.serialNumber}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {device.deviceType === 'Other'
                              ? (device.deviceName || '—')
                              : `${device.brand || ''} ${device.model || ''}`.trim() || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {device.deviceType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getConditionBadge(device.condition)}`}>
                        {device.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(device.lifecycleStatus)}`}>
                        {device.lifecycleStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {device.assignedTo ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {device.assignedTo.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {device.assignedTo.employeeId}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {device.location}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <DeviceRowActions device={device} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
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

        {/* Device Details Modal */}
        {showDetailsModal && selectedDevice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Device Details
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
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Serial Number</label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{selectedDevice.serialNumber}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Device Type</label>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{selectedDevice.deviceType}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Brand</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedDevice.brand}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Model</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedDevice.model}</p>
                  </div>
                  {selectedDevice.deviceType === 'Other' && (
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Device Name</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedDevice.deviceName || '—'}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Purchase Date</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {selectedDevice.purchaseDate ? new Date(selectedDevice.purchaseDate).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Warranty Expiry</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {selectedDevice.warrantyExpiry ? new Date(selectedDevice.warrantyExpiry).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Condition</label>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mt-1 ${getConditionBadge(selectedDevice.condition)}`}>
                      {selectedDevice.condition}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusBadge(selectedDevice.lifecycleStatus)}`}>
                      {selectedDevice.lifecycleStatus}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Location</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedDevice.location}</p>
                  </div>
                  {selectedDevice.assignedTo && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Assigned To</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedDevice.assignedTo.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{selectedDevice.assignedTo.employeeId}</p>
                    </div>
                  )}
                </div>
                {selectedDevice.notes && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Notes</label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedDevice.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
