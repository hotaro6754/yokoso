"use client";
import { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, Edit, Upload, FileDown, X } from 'lucide-react';
import { leaveReportsService } from '@/services/hr-services/leaveReports.service';
import Pagination from '@/components/common/Pagination';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-hot-toast';

const EmployeeLeaveTable = ({ filters, onEdit, showImportExport = false }) => {
  const showActions = typeof onEdit === 'function';
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  const fileInputRef = useRef(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const fetchEmployeeSummary = async () => {
      try {
        setLoading(true);
        const response = await leaveReportsService.getEmployeeLeaveSummary({
          ...filters,
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          sortKey: sortConfig.key,
          sortDirection: sortConfig.direction
        });
        setEmployees(response.data || []);
        setPagination(prev => ({
          ...prev,
          totalItems: response.pagination?.totalItems || 0,
          totalPages: response.pagination?.totalPages || 1
        }));
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching employee leave summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeSummary();
  }, [filters, pagination.page, pagination.limit, searchTerm, sortConfig, refreshKey]);

  const downloadTemplate = () => {
    const headers = [
      'Employee Public ID',
      'Employee ID',
      'Employee Name',
      'Email',
      'Department',
      'Casual Total',
      'Casual Used',
      'Casual Remaining',
      'Sick Total',
      'Sick Used',
      'Sick Remaining',
      'Earned Total',
      'Earned Used',
      'Earned Remaining',
      'Emergency Total',
      'Emergency Used',
      'Emergency Remaining',
      'Year'
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Balances');

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `leave-balances-template-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleExport = async () => {
    try {
      await leaveReportsService.exportReport({ type: 'employee_summary', format: 'excel' });
      toast.success('Leave balances exported');
    } catch (err) {
      toast.error(err.message || 'Failed to export leave balances');
    }
  };

  const parseNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const raw = typeof value === 'string' ? value.replace(/,/g, '').trim() : value;
    if (raw === '') return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  };

  const normalizeKey = (key) => String(key || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select an Excel file');
      return;
    }

    setImporting(true);
    try {
      const buffer = await importFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames?.[0];
      const sheet = sheetName ? workbook.Sheets[sheetName] : null;
      if (!sheet) {
        toast.error('No sheet found in file');
        return;
      }

      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (!Array.isArray(rows) || rows.length === 0) {
        toast.error('No rows found in file');
        return;
      }

      const balances = rows.map((row) => {
        const normalized = {};
        Object.entries(row || {}).forEach(([k, v]) => {
          normalized[normalizeKey(k)] = v;
        });

        const employeePublicId = String(
          normalized.employeepublicid ||
            normalized.publicid ||
            normalized.employeepublic ||
            normalized.employeepublicuuid ||
            ''
        ).trim();

        return {
          employeePublicId,
          casualTotal: parseNumber(normalized.casualtotal),
          casualUsed: parseNumber(normalized.casualused),
          casualRemaining: normalized.casualremaining === '' ? undefined : parseNumber(normalized.casualremaining),
          sickTotal: parseNumber(normalized.sicktotal),
          sickUsed: parseNumber(normalized.sickused),
          sickRemaining: normalized.sickremaining === '' ? undefined : parseNumber(normalized.sickremaining),
          earnedTotal: parseNumber(normalized.earnedtotal),
          earnedUsed: parseNumber(normalized.earnedused),
          earnedRemaining: normalized.earnedremaining === '' ? undefined : parseNumber(normalized.earnedremaining),
          emergencyTotal: parseNumber(normalized.emergencytotal),
          emergencyUsed: parseNumber(normalized.emergencyused),
          emergencyRemaining: normalized.emergencyremaining === '' ? undefined : parseNumber(normalized.emergencyremaining),
          year: normalized.year === '' ? undefined : parseInt(normalized.year, 10)
        };
      }).filter((b) => b.employeePublicId);

      if (balances.length === 0) {
        toast.error('Missing "Employee Public ID" column or values');
        return;
      }

      const resp = await leaveReportsService.importLeaveBalances(balances);
      const result = resp?.data || resp;
      const updated = result?.updated ?? 0;
      const failed = result?.failed ?? 0;

      toast.success(`Imported leave balances: ${updated} updated${failed ? `, ${failed} failed` : ''}`);
      setShowImportModal(false);
      setImportFile(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error('Import failed:', err);
      toast.error(err.message || 'Failed to import leave balances');
    } finally {
      setImporting(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <div className="ml-1 flex flex-col"><ChevronUp className="w-3 h-3 -mb-0.5 text-gray-400" /><ChevronDown className="w-3 h-3 -mt-0.5 text-gray-400" /></div>;
    }
    return sortConfig.direction === 'asc' ?
      <ChevronUp className="ml-1 w-4 h-4 text-brand-600" /> :
      <ChevronDown className="ml-1 w-4 h-4 text-brand-600" />;
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleItemsPerPageChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-sm shadow">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Employee Leave Summary
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Detailed breakdown of leave usage by employee
            </p>
          </div>

          {showImportExport && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadTemplate}
                className="inline-flex items-center gap-2 rounded-sm border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <FileDown className="h-4 w-4" />
                Template
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-sm border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <FileDown className="h-4 w-4" />
                Export
              </button>
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center gap-2 rounded-sm bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees or departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Employee
                  <SortIcon columnKey="name" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('department')}
              >
                <div className="flex items-center">
                  Department
                  <SortIcon columnKey="department" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                <div className="flex items-center">
                  Total Leaves
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                <div className="flex items-center">
                  Used
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                <div className="flex items-center">
                  Remaining
                </div>
              </th>
              {showActions && (
                <th
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  Action
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={showActions ? 6 : 5} className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={showActions ? 6 : 5} className="px-6 py-4 text-center text-red-600 dark:text-red-400">
                  {error}
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={showActions ? 6 : 5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No data found
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {employee.totalLeaves}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {employee.usedLeaves}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {employee.remainingLeaves}
                  </td>
                  {showActions && (
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => onEdit(employee)}
                        className="text-brand-600 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 p-2 rounded-full transition-colors"
                        title="Edit Balance"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <Pagination
          currentPage={pagination.page}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Import Leave Balances</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Upload the exported sheet (or template) and ensure the <span className="font-semibold">Employee Public ID</span> column is present.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (importing) return;
                  setShowImportModal(false);
                  setImportFile(null);
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                disabled={importing}
              />
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (importing) return;
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="rounded-sm border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing}
                  className="rounded-sm bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {importing ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeaveTable;
