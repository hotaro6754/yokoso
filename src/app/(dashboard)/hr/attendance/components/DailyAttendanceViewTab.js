"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Calendar, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Fingerprint, 
  Activity, 
  Clock, 
  Users, 
  Edit, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Timer, 
  Loader2,
  Filter,
  ArrowRight,
  TrendingUp,
  Upload,
  X,
  FileDown,
  RefreshCw
} from "lucide-react";
import { attendanceService } from "@/services/hr-services/attendace.service";
import { toast } from "react-hot-toast";
import CorrectAttendanceModal from "./CorrectAttendanceModal";
import DatePickerField from "@/components/form/input/DatePickerField";
import ExportButtons from "./ExportButtons";
import AttendanceFilters from "./AttendanceFilters";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Pagination from "@/components/common/Pagination";

export default function DailyAttendanceViewTab() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dailyView, setDailyView] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter States
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [filterOptions, setFilterOptions] = useState({ departments: [], designations: [] });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationData, setPaginationData] = useState(null);

  const fetchFilterOptions = async () => {
    try {
      const res = await attendanceService.getFilterOptions();
      if (res.success) {
        setFilterOptions(res.data);
      }
    } catch (err) {
      console.error("Failed to load filter options", err);
    }
  };
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkPreview, setBulkPreview] = useState([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkStats, setBulkStats] = useState(null);
  const bulkFileInputRef = useRef(null);

  const clearBulkFile = () => {
    setBulkFile(null);
    setBulkPreview([]);
    setBulkStats(null);
    if (bulkFileInputRef.current) bulkFileInputRef.current.value = "";
  };

  const templateHeaders = [
    "employeeId",
    "date",
    "status",
    "checkIn",
    "checkOut",
    "totalHours",
    "notes"
  ];

  const templateSample = [
    {
      employeeId: "EMP001",
      date: "2026-04-13",
      status: "PRESENT",
      checkIn: "09:05",
      checkOut: "18:02",
      totalHours: 8,
      notes: "Imported via bulk upload"
    },
    {
      employeeId: "EMP002",
      date: "2026-04-13",
      status: "ABSENT",
      checkIn: "",
      checkOut: "",
      totalHours: "",
      notes: "On leave"
    }
  ];

  const fetchDailyView = async () => {
    try {
      setLoading(true);

      const params = { 
        date: selectedDate,
        departmentId: departmentFilter !== 'all' ? departmentFilter : undefined,
        designationId: designationFilter !== 'all' ? designationFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
        page: currentPage,
        limit: itemsPerPage
      };
      const response = await attendanceService.getDailyAttendanceView(params);
      
      if (response.success) {
        // The controller using successResponse(res, { data, summary, pagination... }) 
        // results in { success: true, data: [...], summary: {...}, pagination: {...} }
        const resultData = response; 
        
        setDailyView({
          records: resultData.data || [],
          summary: resultData.summary || {
            totalEmployees: 0,
            present: 0,
            absent: 0,
            late: 0,
            earlyLeave: 0,
            overtime: 0
          },
          dateFormatted: resultData.dateFormatted,
          date: resultData.date
        });
        setPaginationData(resultData.pagination);
      }
    } catch (error) {
      console.error("Error fetching daily attendance view:", error);
      toast.error("Failed to load daily attendance view");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, departmentFilter, designationFilter, statusFilter, searchQuery]);

  // Fetch data when anything affecting the view changes
  useEffect(() => {
    fetchDailyView();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, departmentFilter, designationFilter, statusFilter, searchQuery, currentPage, itemsPerPage]);

  const handleDownloadTemplate = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(templateSample, { header: templateHeaders });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
      });
      saveAs(data, "zodeck_attendance_bulk_upload_template.xlsx");
    } catch (error) {
      console.error("Template download failed:", error);
      toast.error("Failed to download template");
    }
  };

  const excelDateToISO = (value) => {
    if (value === undefined || value === null || value === "") return "";
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString().split("T")[0];
    }
    if (typeof value === "number") {
      const utc = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
      return utc.toISOString().split("T")[0];
    }
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
    return "";
  };

  const excelTimeToHHmm = (value) => {
    if (value === undefined || value === null || value === "") return "";
    if (value instanceof Date && !isNaN(value.getTime())) {
      const hours = String(value.getHours()).padStart(2, "0");
      const minutes = String(value.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
    if (typeof value === "number") {
      const fraction = value % 1;
      const totalMinutes = Math.round(fraction * 24 * 60);
      const hours = Math.floor(totalMinutes / 60) % 24;
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
    const raw = String(value).trim();
    const ampmMatch = raw.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1], 10);
      const minutes = parseInt(ampmMatch[2], 10);
      const isPm = ampmMatch[3].toLowerCase() === "pm";
      if (isPm && hours < 12) hours += 12;
      if (!isPm && hours === 12) hours = 0;
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
    const hhmmMatch = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (hhmmMatch) {
      const hours = parseInt(hhmmMatch[1], 10);
      const minutes = parseInt(hhmmMatch[2], 10);
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }
    return raw;
  };

  const normalizeRow = (row) => {
    const lower = {};
    Object.keys(row || {}).forEach((key) => {
      lower[String(key).trim().toLowerCase()] = row[key];
    });

    const getVal = (...keys) => {
      for (const key of keys) {
        if (lower[key] !== undefined && lower[key] !== null && String(lower[key]).trim() !== "") {
          return lower[key];
        }
      }
      return "";
    };

    return {
      employeeId: getVal("employeeid", "employee id", "employee code", "employeecode"),
      date: excelDateToISO(getVal("date", "attendance date")),
      status: getVal("status"),
      checkIn: excelTimeToHHmm(getVal("checkin", "check in", "in")),
      checkOut: excelTimeToHHmm(getVal("checkout", "check out", "out")),
      totalHours: getVal("totalhours", "total hours", "hours"),
      notes: getVal("notes", "remarks", "comment")
    };
  };

  const handleBulkFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast.error("Please upload a valid Excel/CSV file");
      return;
    }
    setBulkFile(file);
    setBulkStats(null);
    setBulkPreview([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        setBulkPreview(rows.slice(0, 5));
      } catch (error) {
        console.error("Preview parse error:", error);
        toast.error("Unable to preview this file. Please check the template format.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error("Please select a file first");
      return;
    }

    setBulkUploading(true);
    try {
      const data = await bulkFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!rows.length) {
        toast.error("The uploaded file is empty");
        setBulkUploading(false);
        return;
      }

      const mappedRows = rows.map(normalizeRow);
      const validationErrors = mappedRows
        .map((row, index) => {
          const errors = [];
          if (!row.employeeId || !String(row.employeeId).trim()) {
            errors.push(`Row ${index + 2}: Employee ID is required`);
          }
          if (!row.date) {
            errors.push(`Row ${index + 2}: Valid date is required`);
          }
          return errors;
        })
        .flat();

      if (validationErrors.length > 0) {
        toast.error("Please fix the template errors before uploading");
        setBulkStats({
          total: mappedRows.length,
          success: 0,
          failed: mappedRows.length,
          failedRows: validationErrors.map((message) => ({
            row: Number(message.match(/Row (\d+)/)?.[1] || 0),
            message
          }))
        });
        setBulkUploading(false);
        return;
      }

      const response = await attendanceService.bulkCreateAttendance(mappedRows);
      const resultData = response?.data || response;
      const results = resultData?.results || [];
      const success = results.filter((r) => r.status === "success");
      const failed = results.filter((r) => r.status === "failed");

      setBulkStats({
        total: resultData?.total ?? results.length,
        success: resultData?.success ?? success.length,
        failed: resultData?.failed ?? failed.length,
        failedRows: failed
      });

      if (failed.length === 0) {
        toast.success("Attendance imported successfully");
        setBulkModalOpen(false);
        setBulkFile(null);
        setBulkPreview([]);
        setBulkStats(null);
        fetchDailyView();
      } else {
        toast.error("Some attendance rows failed to import");
      }
    } catch (error) {
      console.error("Bulk upload failed:", error);
      toast.error(error.message || "Bulk upload failed");
    } finally {
      setBulkUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const summary = dailyView?.summary || {};
  const records = dailyView?.records || [];

  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const getStatusBadge = (statusStr) => {
    if (statusStr?.includes("Absent")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          Absent
        </span>
      );
    }
    
    const isCheckedIn = statusStr?.includes("Checked In") || statusStr?.includes("Present");
    
    if (isCheckedIn) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Checked In
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/40 dark:text-orange-300 dark:border-orange-800">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
        Checked Out
      </span>
    );
  };

  const getAvatarColor = (index) => {
    const colors = [
      "bg-brand-500", "bg-purple-500", "bg-emerald-500", 
      "bg-blue-500", "bg-teal-500", "bg-orange-500"
    ];
    return colors[index % colors.length];
  };

  const exportRows = records.map((record) => ({
    employeeName: record.employee?.name || "-",
    employeeId: record.employee?.employeeId || "-",
    department: record.employee?.department || "-",
    designation: record.employee?.designation || "-",
    checkIn: record.attendance?.checkIn || "-",
    checkOut: record.attendance?.checkOut || "-",
    totalHours: record.metrics?.productionHours && record.metrics.productionHours !== "00h 00m" ? record.metrics.productionHours : "-",
    status: record.employee?.status || "ABSENT",
  }));

  const exportColumns = ["employeeName", "employeeId", "department", "designation", "checkIn", "checkOut", "totalHours", "status"];

  const toggleRow = (empId) => {
    setExpandedRow(expandedRow === empId ? null : empId);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setDepartmentFilter("all");
    setDesignationFilter("all");
    setSearchQuery("");
  };

  const StatCard = ({ label, value, icon: Icon, color, status, active }) => (
    <button 
      onClick={() => setStatusFilter(status)}
      className={`relative flex flex-col p-4 rounded-sm border transition-all text-left overflow-hidden group ${
        active 
          ? `bg-${color}-100/50 border-${color}-400 ring-2 ring-${color}-400 ring-opacity-20 dark:bg-${color}-900/20` 
          : `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-${color}-300 hover:shadow-md`
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-sm bg-${color}-50 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 transition-colors group-hover:scale-110 duration-300`}>
          <Icon className="w-5 h-5" />
        </div>
        {!active && (
          <ArrowRight className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        )}
      </div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${active ? `text-${color}-700 dark:text-${color}-300` : 'text-gray-400 group-hover:text-gray-500'}`}>
          {label}
        </p>
        <p className={`text-2xl font-black mt-1 ${active ? `text-${color}-900 dark:text-${color}-100` : 'text-gray-800 dark:text-gray-100 group-hover:scale-105 origin-left transition-transform'}`}>
          {value}
        </p>
      </div>
      {active && (
        <div className={`absolute bottom-0 right-0 w-12 h-12 -mr-4 -mb-4 bg-${color}-400/10 rounded-full blur-xl`}></div>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      
      {/* Header and Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <Fingerprint className="w-8 h-8 text-brand-500" />
            Daily Presence Track
          </h2>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Biometric Overview for <span className="text-brand-600 dark:text-brand-400 font-bold">{dailyView?.dateFormatted || selectedDate}</span>
            </p>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
              <span>Updated at {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              <button 
                onClick={() => {
                  setIsRefreshing(true);
                  fetchDailyView();
                }}
                disabled={loading || isRefreshing}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-brand-500 disabled:opacity-50"
                title="Refresh Attendance Data"
              >
                <RefreshCw className={`w-3 h-3 ${(loading || isRefreshing) ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-sm">
              <Activity className="w-3 h-3 text-emerald-500" />
              {summary.totalEmployees || 0} Staff
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-500 z-10" />
            <DatePickerField
              value={selectedDate}
              onChange={(value) => setSelectedDate(value)}
              placeholder="Change Date"
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm font-bold text-sm hover:border-brand-300 transition-colors shadow-sm cursor-pointer"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setBulkModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 shadow-sm hover:bg-brand-100"
          >
            <Upload className="h-4 w-4" />
            Bulk Upload
          </button>
          <ExportButtons 
              columns={exportColumns}
              rows={exportRows}
              fileNamePrefix={`daily-attendance-${selectedDate}`}
            />
          </div>
      </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard 
          label="Total Staff" 
          value={summary.totalEmployees || 0} 
          icon={Users} 
          color="brand" 
          status="all" 
          active={statusFilter === "all"}
        />
        <StatCard 
          label="Present" 
          value={summary.present || 0} 
          icon={CheckCircle} 
          color="green" 
          status="PRESENT" 
          active={statusFilter === "PRESENT"}
        />
        <StatCard 
          label="Absent" 
          value={summary.absent || 0} 
          icon={XCircle} 
          color="red" 
          status="ABSENT" 
          active={statusFilter === "ABSENT"}
        />
        <StatCard 
          label="Late Arrival" 
          value={summary.late || 0} 
          icon={Clock} 
          color="yellow" 
          status="LATE" 
          active={statusFilter === "LATE"}
        />
        <StatCard 
          label="Early Leave" 
          value={summary.earlyLeave || 0} 
          icon={AlertCircle} 
          color="purple" 
          status="EARLY_LEAVE" 
          active={statusFilter === "EARLY_LEAVE"}
        />
        <StatCard 
          label="Overtime" 
          value={summary.overtime || 0} 
          icon={Timer} 
          color="orange" 
          status="OVERTIME" 
          active={statusFilter === "OVERTIME"}
        />
      </div>

      {/* Advanced Filters */}
      <AttendanceFilters 
        globalFilter={searchQuery}
        setGlobalFilter={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        designationFilter={designationFilter}
        setDesignationFilter={setDesignationFilter}
        statuses={['all', 'PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'EARLY_LEAVE', 'OVERTIME']}
        departments={filterOptions.departments}
        designations={filterOptions.designations}
        onClearFilters={clearFilters}
      />

      {/* Main Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 backdrop-blur-[1px] z-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[120px]">
                  Employee ID
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[220px]">
                  Worker Profile
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Live Status
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[150px]">
                  Productive Metrics
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Timeline Logs
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Control
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                        <Users className="w-8 h-8 text-gray-300 dark:text-gray-700" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900 dark:text-white">Clean Sheet</p>
                        <p className="text-sm text-gray-500">No active attendance logs match your current filter criteria.</p>
                      </div>
                      <button 
                        onClick={clearFilters}
                        className="mt-2 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((record, index) => {
                  const empId = record.employee?.id || record.employee?.publicId;
                  const punches = record.attendance?.punches || [];
                  const isExpanded = expandedRow === empId;
                  const currentStatusStr = record.metrics?.currentStatus;
                  const prodHours = record.metrics?.productionHours || '00h 00m';
                  const breakHours = record.metrics?.break || '0h 0m';
                  const avatarColor = getAvatarColor(index);
                  const isLast = index === records.length - 1;
 
                  return (
                    <React.Fragment key={empId}>
                      <tr className={`group transition-all duration-200 ${isExpanded ? 'bg-brand-50/10 dark:bg-brand-900/10' : 'hover:bg-gray-50/80 dark:hover:bg-gray-900/30'}`}>
                        {/* Employee ID */}
                        <td className="px-6 py-5 whitespace-nowrap align-middle">
                          <span className="text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight group-hover:text-brand-600 transition-colors">
                            {record.employee?.employeeId || "---"}
                          </span>
                        </td>
 
                        {/* Employee Name */}
                        <td className="px-6 py-5 whitespace-nowrap align-middle">
                          <div className="flex items-center gap-4">
                            <div className={`relative w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-black text-sm shadow-sm ring-2 ring-white dark:ring-gray-800`}>
                              {getInitials(record.employee?.name)}
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800 shadow-sm"></div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate w-48 leading-tight">
                                {record.employee?.name || "Placeholder User"}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate w-24">
                                  {record.employee?.department || "General"}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span className="text-[10px] font-bold text-brand-600/70 dark:text-brand-400/70 uppercase tracking-wider truncate w-24">
                                  {record.employee?.designation || "Staff"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
 
                        {/* Status */}
                        <td className="px-6 py-5 whitespace-nowrap align-middle">
                          {getStatusBadge(currentStatusStr)}
                        </td>
 
                        {/* Metrics */}
                        <td className="px-6 py-5 whitespace-nowrap align-middle">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-[11px] font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded-sm">
                                <Timer className="w-3 h-3" />
                                <span>{prodHours}</span>
                              </div>
                              {record.metrics.overtime !== '--' && (
                                <div className="flex items-center gap-1 text-[11px] font-black text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded-sm" title="Overtime">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>{record.metrics.overtime}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 pl-1">
                               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-2">
                                 <Clock className="w-2.5 h-2.5" /> {record.attendance?.checkIn || "--:--"}
                               </span>
                               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Break: {breakHours}</span>
                            </div>
                          </div>
                        </td>
 
                        {/* Punches Accordion */}
                        <td className="px-6 py-5 text-center whitespace-nowrap align-middle">
                          {punches.length > 0 ? (
                            <button 
                              onClick={() => toggleRow(empId)}
                              className={`group/btn inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm text-xs font-black uppercase tracking-widest transition-all ${
                                isExpanded 
                                  ? 'bg-brand-600 text-white shadow-brand-500/20 shadow-lg' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700 dark:bg-gray-800/80 dark:text-gray-400 dark:hover:bg-brand-900/50 dark:hover:text-brand-300'
                              }`}
                            >
                              {punches.length} Logs
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 group-hover/btn:translate-y-0.5 transition-transform" />}
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                               <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Logs</span>
                            </div>
                          )}
                        </td>
 
                        {/* Actions */}
                        <td className="px-6 py-5 text-right whitespace-nowrap align-middle">
                          <button
                            onClick={() => {
                              setSelectedAttendance({ ...record, date: dailyView?.date, raw: record });
                              setIsCorrectionModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-sm text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-100 dark:text-brand-400 dark:bg-brand-900/20 dark:hover:bg-brand-900/40 dark:border-brand-900/50 transition-all font-black text-[10px] uppercase tracking-widest group/action"
                          >
                            <Edit className="w-3.5 h-3.5 group-hover/action:rotate-12 transition-transform" />
                            Correction
                          </button>
                        </td>
                      </tr>
 
                      {/* Expanded Timeline View */}
                      {isExpanded && punches.length > 0 && (
                        <tr>
                          <td colSpan={6} className="p-0 border-none">
                            <div className="mx-6 mb-6 mt-1 p-6 bg-gray-50 dark:bg-gray-900/30 rounded-sm border border-gray-200/50 dark:border-gray-700/50 shadow-inner overflow-hidden">
                              <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-brand-500" />
                                  Biometric Terminal Timeline
                                </h4>
                                <div className="h-px flex-1 mx-6 bg-gradient-to-r from-gray-200 dark:from-gray-800 to-transparent"></div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4">
                                {punches.map((punch, idx) => (
                                  <div 
                                    key={idx} 
                                    className={`relative z-10 flex flex-col items-center group/punch`}
                                  >
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-sm border shadow-sm transition-all hover:scale-105 ${
                                      punch.type === 'IN' 
                                        ? 'bg-white border-emerald-100 text-emerald-900 dark:bg-gray-800 dark:border-emerald-900/30' 
                                        : 'bg-white border-red-100 text-red-900 dark:bg-gray-800 dark:border-red-900/30'
                                    }`}>
                                      <div className={`p-1.5 rounded-sm ${punch.type === 'IN' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                                        <Fingerprint className={`w-4 h-4 ${punch.type === 'IN' ? 'text-emerald-500' : 'text-red-500'}`} />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-sm font-black tracking-tight leading-none">
                                          {punch.timeFormatted || punch.time}
                                        </span>
                                        <span className={`text-[9px] font-black uppercase mt-1 tracking-widest ${punch.type === 'IN' ? 'text-emerald-500' : 'text-red-500'}`}>
                                          Punch {punch.type}
                                        </span>
                                      </div>
                                    </div>
                                    {idx < punches.length - 1 && (
                                      <div className="hidden lg:block absolute top-1/2 left-full w-4 h-px bg-gray-200 dark:bg-gray-700 -translate-y-1/2"></div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Component */}
      {paginationData && paginationData.total > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={paginationData.total}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
          className="mt-6"
        />
      )}
 
      <CorrectAttendanceModal
        isOpen={isCorrectionModalOpen}
        onClose={() => {
          setIsCorrectionModalOpen(false);
          setSelectedAttendance(null);
        }}
        attendance={selectedAttendance}
        onUpdate={() => {
          fetchDailyView();
          setIsCorrectionModalOpen(false);
          setSelectedAttendance(null);
        }}
      />

      {bulkModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setBulkModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl p-8 border border-gray-100 dark:border-gray-700/50 transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Upload Attendance</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upload attendance using the Excel/CSV template.</p>
              </div>
              <button
                onClick={() => setBulkModalOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-900/40">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">1. Download Template</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Use this template to prepare your attendance data.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition-all text-sm font-semibold"
                >
                  <FileDown size={16} /> Download Template
                </button>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-800">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">2. Upload File</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Supported: .xlsx, .xls, .csv
                </p>
                <label className="flex items-center justify-between w-full h-12 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-brand-500 transition-all text-sm text-gray-600 dark:text-gray-300 px-3 gap-2">
                  <span className="truncate pr-2 flex-1">{bulkFile ? bulkFile.name : "Choose file"}</span>
                  {bulkFile && (
                    <button
                      type="button"
                      onClick={(evt) => {
                        evt.preventDefault();
                        evt.stopPropagation();
                        clearBulkFile();
                      }}
                      className="p-1.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                      title="Remove selected file"
                      aria-label="Remove selected file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <input ref={bulkFileInputRef} type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleBulkFileChange} />
                </label>
              </div>
            </div>

            {bulkPreview.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Preview (first 5 rows)</h4>
                <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 max-h-48">
                  <table className="min-w-full text-xs text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        {Object.keys(bulkPreview[0]).map((key) => (
                          <th key={key} className="px-3 py-2 font-semibold text-gray-600 dark:text-gray-200">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {bulkPreview.map((row, idx) => (
                        <tr key={idx}>
                          {Object.keys(bulkPreview[0]).map((key) => (
                            <td key={key} className="px-3 py-2 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                              {row[key] !== undefined && row[key] !== null ? String(row[key]) : ""}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {bulkStats && (
              <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/40">
                <div className="flex flex-wrap gap-6 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  <span>Total: {bulkStats.total}</span>
                  <span className="text-green-600">Success: {bulkStats.success}</span>
                  <span className="text-red-600">Failed: {bulkStats.failed}</span>
                </div>
                {bulkStats.failed > 0 && (
                  <div className="mt-3 text-xs text-red-600">
                    {bulkStats.failedRows.slice(0, 5).map((row) => (
                      <div key={`${row.row}-${row.message}`}>
                        Row {row.row}: {row.message}
                      </div>
                    ))}
                    {bulkStats.failedRows.length > 5 && (
                      <div className="mt-1 text-gray-500">+{bulkStats.failedRows.length - 5} more errors</div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setBulkModalOpen(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-all text-sm font-semibold dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              >
                Close
              </button>
              <button
                onClick={handleBulkUpload}
                disabled={!bulkFile || bulkUploading}
                className="px-6 py-2.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition-all text-sm font-semibold disabled:opacity-60"
              >
                {bulkUploading ? "Uploading..." : "Upload Attendance"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
