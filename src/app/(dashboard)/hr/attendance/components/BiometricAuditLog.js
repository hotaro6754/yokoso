"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Monitor,
  Tag,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  RefreshCw,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import biometricService from "@/services/hr-services/biometric.service";
import InputField from "@/components/form/input/InputField";
import ExportButtons from "./ExportButtons";

export default function BiometricAuditLog({ onBack }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 200, total: 0 });
  const [filters, setFilters] = useState({
    search: "",
    deviceId: "all",
    status: "all"
  });
  const [devices, setDevices] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportData, setExportData] = useState({ columns: [], rows: [] });

  useEffect(() => {
    fetchDevices();
    fetchLogs();
  }, [pagination.page, filters.deviceId, filters.status, filters.search]);

  const fetchDevices = async () => {
    try {
      const res = await biometricService.getDevices();
      setDevices(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load devices", err);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (filters.deviceId !== "all") params.deviceId = filters.deviceId;
      if (filters.status !== "all") params.isProcessed = filters.status === "processed";
      if (filters.search) params.search = filters.search; 

      const res = await biometricService.getLogs(params);
      if (res.data?.data) {
        setLogs(res.data.data);
        setPagination(prev => ({ ...prev, total: res.data.pagination?.total || 0 }));
      }
    } catch (err) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const exportColumns = ["Date", "Time", "Employee Name", "Biometric ID", "Machine", "Type", "Status"];

  const handleExport = async (exportType) => {
    setIsExporting(true);
    try {
      const params = { limit: "all" };
      if (filters.deviceId !== "all") params.deviceId = filters.deviceId;
      if (filters.status !== "all") params.isProcessed = filters.status === "processed";
      if (filters.search) params.search = filters.search;

      const res = await biometricService.getLogs(params);
      const allLogs = res.data?.data || [];
      
      const rows = allLogs.map(log => ({
        "Date": new Date(log.punchTime).toLocaleDateString(),
        "Time": new Date(log.punchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        "Employee Name": (log.userName && log.userName !== 'Unknown Employee') ? log.userName : `Bio ID #${log.biometricId}`,
        "Biometric ID": log.biometricId,
        "Machine": log.device?.name || "Unknown Machine",
        "Type": log.punchType || "CHECK",
        "Status": log.isProcessed ? "Synced" : "Raw Record"
      }));

      const { downloadCsv, downloadExcel } = await import("../../reports-analytics/components/reportExport");
      
      if (exportType === 'csv') {
        downloadCsv({ columns: exportColumns, rows, fileName: `Machine_Audit_Log_Full.csv` });
      } else {
        downloadExcel({ columns: exportColumns, rows, fileName: `Machine_Audit_Log_Full.xlsx` });
      }
      toast.success("Full report downloaded successfully");
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:bg-brand-50 hover:text-brand-600 transition-all group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Machine Audit Trail</h2>
            <p className="text-sm text-gray-500">Full history of raw punch data from all connected devices</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button 
             disabled={isExporting}
             onClick={() => handleExport('csv')}
             className="px-4 py-2.5 bg-brand-50 text-brand-700 font-bold rounded-xl flex items-center gap-2 hover:bg-brand-100 transition-all text-sm disabled:opacity-50"
           >
              <FileSpreadsheet size={16} />
              {isExporting ? "Fetching..." : "CSV"}
           </button>
           <button 
             disabled={isExporting}
             onClick={() => handleExport('excel')}
             className="px-4 py-2.5 bg-brand-50 text-brand-700 font-bold rounded-xl flex items-center gap-2 hover:bg-brand-100 transition-all text-sm disabled:opacity-50"
           >
              <RefreshCw size={16} className={isExporting ? "animate-spin" : ""} />
              {isExporting ? "Processing..." : "Excel"}
           </button>
           <button 
             onClick={fetchLogs}
             className="p-2.5 text-gray-400 hover:text-brand-600 transition-all border border-gray-100 rounded-xl ml-2"
           >
             <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
           </button>
        </div>
      </div>

      {/* Filters */}
       <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search Name or Bio ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 text-sm focus:ring-2 focus:ring-brand-500 transition-all outline-none"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          <select 
            className="px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            value={filters.deviceId}
            onChange={(e) => setFilters(prev => ({ ...prev, deviceId: e.target.value }))}
          >
            <option value="all">All Machines</option>
            {devices.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select 
            className="px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-brand-500"
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">All Logs</option>
            <option value="processed">Synced / Processed</option>
            <option value="raw">Raw / Unprocessed</option>
          </select>

          <button 
            onClick={() => { setFilters({ search: "", deviceId: "all", status: "all" }); setPagination(p => ({ ...p, page: 1 })); }}
            className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 text-sm font-bold transition-all"
          >
            <Filter size={16} />
            Clear Filters
          </button>
       </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Timestamp</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Employee / Bio ID</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Machine</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Type</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50 text-sm">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar size={12} className="text-gray-400" />
                        {new Date(log.punchTime).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                        <Clock size={12} className="text-gray-400" />
                        {new Date(log.punchTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 dark:text-white">
                          {log.userName && log.userName !== 'Unknown Employee'
                            ? log.userName
                            : 'Unknown'}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400">Bio ID: {log.biometricId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl">
                        <Monitor size={14} />
                      </div>
                      <span className="font-bold text-gray-700 dark:text-gray-300">{log.device?.name || "Unknown Machine"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                      log.punchType === 'IN' ? 'bg-emerald-50 text-emerald-600' : 
                      log.punchType === 'OUT' ? 'bg-rose-50 text-rose-600' : 
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {log.punchType || 'CHECK'}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {log.isProcessed ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                          <CheckCircle2 size={16} />
                          <span className="text-[11px] uppercase tracking-tighter">Synced</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-gray-400 font-bold">
                          <Tag size={16} />
                          <span className="text-[11px] uppercase tracking-tighter">Raw Record</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {!loading && logs.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center opacity-30">
                        <XCircle size={48} className="mb-4" />
                        <h4 className="text-xl font-black uppercase tracking-widest">No Logs Found</h4>
                        <p className="text-sm">Adjust your filters and try again</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase">
              Showing {logs.length} of {pagination.total} records
            </span>
            <div className="flex items-center gap-2">
              <button 
                disabled={pagination.page === 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                className="px-4 py-2 border border-gray-100 rounded-xl text-sm font-bold disabled:opacity-30 hover:bg-gray-50 transition-all"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                 {(() => {
                    const maxVisible = 7;
                    let startPage = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                    if (endPage - startPage + 1 < maxVisible) {
                      startPage = Math.max(1, endPage - maxVisible + 1);
                    }
                    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(pageNum => (
                      <button 
                        key={pageNum}
                        onClick={() => setPagination(p => ({ ...p, page: pageNum }))}
                        className={`w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                          pagination.page === pageNum ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ));
                 })()}
              </div>
              <button 
                disabled={pagination.page === totalPages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                className="px-4 py-2 border border-gray-100 rounded-xl text-sm font-bold disabled:opacity-30 hover:bg-gray-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
