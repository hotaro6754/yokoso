"use client";
import { useState, useEffect, useRef } from 'react';
import { X, User, FileText, Paperclip, Download, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { leaveRequestService } from '../../../../../services/hr-services/leaveRequestService';
import { userService } from '../../../../../services/user-services/user.service';
import { employeeService } from '../../../../../services/hr-services/employeeService';
import { toast } from 'sonner';
import DatePicker from '@/components/common/DatePicker';
import { holidayService } from '../../../../../services/hr-services/leave-holiday-calender.service';
import EmployeeLeaveService from '../../../../../services/employee/leave.service';
import { Info, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const LeaveRequestForm = ({
  isEditMode = false,
  initialData = null,
  onSave,
  onCancel,
  enableEmployeeSelect = false,
  helperText = "",
  redirectOnSubmit = true,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const normalizedRole = (user?.systemRole || user?.role || "").toUpperCase();
  const canBackdate = ["HR_ADMIN", "COMPANY_ADMIN"].includes(normalizedRole);
  const [formData, setFormData] = useState({
    employeeId: "",
    employeePublicId: "",
    leaveType: '', // Store name directly
    reason: '',
    fromDate: '',
    toDate: '',
    startDateBreakdown: 'FULL_DAY',
    endDateBreakdown: 'FULL_DAY',
    days: 0,
    attachment: null
  });

  const [calculatedDays, setCalculatedDays] = useState(0);
  const [existingAttachment, setExistingAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [holidays, setHolidays] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);

  const fileInputRef = useRef(null);

  const getMinBackdate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (canBackdate) {
      const adminMin = new Date(today);
      adminMin.setDate(adminMin.getDate() - 30);
      return adminMin;
    }

    return today;
  };

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const resp = await holidayService.getHolidaysForCurrentYear();
        const normalizeHolidays = (data) => {
          if (Array.isArray(data?.data)) return data.data;
          if (Array.isArray(data?.data?.holidays)) return data.data.holidays;
          if (Array.isArray(data?.holidays)) return data.holidays;
          if (Array.isArray(data)) return data;
          return [];
        };
        setHolidays(normalizeHolidays(resp));
      } catch (err) {
        console.error("Error fetching holidays", err);
        setHolidays([]);
      }
    };

    fetchCurrentEmployee();
    if (enableEmployeeSelect) {
      fetchEmployeesList();
    }
    fetchLeaveTypes();
    fetchHolidays();
  }, [enableEmployeeSelect]);

  useEffect(() => {
    const fetchLeaveBalances = async (id) => {
      try {
        let resp;
        if (enableEmployeeSelect) {
          resp = await employeeService.getLeaveBalances(id);
        } else {
          resp = await EmployeeLeaveService.getLeaveBalance();
        }
        const normalizeBalances = (data) => {
          if (Array.isArray(data?.leaveTypes)) return data.leaveTypes;
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.data?.leaveTypes)) return data.data.leaveTypes;
          if (Array.isArray(data?.data)) return data.data;
          if (Array.isArray(data?.leaveBalances)) return data.leaveBalances;
          return [];
        };
        setLeaveBalances(normalizeBalances(resp));
      } catch (err) {
        console.error("Error fetching leave balances", err);
        setLeaveBalances([]);
      }
    };

    if (formData.employeeId) {
      fetchLeaveBalances(formData.employeeId);
    }
  }, [formData.employeeId, enableEmployeeSelect]);

  useEffect(() => {
    if (initialData) {
      if (isEditMode) {
        fetchLeaveRequestDetails();
      } else {
        if (initialData.id) {
          const parseDate = (dateStr) => {
            if (!dateStr) return '';
            if (typeof dateStr === 'string' && dateStr.includes(',')) {
              const months = {
                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
                'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
              };

              const parts = dateStr.split(' ');
              const day = parts[0];
              const month = months[parts[1]];
              const year = parts[2].replace(',', '');

              return `${year}-${month}-${day.padStart(2, '0')}`;
            }
            return dateStr.split('T')[0];
          };

          const formData = {
            employeeId: initialData.employee?.id || initialData.employeeId || "",
            employeePublicId: initialData.employee?.publicId || initialData.employeePublicId || "",
            leaveType: typeof initialData.leaveType === 'object' ? initialData.leaveType.name : (initialData.leaveType || ''),
            reason: initialData.reason || '',
            days: initialData.days || 0,
            fromDate: parseDate(initialData.fromDate) || '',
            toDate: parseDate(initialData.toDate) || '',
            startDateBreakdown: initialData.startDateBreakdown?.toUpperCase() || 'FULL_DAY',
            endDateBreakdown: initialData.endDateBreakdown?.toUpperCase() || 'FULL_DAY',
            attachment: null
          };

          setFormData(formData);
          setCalculatedDays(initialData.days || 0);


          if (initialData.attachment) {
            setExistingAttachment({
              url: initialData.attachmentUrl,
              name: initialData.attachmentName
            });
          }
        }
      }
    }
  }, [initialData, isEditMode]);

  useEffect(() => {
    if (!formData.fromDate || !formData.toDate) {
      setCalculatedDays(0);
      return;
    }

    const start = new Date(formData.fromDate);
    const end = new Date(formData.toDate);

    if (start > end) {
      setCalculatedDays(0);
      return;
    }

    const balances = Array.isArray(leaveBalances) ? leaveBalances : [];
    let hasBalance = false;
    if (formData.leaveType) {
      const balanceObj = balances.find(b => (b.leaveType?.name === formData.leaveType) || (b.name === formData.leaveType) || (b.leaveTypeName === formData.leaveType));
      if (balanceObj) {
        hasBalance = (balanceObj.remainingLeaves > 0 || balanceObj.balance > 0);
      }
    }

    const holidayList = Array.isArray(holidays) ? holidays : [];
    let diffDays = 0;
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split('T')[0];

      const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

      const isHoliday = holidayList.some(h => {
        if (!h?.date) return false;
        const hDate = new Date(h.date).toISOString().split('T')[0];
        return hDate === dateStr;
      });

      const isFreeDay = isWeekend || isHoliday;

      if (hasBalance) {
        if (!isFreeDay) {
          diffDays += 1;
        }
      } else {
        diffDays += 1;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (diffDays > 0) {
      const startDayOfWeek = start.getDay();
      const startIsFree = hasBalance && (
        startDayOfWeek === 0 ||
        startDayOfWeek === 6 ||
        holidayList.some(h => h?.date && new Date(h.date).toISOString().split('T')[0] === start.toISOString().split('T')[0])
      );

      const endDayOfWeek = end.getDay();
      const endIsFree = hasBalance && (
        endDayOfWeek === 0 ||
        endDayOfWeek === 6 ||
        holidayList.some(h => h?.date && new Date(h.date).toISOString().split('T')[0] === end.toISOString().split('T')[0])
      );

      if (start.toDateString() === end.toDateString()) {
        if (!startIsFree) {
          diffDays = formData.startDateBreakdown === 'FULL_DAY' ? 1 : 0.5;
        } else {
          diffDays = 0;
        }
      } else {
        if (!startIsFree && formData.startDateBreakdown !== 'FULL_DAY') {
          diffDays -= 0.5;
        }
        if (!endIsFree && formData.endDateBreakdown !== 'FULL_DAY') {
          diffDays -= 0.5;
        }
      }
    }

    if (!isNaN(diffDays) && diffDays >= 0) {
      setCalculatedDays(diffDays);
      setFormData(prev => prev.days !== diffDays ? ({ ...prev, days: diffDays }) : prev);
    }
  }, [formData.fromDate, formData.toDate, formData.startDateBreakdown, formData.endDateBreakdown, formData.leaveType, holidays, leaveBalances]);

  const fetchCurrentEmployee = async () => {
    try {
      setProfileLoading(true);
      const response = await userService.getProfile();

      if (response.success && response.data) {
        const userData = response.data;

        const employee = {
          id: userData.employee?.id || userData.id || userData.publicId,
          name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          employeeId: userData.employee?.employeeId || userData.employeeId || '',
          designation: userData.employee?.designation?.name || userData.designation || 'N/A',
          department: userData.employee?.department?.name || userData.department || 'N/A',
          profileImage: userData.employee?.profileImage || userData.profileImage || null,
          phone: userData.employee?.phone || userData.phone || '',
          reportingManager: userData.employee?.reportingManager?.firstName
            ? `${userData.employee.reportingManager.firstName} ${userData.employee.reportingManager.lastName}`
            : 'N/A'
        };

        setEmployeeData(employee);

        if (!initialData && !isEditMode) {
          setFormData(prev => ({
            ...prev,
            employeeId: employee.id,
            employeePublicId: userData.employee?.publicId || userData.publicId || "",
            employeeName: employee.name
          }));
        }
      } else {
        toast.error(response.message || 'Failed to load employee data');
      }
    } catch (error) {
      console.error('Error fetching employee profile:', error);
      toast.error('Failed to load employee profile');

      setEmployeeData({
        id: 'EMP001',
        name: 'Current User',
        firstName: 'Current',
        lastName: 'User',
        email: 'employee@company.com',
        employeeId: 'EMP001',
        designation: 'Software Engineer',
        department: 'Engineering',
        profileImage: null,
        phone: '+1234567890',
        reportingManager: 'John Manager'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    try {
      setEmployeeLoading(true);
      const response = await employeeService.getAllEmployees({ page: 1, limit: 100 });
      const employees = response.success
        ? response.data?.employees || response.data || []
        : response.data?.employees || response.data || [];
      const formatted = employees.map((emp) => ({
        id: emp.id || emp.publicId || emp.employeeId,
        publicId: emp.publicId || emp.id,
        employeeId: emp.employeeId || emp.employeeCode || emp.publicId,
        name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || emp.name || "Employee",
        firstName: emp.firstName || "",
        lastName: emp.lastName || "",
        designation: emp.designation?.name || emp.designation || "N/A",
        department: emp.department?.name || emp.department || "N/A",
        profileImage: emp.profileImage || null,
        email: emp.email || "",
        phone: emp.phone || "",
        status: emp.status || "ACTIVE",
        reportingManager: emp.reportingManager?.firstName
          ? `${emp.reportingManager.firstName} ${emp.reportingManager.lastName}`
          : emp.reportingManager || "N/A",
      }));
      setEmployeeOptions(formatted);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setEmployeeLoading(false);
    }
  };

  const handleEmployeeSelect = (value) => {
    const selected = employeeOptions.find((emp) => emp.id.toString() === value);
    if (selected) {
      setEmployeeData(selected);
      setFormData((prev) => ({
        ...prev,
        employeeId: selected.id,
        employeePublicId: selected.publicId || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        employeeId: value,
      }));
    }
  };

  const fetchLeaveRequestDetails = async () => {
    if (!initialData?.id) return;

    try {
      setLoading(true);
      const response = await leaveRequestService.getLeaveRequestById(initialData.id);

      if (response.success && response.data) {
        const data = response.data;

        const parseDate = (date) => {
          if (!date) return '';
          const dateObj = new Date(date);
          return dateObj.toISOString().split('T')[0];
        };

        const formData = {
          leaveType: data.leaveType?.name || '',
          reason: data.reason || '',
          days: data.days || 0,
          fromDate: parseDate(data.fromDate),
          toDate: parseDate(data.toDate),
          startDateBreakdown: data.startDateBreakdown || 'FULL_DAY',
          endDateBreakdown: data.endDateBreakdown || 'FULL_DAY',
          attachment: null
        };

        setFormData(formData);
        setCalculatedDays(data.days || 0);

        if (data.attachmentUrl) {
          setExistingAttachment({
            url: data.attachmentUrl,
            name: data.attachmentName || 'Attachment'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching leave request details:', error);
      toast.error('Failed to load leave request details');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const response = await leaveRequestService.getLeaveTypesDropdown();
      if (response.success && response.data) {
        setLeaveTypes(response.data);
      } else {
        setLeaveTypes([
          { id: 1, name: 'Sick Leave' },
          { id: 2, name: 'Annual Leave' },
          { id: 3, name: 'Casual Leave' },
          { id: 4, name: 'Maternity Leave' },
          { id: 5, name: 'Paternity Leave' },
          { id: 6, name: 'Medical Leave' },
          { id: 7, name: 'Personal Leave' },
          { id: 8, name: 'Emergency Leave' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching leave types:', error);
      setLeaveTypes([
        { id: 1, name: 'Sick Leave' },
        { id: 2, name: 'Annual Leave' },
        { id: 3, name: 'Casual Leave' },
        { id: 4, name: 'Maternity Leave' },
        { id: 5, name: 'Paternity Leave' },
        { id: 6, name: 'Medical Leave' },
        { id: 7, name: 'Personal Leave' },
        { id: 8, name: 'Emergency Leave' }
      ]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid file type (JPEG, PNG, PDF, DOC, DOCX)');
        return;
      }

      setFormData(prev => ({
        ...prev,
        attachment: file,
        attachmentName: file.name
      }));

      setExistingAttachment(null);
    }
  };

  const removeAttachment = () => {
    setFormData(prev => ({
      ...prev,
      attachment: null,
      attachmentName: ''
    }));
    setExistingAttachment(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBreakdownChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (enableEmployeeSelect && !formData.employeeId) {
      toast.error('Please select an employee');
      return;
    }

    if (!formData.leaveType) {
      toast.error('Please select a leave type');
      setSubmitting(false);
      return;
    }

    // Additional validation to ensure leave type is valid
    if (typeof formData.leaveType !== 'string' || formData.leaveType.trim() === '') {
      toast.error('Please select a valid leave type');
      setSubmitting(false);
      return;
    }

    if (!formData.reason) {
      toast.error('Please provide a reason');
      return;
    }

    if (!formData.fromDate || !formData.toDate) {
      toast.error('Please select both from and to dates');
      return;
    }

    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      toast.error('From date cannot be after to date');
      return;
    }

    const minBackdate = getMinBackdate();
    const from = new Date(formData.fromDate);
    from.setHours(0, 0, 0, 0);
    if (from < minBackdate) {
      toast.error(
        canBackdate
          ? "Backdated leave is limited to 30 days."
          : "Backdated leave is only allowed for HR Admin or Company Admin."
      );
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (employeeData?.status === "NOTICE_PERIOD") {
      toast.error('Leave cannot be requested for employees in notice period');
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        employeeId: formData.employeeId || employeeData?.id || undefined,
        employeePublicId: formData.employeePublicId || undefined,
        source: enableEmployeeSelect ? "HR_MANUAL_ADJUSTMENT" : undefined,
        leaveType: formData.leaveType,
        reason: formData.reason,
        days: calculatedDays,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        startDateBreakdown: formData.startDateBreakdown.toLowerCase(),
        endDateBreakdown: formData.endDateBreakdown.toLowerCase(),
        attachment: formData.attachment
      };

      // Remove any undefined fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      let response;
      if (isEditMode && initialData?.id) {
        response = await leaveRequestService.updateLeaveRequest(initialData.id, submitData);
      } else {
        response = await leaveRequestService.createLeaveRequest(submitData);
      }

      if (response.success) {
        toast.success(isEditMode ? 'Leave request updated successfully' : 'Leave request submitted successfully');

        if (redirectOnSubmit) {
          router.push('/hr/leave/requests');
          router.refresh();
        }

        if (onSave) {
          onSave(response.data);
        }
      } else {
        toast.error(response.message || 'Failed to save leave request');
      }
    } catch (error) {
      console.error('Error saving leave request:', error);
      toast.error(error.message || 'Failed to save leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = onCancel || (() => router.back());

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if ((loading && isEditMode) || profileLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
          <span className="text-gray-600 dark:text-gray-400">
            {profileLoading ? 'Loading employee data...' : 'Loading leave request details...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <button
            onClick={handleCancel}
            className="mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            disabled={submitting}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Leave Request' : 'Add New Leave Request'}
          </h3>
        </div>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          disabled={submitting}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center">
          {employeeData?.profileImage ? (
            <img
              src={employeeData.profileImage}
              alt={employeeData.name}
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {employeeData?.name || employeeData?.firstName}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Employee ID: {employeeData?.employeeId || 'N/A'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {employeeData?.designation || 'N/A'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {employeeData?.department || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="mt-2 sm:mt-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  {enableEmployeeSelect ? 'Leave Beneficiary' : 'Leave Requester'}
                </span>
              </div>
            </div>
            {employeeData?.reportingManager && employeeData.reportingManager !== 'N/A' && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Reporting Manager: <span className="font-medium">{employeeData.reportingManager}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
        {enableEmployeeSelect && (
          <div className="rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300">
            Manual leave adjustments will update selected employee&apos;s balance and appear in
            their portal once the backend processes the request.
          </div>
        )}

        {employeeData?.status === "PROBATION" && (
          <div className="rounded-sm border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs text-indigo-700 dark:border-indigo-900/40 dark:bg-indigo-900/20 dark:text-indigo-300 flex items-start gap-2">
            <Info size={14} className="mt-0.5" />
            <div>
              <span className="font-bold">PROBATION NOTE:</span> This employee is currently in probation.
              While ELs are accrued monthly, standard policy disables leave application for the employee
              until probation confirmation. HR may proceed with manual adjustment if necessary.
            </div>
          </div>
        )}

        {employeeData?.status === "NOTICE_PERIOD" && (
          <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300 flex items-start gap-2">
            <XCircle size={14} className="mt-0.5" />
            <div>
              <span className="font-bold">NOTICE PERIOD BLOCK:</span> This employee has submitted their resignation.
              System policy blocks all leave types for employees during the notice period.
            </div>
          </div>
        )}

        {helperText && (
          <div className="text-xs text-gray-500 dark:text-gray-400">{helperText}</div>
        )}

        {enableEmployeeSelect && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Employee *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={formData.employeeId}
                onChange={(e) => handleEmployeeSelect(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
                disabled={submitting || employeeLoading}
              >
                <option value="">Select employee</option>
                {employeeOptions.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeId || emp.publicId || emp.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Leave Type *
          </label>
          <select
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
            disabled={submitting}
          >
            <option value="">Select Leave Type</option>
            {leaveTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reason *
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Please provide a detailed reason for your leave request"
              required
              disabled={submitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Date *
            </label>
            <DatePicker
              name="fromDate"
              value={formData.fromDate}
              onChange={handleChange}
              minDate={getMinBackdate().toISOString().split('T')[0]}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={submitting}
            />

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date Breakdown
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'FULL_DAY', label: 'Full Day' },
                  { value: 'FIRST_HALF', label: 'First Half' },
                  { value: 'SECOND_HALF', label: 'Second Half' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="startDateBreakdown"
                      checked={formData.startDateBreakdown === option.value}
                      onChange={() => handleBreakdownChange('startDateBreakdown', option.value)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      disabled={submitting}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To Date *
            </label>
            <DatePicker
              name="toDate"
              value={formData.toDate}
              onChange={handleChange}
              minDate={formData.fromDate || getMinBackdate().toISOString().split('T')[0]}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={submitting}
            />

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date Breakdown
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'FULL_DAY', label: 'Full Day' },
                  { value: 'FIRST_HALF', label: 'First Half' },
                  { value: 'SECOND_HALF', label: 'Second Half' }
                ].map(option => (
                  <label key={option.value} className="flex items-center">
                    <input
                      type="radio"
                      name="endDateBreakdown"
                      checked={formData.endDateBreakdown === option.value}
                      onChange={() => handleBreakdownChange('endDateBreakdown', option.value)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      disabled={submitting}
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {formData.fromDate && formData.toDate && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Dates:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDateForDisplay(formData.fromDate)} to {formatDateForDisplay(formData.toDate)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-sm border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Calculated Leave Days:
            </span>
            <span className="text-lg font-bold text-blue-800 dark:text-blue-300">
              {calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Based on selected dates and breakdown options
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Attachment (Optional)
          </label>
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              className="hidden"
              disabled={submitting}
            />

            <button
              type="button"
              onClick={triggerFileInput}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-sm hover:bg-blue-100 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 disabled:opacity-50"
              disabled={submitting}
            >
              <Paperclip className="w-4 h-4 mr-2" />
              Upload File
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 5MB)
            </p>

            {(formData.attachmentName || existingAttachment) && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-sm dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center">
                  <Paperclip className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">
                    {formData.attachmentName || (existingAttachment && existingAttachment.name) || 'Attachment'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {existingAttachment?.url && (
                    <button
                      type="button"
                      onClick={() => window.open(existingAttachment.url, '_blank')}
                      className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      title="Download attachment"
                      disabled={submitting}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Remove attachment"
                    disabled={submitting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting}
            className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditMode ? 'Update Leave Request' : 'Submit Leave Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaveRequestForm;
