"use client";
import { useState, useEffect, useRef } from 'react';
import { PlusCircle, X, Upload, FileDown } from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import HolidaysHeader from './components/HolidaysHeader';
import HolidaysCalendar from './components/HolidaysCalendar';
import HolidaysList from './components/HolidaysList';
import Link from 'next/link';
import { holidayService } from '../../../../../services/hr-services/leave-holiday-calender.service';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import organizationService from '../../../../../services/hr-services/organization.service';
import Pagination from '@/components/common/Pagination';

export default function Holidays() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isHolidayCrudAllowed = pathname.startsWith('/hr') || pathname.startsWith('/company-admin');
  const [holidays, setHolidays] = useState([]);
  const [view, setView] = useState('list');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [listPagination, setListPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, resolve: null });
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
  const [locations, setLocations] = useState([]);

  const templateHeaders = [
    "name",
    "date",
    "type",
    "description",
    "isRecurring",
    "applicableTo",
    "country",
    "state",
    "locationId",
    "locationName",
    "color"
  ];

  const templateSample = [
    {
      name: "Republic Day",
      date: "2026-01-26",
      type: "national",
      description: "National holiday",
      isRecurring: true,
      applicableTo: "all",
      country: "India",
      state: "All",
      locationId: "",
      locationName: "",
      color: "#3b82f6"
    },
    {
      name: "Company Anniversary",
      date: "2026-04-01",
      type: "company",
      description: "Office holiday",
      isRecurring: false,
      applicableTo: "location",
      country: "India",
      state: "All",
      locationId: "",
      locationName: "Bangalore",
      color: "#10b981"
    }
  ];

  // Fetch holidays and available years on mount
  useEffect(() => {
    fetchHolidays();
    fetchHolidayYears();
  }, [yearFilter, typeFilter]);

  useEffect(() => {
    setListPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [yearFilter, typeFilter, view]);

  useEffect(() => {
    if (!bulkModalOpen) return;
    const fetchLocations = async () => {
      try {
        const response = await organizationService.getAllLocations({ status: 'ACTIVE' });
        const locationData = response.data || response || [];
        setLocations(Array.isArray(locationData) ? locationData : []);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocations([]);
      }
    };
    fetchLocations();
  }, [bulkModalOpen]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        year: yearFilter,
        ...(typeFilter !== 'all' && { type: typeFilter }),
        limit: 100 // Get all holidays for the year
      };

      const response = await holidayService.getAllHolidays(params);

      // Extract holidays array from response.data
      if (response.success && response.data) {
        setHolidays(response.data);

        // Update pagination if available
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setHolidays([]);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast.error(error.message || 'Failed to fetch holidays');
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidayYears = async () => {
    try {
      const response = await holidayService.getHolidayYears();

      // Check if response has data array
      let years = [];
      if (Array.isArray(response)) {
        years = response;
      } else if (response && response.data) {
        years = response.data;
      } else if (response && Array.isArray(response)) {
        years = response;
      }

      // Ensure current year is included
      const currentYear = new Date().getFullYear();
      if (!years.includes(currentYear)) {
        years.push(currentYear);
      }

      setAvailableYears(years.sort((a, b) => b - a));
    } catch (error) {
      console.error('Error fetching holiday years:', error);
      // Set default years
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear - 1, currentYear, currentYear + 1]);
    }
  };

  const confirmDelete = (holidayId) =>
    new Promise((resolve) => {
      setDeleteModal({ isOpen: true, id: holidayId, resolve });
    });

  const handleCloseDeleteModal = (result) => {
    if (deleteModal.resolve) {
      deleteModal.resolve(result);
    }
    setDeleteModal({ isOpen: false, id: null, resolve: null });
  };

  const handleDeleteHoliday = async (holidayId) => {
    const confirmed = await confirmDelete(holidayId);
    if (!confirmed) return;

    try {
      await holidayService.deleteHoliday(holidayId);
      setHolidays(prev => prev.filter(holiday => holiday.id !== holidayId));
      toast.success('Holiday deleted successfully');
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error(error.message || 'Failed to delete holiday');
    }
  };

  const filteredHolidays = holidays.filter(holiday => {
    if (!holiday || !holiday.date) return false;

    try {
      const holidayYear = new Date(holiday.date).getFullYear();
      const matchesYear = holidayYear === yearFilter;
      const matchesType = typeFilter === 'all' || holiday.type === typeFilter;

      return matchesYear && matchesType;
    } catch (error) {
      console.error('Error filtering holiday:', holiday, error);
      return false;
    }
  });

  const totalFiltered = filteredHolidays.length;
  const paginatedHolidays = filteredHolidays.slice(
    listPagination.pageIndex * listPagination.pageSize,
    listPagination.pageIndex * listPagination.pageSize + listPagination.pageSize
  );

  const handleDownloadTemplate = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(templateSample, { header: templateHeaders });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Holidays");
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
      saveAs(data, "zodeck_holiday_bulk_upload_template.xlsx");
    } catch (error) {
      console.error("Template download failed:", error);
      toast.error("Failed to download template");
    }
  };

  const parseBool = (value, fallback = true) => {
    if (value === undefined || value === null || value === '') return fallback;
    if (typeof value === 'boolean') return value;
    const str = String(value).trim().toLowerCase();
    if (['true', 'yes', '1'].includes(str)) return true;
    if (['false', 'no', '0'].includes(str)) return false;
    return fallback;
  };

  const excelDateToISO = (value) => {
    if (!value && value !== 0) return '';
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString().split('T')[0];
    }
    if (typeof value === 'number') {
      const utc = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
      return utc.toISOString().split('T')[0];
    }
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
    return '';
  };

  const handleBulkFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast.error("Please upload a valid Excel/CSV file");
      event.target.value = "";
      return;
    }
    setBulkFile(file);
    setBulkStats(null);
    setBulkPreview([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
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

  const normalizeRow = (row) => {
    const lower = {};
    Object.keys(row || {}).forEach((key) => {
      lower[String(key).trim().toLowerCase()] = row[key];
    });
    const getVal = (...keys) => {
      for (const key of keys) {
        if (lower[key] !== undefined && lower[key] !== null && String(lower[key]).trim() !== '') {
          return lower[key];
        }
      }
      return undefined;
    };

    let applicableTo = (getVal('applicableto', 'applicable to') || 'all').toString().toLowerCase();
    const rawLocationId = getVal('locationid', 'location id');
    const locationName = getVal('locationname', 'location name', 'location');
    let locationId = rawLocationId ? Number(rawLocationId) : null;

    if (!locationId && locationName) {
      const matched = locations.find(loc => loc.name?.toLowerCase() === String(locationName).trim().toLowerCase());
      if (matched) {
        locationId = matched.id;
      }
    }

    return {
      name: getVal('name', 'holiday name'),
      date: excelDateToISO(getVal('date', 'holiday date')),
      type: (getVal('type') || 'national').toString().toLowerCase(),
      description: getVal('description'),
      isRecurring: parseBool(getVal('isrecurring', 'is recurring')),
      applicableTo,
      country: getVal('country') || 'India',
      state: getVal('state') || 'All',
      locationId: applicableTo === 'location' ? locationId : null,
      color: getVal('color') || '#3b82f6',
      locationName
    };
  };

  const buildKey = (name, date) => {
    if (!name || !date) return '';
    return `${String(name).trim().toLowerCase()}|${String(date).trim()}`;
  };

  const buildPatchPayload = (rawRow, baseRow) => {
    const lower = {};
    Object.keys(rawRow || {}).forEach((key) => {
      lower[String(key).trim().toLowerCase()] = rawRow[key];
    });
    const hasVal = (...keys) =>
      keys.some((key) => lower[key] !== undefined && lower[key] !== null && String(lower[key]).trim() !== '');

    const payload = {};

    if (hasVal('name', 'holiday name')) payload.name = baseRow.name;
    if (hasVal('date', 'holiday date')) payload.date = baseRow.date;
    if (hasVal('type')) payload.type = baseRow.type;
    if (hasVal('description')) payload.description = baseRow.description;
    if (hasVal('isrecurring', 'is recurring')) payload.isRecurring = baseRow.isRecurring;
    if (hasVal('country')) payload.country = baseRow.country;
    if (hasVal('state')) payload.state = baseRow.state;
    if (hasVal('color')) payload.color = baseRow.color;

    const applicableProvided = hasVal('applicableto', 'applicable to');
    const locationProvided = hasVal('locationid', 'location id') || hasVal('locationname', 'location name', 'location');

    if (applicableProvided) {
      if (baseRow.applicableTo === 'location') {
        if (baseRow.locationId) {
          payload.applicableTo = 'location';
          payload.locationId = baseRow.locationId;
        }
      } else {
        payload.applicableTo = baseRow.applicableTo;
        payload.locationId = null;
      }
    } else if (locationProvided && baseRow.locationId) {
      payload.applicableTo = 'location';
      payload.locationId = baseRow.locationId;
    }

    return payload;
  };

  const validateRow = (row) => {
    const errors = [];
    if (!row.name || !String(row.name).trim()) {
      errors.push("Holiday name is required");
    }
    if (!row.date || isNaN(new Date(row.date).getTime())) {
      errors.push("Valid date is required (YYYY-MM-DD)");
    }
    return errors;
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error("Please select a file first");
      return;
    }

    setBulkUploading(true);
    try {
      const data = await bulkFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!rows.length) {
        toast.error("The uploaded file is empty");
        setBulkUploading(false);
        return;
      }

      const mappedRows = rows.map(normalizeRow);
      const results = [];
      const holidayLookup = new Map();
      holidays.forEach((holiday) => {
        const key = buildKey(holiday.name, holiday.date);
        if (key) holidayLookup.set(key, holiday);
      });

      for (let index = 0; index < mappedRows.length; index += 1) {
        const rawRow = rows[index];
        const row = mappedRows[index];
        const errors = validateRow(row);
        if (errors.length > 0) {
          results.push({ status: 'failed', row: index + 2, message: errors.join(', '), data: row });
          continue;
        }

        const existing = holidayLookup.get(buildKey(row.name, row.date));
        try {
          if (existing) {
            const patchPayload = buildPatchPayload(rawRow, row);
            if (Object.keys(patchPayload).length > 0) {
              await holidayService.updateHoliday(existing.id, patchPayload);
            }
            results.push({ status: 'success', row: index + 2, data: row, updated: true });
          } else {
            // If location isn't provided, default to all for new rows
            const createPayload = {
              ...row,
              applicableTo: row.applicableTo === 'location' && !row.locationId ? 'all' : row.applicableTo,
              locationId: row.applicableTo === 'location' && !row.locationId ? null : row.locationId
            };
            await holidayService.createHoliday(createPayload);
            results.push({ status: 'success', row: index + 2, data: row, created: true });
          }
        } catch (error) {
          results.push({
            status: 'failed',
            row: index + 2,
            message: error.message || 'Failed to upsert holiday',
            data: row
          });
        }
      }

      const success = results.filter(r => r.status === 'success');
      const failed = results.filter(r => r.status === 'failed');
      setBulkStats({
        total: results.length,
        success: success.length,
        failed: failed.length,
        failedRows: failed
      });

      if (failed.length === 0) {
        toast.success("Holidays imported successfully");
        setBulkModalOpen(false);
        setBulkFile(null);
        setBulkPreview([]);
        setBulkStats(null);
      } else {
        toast.error("Some holidays failed to import");
      }

      fetchHolidays();
    } catch (error) {
      console.error("Bulk upload failed:", error);
      toast.error(error.message || "Bulk upload failed");
    } finally {
      setBulkUploading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        pages={[
          { name: 'HR', href: '/hr' },
          { name: 'Leave', href: '/hr/leave' },
          { name: 'Holidays', href: '#' },
        ]}
        rightContent={
          isHolidayCrudAllowed ? (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setBulkModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-brand-700 hover:bg-brand-100 transition-all shadow-sm font-semibold"
              >
                <Upload size={18} /> Bulk Upload
              </button>
              <Link
                href="/hr/leave/holidays/add"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-white hover:bg-brand-600 transition-all shadow-sm hover:shadow-md font-semibold"
              >
                <PlusCircle size={18} /> Add Holiday
              </Link>
            </div>
          ) : null
        }
      />

      <HolidaysHeader
        view={view}
        onViewChange={setView}
        yearFilter={yearFilter}
        onYearFilterChange={setYearFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        totalHolidays={filteredHolidays.length}
        availableYears={availableYears}
        loading={loading}
      />

      <div className="mt-6 bg-white rounded-lg shadow dark:bg-gray-800 min-h-[400px]">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading holidays...</p>
          </div>
        ) : view === 'calendar' ? (
          <HolidaysCalendar holidays={filteredHolidays} />
        ) : (
          <div className="space-y-4">
            <HolidaysList
              holidays={paginatedHolidays}
              onDeleteHoliday={handleDeleteHoliday}
              canEdit={isHolidayCrudAllowed}
            />
            <Pagination
              currentPage={listPagination.pageIndex + 1}
              totalItems={totalFiltered}
              itemsPerPage={listPagination.pageSize}
              onPageChange={(page) => setListPagination(prev => ({ ...prev, pageIndex: page - 1 }))}
              onItemsPerPageChange={(size) => setListPagination({ pageIndex: 0, pageSize: size })}
              className="mx-4 sm:mx-6 mb-6"
              showWhenEmpty={true}
            />
          </div>
        )}

        {!loading && filteredHolidays.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No holidays found for the selected filters</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Try changing the year or type filter
            </p>
          </div>
        )}
      </div>

      {/* Centered Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => handleCloseDeleteModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-10 border border-gray-100 dark:border-gray-700/50 transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500">
                <X className="w-10 h-10" />
              </div>
              
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
                Are you sure?
              </h3>
              <p className="text-base text-gray-500 dark:text-gray-400 mb-8 max-w-[280px]">
                This action will permanently delete this holiday. It cannot be recovered.
              </p>
              
              <div className="flex w-full gap-4">
                <button
                  onClick={() => handleCloseDeleteModal(false)}
                  className="flex-1 px-6 py-4 text-sm font-bold rounded-2xl text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
                >
                  No, Keep it
                </button>
                <button
                  onClick={() => handleCloseDeleteModal(true)}
                  className="flex-1 px-6 py-4 text-sm font-bold rounded-2xl text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-500/30 transition-all active:scale-95"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {bulkModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setBulkModalOpen(false)}
          ></div>

          <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl p-8 border border-gray-100 dark:border-gray-700/50 transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Upload Holidays</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upload holidays using the Excel/CSV template.</p>
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
                  Use this template to prepare your holiday data.
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
                {bulkUploading ? "Uploading..." : "Upload Holidays"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
