"use client";

import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import { 
  History, 
  Search, 
  Filter,
  Calendar,
  User,
  Package,
  Wrench,
  CheckCircle2,
  XCircle,
  Activity,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { itDeviceService } from '@/services/it-admin-services/itDevice.service';
import Pagination from '@/components/common/Pagination';

export default function DeviceHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  const [historyRecords, setHistoryRecords] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const eventParam =
          eventFilter === 'Marked Damaged'
            ? 'marked_damaged'
            : eventFilter === 'Sent for Repair'
            ? 'sent_for_repair'
            : eventFilter === 'Beyond Repair'
            ? 'retired'
            : eventFilter !== 'all'
            ? eventFilter.toLowerCase().replaceAll(' ', '_')
            : 'all';

        const res = await itDeviceService.getHistory({
          page: currentPage,
          limit: itemsPerPage,
          eventType: eventParam,
          search: searchTerm?.trim() || undefined
        });

        if (res?.success) {
          setHistoryRecords(res.data?.history || []);
          setPagination(
            res.data?.pagination || {
              currentPage,
              totalPages: 1,
              totalItems: (res.data?.history || []).length,
              itemsPerPage
            }
          );
        }
      } catch (e) {
        toast.error(e?.message || 'Failed to load device history');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [searchTerm, eventFilter, currentPage, itemsPerPage]);

  // Reset to first page on filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, eventFilter, deviceFilter]);

  // Device filter is client-side (limited to current page items)
  const filteredRecords =
    deviceFilter === 'all' ? historyRecords : historyRecords.filter((r) => r.deviceSerial === deviceFilter);

  const getEventIcon = (eventType) => {
    const icons = {
      'Created': Package,
      'Assigned': User,
      'Returned': Package,
      'Marked Damaged': AlertCircle,
      'Sent for Repair': Wrench,
      'Repaired': CheckCircle2,
      'Retired': XCircle
    };
    return icons[eventType] || Activity;
  };

  const getEventColor = (eventType) => {
    const colors = {
      'Created': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'Assigned': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Returned': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'Marked Damaged': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'Sent for Repair': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      'Repaired': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'Retired': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[eventType] || 'bg-gray-100 text-gray-700';
  };

  const uniqueDevices = [...new Set(historyRecords.map(r => r.deviceSerial))];
  const uniqueEvents = [...new Set(historyRecords.map(r => r.eventType))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Breadcrumb
          items={[
            { label: "IT Admin", href: "/it-admin" },
            { label: "Device History", href: "/it-admin/history" },
          ]}
        />

        {/* Header */}
        <div className="mt-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[hsl(var(--primary))] rounded-xl">
              <History className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Device History Log
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Complete audit trail of all device lifecycle events
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Event Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="all">All Events</option>
                {uniqueEvents.map(event => (
                  <option key={event} value={event}>{event}</option>
                ))}
              </select>
            </div>

            {/* Device Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] dark:bg-gray-700 dark:text-white appearance-none"
              >
                <option value="all">All Devices</option>
                {uniqueDevices.map(device => (
                  <option key={device} value={device}>{device}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* History Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          {loading && (
            <div className="pb-4 text-sm text-gray-600 dark:text-gray-400">
              Loading history...
            </div>
          )}
          <div className="space-y-4">
            {filteredRecords.map((record, index) => {
              const Icon = getEventIcon(record.eventType);
              const isLast = index === filteredRecords.length - 1;
              
              return (
                <div key={record.id} className="flex gap-4">
                  {/* Timeline Line */}
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-lg ${getEventColor(record.eventType)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {!isLast && (
                      <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getEventColor(record.eventType)}`}>
                            {record.eventType}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {record.deviceSerial}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {record.description}
                        </p>
                        {record.details && (
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                            {Object.entries(record.details).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                <span>{value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(record.timestamp).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <User className="h-3 w-3" />
                          {record.performedBy}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No history records found</p>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
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
    </div>
  );
}
