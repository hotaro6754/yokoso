'use client';

import React, { useState, useEffect, useRef } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { courseManagementService } from "@/services/course-management/course.service";
import {
  Award, BookOpen, Users, Calendar, CheckCircle2, Download,
  Eye, Search, Filter, FileText, Send, User, Upload,
  Building, Clock, MessageSquare, AlertCircle, X
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';
import * as XLSX from "xlsx";

export default function HRCoursesCertificationsPage() {
  const [approvedCompletions, setApprovedCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedCompletion, setSelectedCompletion] = useState(null);
  const [issuingCertificate, setIssuingCertificate] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const breadcrumbItems = [
    { label: "HR", href: "/hr" },
    { label: "Courses & Certifications", href: "/hr/courses-certifications" }
  ];

  const statusConfig = {
    'Approved': { color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400', icon: CheckCircle2 },
    'Certified': { color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400', icon: Award },
    'Pending Certificate': { color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400', icon: AlertCircle }
  };

  useEffect(() => {
    fetchApprovedCompletions();
  }, []);

  const fetchApprovedCompletions = async () => {
    try {
      setLoading(true);
      const [pending, issued] = await Promise.all([
        courseManagementService.getPendingCertifications(),
        courseManagementService.getIssuedCertifications()
      ]);

      const mappedPending = pending.map(p => ({
        id: p.id,
        courseTitle: p.courseTitle,
        employeeName: p.employeeName,
        employeeId: p.employeeEmail,
        department: "N/A",
        completedDate: p.completedAt,
        status: "Approved",
        certificateId: null,
        managerName: "Manager"
      }));

      const mappedIssued = issued.map(i => ({
        id: i.id,
        courseTitle: i.courseTitle,
        employeeName: i.employeeName,
        employeeId: i.employeeEmail,
        department: "N/A",
        completedDate: i.issuedAt,
        status: "Certified",
        certificateId: i.certificateCode,
        issueDate: i.issuedAt,
        managerName: "Manager"
      }));

      setApprovedCompletions([...mappedPending, ...mappedIssued]);

    } catch (err) {
      console.error('Error fetching completions:', err);
      setError('Failed to load course completions');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async () => {
    if (!selectedCompletion) return;

    try {
      setIssuingCertificate(true);
      await courseManagementService.issueCertificate(selectedCompletion.id);

      toast.success("Certificate issued successfully");
      setShowIssueModal(false);
      setSelectedCompletion(null);
      fetchApprovedCompletions();
    } catch (err) {
      console.error('Error issuing certificate:', err);
      toast.error('Failed to issue certificate');
    } finally {
      setIssuingCertificate(false);
    }
  };

  const handleExport = () => {
    try {
      if (approvedCompletions.length === 0) {
        toast.error("No data available to export");
        return;
      }

      // Format data for CSV
      const exportData = approvedCompletions.map(item => ({
        "Employee Name": item.employeeName,
        "Employee ID": item.employeeId,
        "Course Title": item.courseTitle,
        "Completion Date": item.completedDate ? new Date(item.completedDate).toLocaleDateString() : 'N/A',
        "Certificate ID": item.certificateId || 'N/A',
        "Issue Date": item.issueDate ? new Date(item.issueDate).toLocaleDateString() : 'N/A',
        "Status": item.status
      }));

      // Convert to CSV
      const headers = Object.keys(exportData[0]).join(",");
      const rows = exportData.map(obj => 
        Object.values(obj).map(val => {
          const stringVal = (val === null || val === undefined) ? "" : String(val);
          return stringVal.includes(',') ? `"${stringVal}"` : stringVal;
        }).join(",")
      ).join("\n");
      
      const csvContent = "\uFEFF" + headers + "\n" + rows;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Courses_Certifications_${new Date().toLocaleDateString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Data exported successfully!");
    } catch (error) {
      console.error('Export failed:', error);
      toast.error("Export failed: " + error.message);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (!rows.length) {
          toast.error("No rows found in the file");
          return;
        }

        const mapped = rows.map((row, idx) => ({
          id: `import-${Date.now()}-${idx}`,
          courseTitle: row["Course Title"] || row["courseTitle"] || row["Course"] || "",
          employeeName: row["Employee Name"] || row["employeeName"] || row["Employee"] || "",
          employeeId: row["Employee ID"] || row["employeeId"] || row["Employee Email"] || "",
          department: row["Department"] || "N/A",
          completedDate: row["Completion Date"] || row["Completed Date"] || "",
          status: row["Status"] || "Approved",
          certificateId: row["Certificate ID"] || row["certificateId"] || null,
          issueDate: row["Issue Date"] || row["Issued Date"] || null,
          managerName: row["Manager"] || "Manager"
        }));

        setApprovedCompletions((prev) => [...mapped, ...prev]);
        toast.success(`Imported ${mapped.length} records`);
      } catch (err) {
        console.error("Import failed:", err);
        toast.error("Import failed");
      } finally {
        setImporting(false);
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read file");
      setImporting(false);
      event.target.value = "";
    };

    reader.readAsBinaryString(file);
  };

  const filteredCompletions = approvedCompletions.filter(completion => {
    const matchesSearch =
      completion.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      completion.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      completion.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      completion.certificateId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment = departmentFilter === 'all' || completion.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || completion.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const StatusIcon = ({ status }) => {
    const Icon = statusConfig[status]?.icon || FileText;
    return <Icon size={14} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      <Toaster position="top-right" />

      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb items={breadcrumbItems} />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Courses & Certifications</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage approved course completions and issue certificates
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              className="hidden"
              onChange={handleImportFile}
            />
            <button
              onClick={handleImportClick}
              disabled={importing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-600 bg-white border border-brand-200 rounded-sm hover:bg-brand-50 dark:bg-gray-800 dark:border-gray-600 dark:text-brand-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={16} />
              {importing ? "Importing..." : "Import"}
            </button>
            <button
              onClick={handleExport}
              disabled={approvedCompletions.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Approved</span>
            <div className="p-1.5 rounded-full bg-green-50 dark:bg-green-500/20">
              <CheckCircle2 size={14} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{approvedCompletions.length}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Certificates</span>
            <div className="p-1.5 rounded-full bg-orange-50 dark:bg-orange-500/20">
              <AlertCircle size={14} className="text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {approvedCompletions.filter(c => c.status === 'Approved').length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Certificates Issued</span>
            <div className="p-1.5 rounded-full bg-purple-50 dark:bg-purple-500/20">
              <Award size={14} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {approvedCompletions.filter(c => c.status === 'Certified').length}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap lg:flex-nowrap items-center gap-4">
        <div className="relative w-full lg:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by course, employee..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full pl-9 pr-4 text-sm border border-gray-200 rounded-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
          />
        </div>
        <div className="flex w-full lg:w-auto overflow-x-auto gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 text-sm border border-gray-200 rounded-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 min-w-[200px]"
          >
            <option value="all">All Status</option>
            <option value="Approved">Pending Issue</option>
            <option value="Certified">Issued</option>
          </select>
        </div>
      </div>

      {/* Course Completions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-900 dark:bg-brand-900/20 dark:text-brand-100 border-b border-brand-100 dark:border-brand-800">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Employee & Course</th>
                <th className="px-6 py-3 text-left font-medium">Completion Date</th>
                <th className="px-6 py-3 text-left font-medium">Certificate</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredCompletions.length > 0 ? (
                filteredCompletions.map((completion) => (
                  <tr key={completion.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-sm bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                            <User size={14} className="text-brand-600 dark:text-brand-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {completion.employeeName}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {completion.employeeId}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-10">
                          <BookOpen size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            {completion.courseTitle}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar size={14} />
                        <span>
                          {completion.completedDate ? new Date(completion.completedDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {completion.certificateId ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded-full bg-purple-50 dark:bg-purple-900/20">
                              <Award size={12} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-400">
                              {completion.certificateId}
                            </span>
                          </div>
                          {completion.issueDate && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 pl-6">
                              Issued: {new Date(completion.issueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Not issued</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig[completion.status]?.color}`}>
                        <StatusIcon status={completion.status} />
                        {completion.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {completion.status === 'Approved' && (
                          <button
                            onClick={() => {
                              setSelectedCompletion(completion);
                              setShowIssueModal(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-sm hover:bg-brand-700 transition-colors shadow-sm"
                          >
                            <Award size={14} />
                            Issue
                          </button>
                        )}

                        {completion.certificateId && (
                          <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-sm">
                            <CheckCircle2 size={12} />
                            Issued
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Award className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery || departmentFilter !== 'all' || statusFilter !== 'all'
                          ? 'No course completions found matching your filters'
                          : 'No approved course completions found'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Certificate Modal */}
      {showIssueModal && selectedCompletion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-sm p-0 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Issue Certificate
              </h3>
              <button
                onClick={() => {
                  setShowIssueModal(false);
                  setSelectedCompletion(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-brand-50 dark:bg-brand-900/20 rounded-sm p-4 border border-brand-100 dark:border-brand-800/30">
                <div className="flex gap-3">
                  <div className="p-1.5 bg-brand-100 dark:bg-brand-800/30 rounded-full h-fit">
                    <Award size={16} className="text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Confirm Action</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Issue certificate for <strong>{selectedCompletion.courseTitle}</strong> to <strong>{selectedCompletion.employeeName}</strong>?
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                This will generate a unique certificate ID and make it available for the employee to download.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowIssueModal(false);
                    setSelectedCompletion(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleIssueCertificate}
                  disabled={issuingCertificate}
                  className="px-4 py-2 bg-brand-600 text-white rounded-sm hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium shadow-sm"
                >
                  <Award size={14} />
                  {issuingCertificate ? 'Issuing...' : 'Issue Certificate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
