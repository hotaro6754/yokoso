"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Upload, 
  X, 
  FileText, 
  Info, 
  AlertCircle, 
  Calendar as CalendarIcon, 
  Paperclip, 
  Download, 
  Trash2, 
  Loader2 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { userService } from "@/services/user-services/user.service";
import EmployeeLeaveService from "@/services/employee/leave.service";
import { holidayService } from "@/services/hr-services/leave-holiday-calender.service";
import DatePicker from "@/components/common/DatePicker";
import LeaveTypeForm from "@/app/(dashboard)/hr/leave/components/LeaveTypeForm";
import { leaveTypeService } from "@/services/hr-services/leaveTypeService";

export default function RequestLeaveForm({ compact = false, onSuccess }) {
  const [form, setForm] = useState({
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    startDateBreakdown: "FULL_DAY",
    endDateBreakdown: "FULL_DAY",
    reason: "",
    attachment: null,
    attachmentName: ""
  });

  const [leaveTypes, setLeaveTypes] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const isFinanceModule = typeof window !== "undefined" && window.location.pathname.startsWith("/finance-role");
  const normalizedRole = (userProfile?.systemRole || userProfile?.role || "").toUpperCase();
  const canBackdate = ["HR_ADMIN", "COMPANY_ADMIN"].includes(normalizedRole);
  
  const fileInputRef = useRef(null);
  const canManageLeaveTypes = ["SUPER_ADMIN", "HR_ADMIN"].includes(normalizedRole);
  const [showAddLeaveType, setShowAddLeaveType] = useState(false);
  const [creatingLeaveType, setCreatingLeaveType] = useState(false);

  const isBalanceExemptType = (t) => {
    if (!t) return false;
    if (t.isBalanceExempt || t.hideRemaining) return true;
    const name = String(t.type || t.name || "").toLowerCase();
    return (
      name.includes("emergency") ||
      name.includes("optional holiday") ||
      name.includes("loss of pay") ||
      name.includes("lop") ||
      name.includes("work from home") ||
      name.includes("wfh") ||
      name.includes("remote")
    );
  };

  const mergeLeaveTypes = (balanceTypes = [], dropdownTypes = []) => {
    const byId = new Map();

    for (const t of balanceTypes) {
      if (!t) continue;
      byId.set(Number(t.id), t);
    }

    // `getLeaveTypesDropdown` returns LeaveType records: { id, name, limitDays, ... }
    for (const lt of dropdownTypes) {
      const id = Number(lt?.id);
      if (!id || byId.has(id)) continue;

      const limit = Number(lt?.limitDays ?? 0);
      byId.set(id, {
        id,
        type: lt?.name || "Leave",
        allocated: limit,
        used: 0,
        remaining: limit,
        color: lt?.color,
        icon: lt?.icon,
        limit
      });
    }

    return Array.from(byId.values()).sort((a, b) =>
      String(a?.type || "").localeCompare(String(b?.type || ""))
    );
  };

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
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profile, balance, holidayData, leaveTypeDropdown] = await Promise.all([
          userService.getProfile(),
          EmployeeLeaveService.getLeaveBalance(),
          holidayService.getHolidaysForCurrentYear().catch(() => ({ success: true, data: [] })),
          leaveTypeService.getLeaveTypesDropdown().catch(() => ({ data: [] }))
        ]);

        if (profile.success) setUserProfile(profile.data);
        
        if (balance && balance.leaveTypes) {
          const merged = mergeLeaveTypes(
            balance.leaveTypes,
            leaveTypeDropdown?.data || []
          );
          setLeaveBalances(merged);
          setLeaveTypes(merged);
        }

        if (holidayData.success && holidayData.data) {
          setHolidays(holidayData.data);
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error("Failed to load leave data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateLeaveType = async (payload) => {
    try {
      setCreatingLeaveType(true);
      // When creating from the Apply Leave flow, we always want the type usable immediately.
      const response = await leaveTypeService.createLeaveType({
        ...payload,
        isActive: true,
        status: "active"
      });
      toast.success(response?.message || "Leave type created");

      // Refresh balances so the new type appears in the dropdown immediately
      const [refreshed, leaveTypeDropdown] = await Promise.all([
        EmployeeLeaveService.getLeaveBalance().catch(() => null),
        leaveTypeService.getLeaveTypesDropdown().catch(() => ({ data: [] }))
      ]);

      const merged = mergeLeaveTypes(
        refreshed?.leaveTypes || leaveTypes,
        leaveTypeDropdown?.data || []
      );

      setLeaveBalances(merged);
      setLeaveTypes(merged);

      const createdId = response?.data?.id;
      if (createdId) {
        setForm((prev) => ({ ...prev, leaveTypeId: String(createdId) }));
      }

      setShowAddLeaveType(false);
    } catch (error) {
      console.error("Failed to create leave type", error);
      toast.error(error.message || "Failed to create leave type");
    } finally {
      setCreatingLeaveType(false);
    }
  };

  // Calculate days exactly like HR form
  useEffect(() => {
    if (!form.fromDate || !form.toDate) {
      setCalculatedDays(0);
      return;
    }

    const start = new Date(form.fromDate);
    const end = new Date(form.toDate);

    if (start > end) {
      setCalculatedDays(0);
      return;
    }

    let hasBalance = false;
    if (form.leaveTypeId) {
      const balanceObj = leaveBalances.find(b => b.id === parseInt(form.leaveTypeId));
      if (balanceObj) {
        hasBalance = balanceObj.remaining > 0;
      }
    }

    let diffDays = 0;
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      const dateStr = currentDate.toISOString().split('T')[0];
      const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
      
      const isHoliday = holidays.some(h => {
        if (!h.date) return false;
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
      const isStartWeekend = startDayOfWeek === 0 || startDayOfWeek === 6;
      const isStartHoliday = holidays.some(h => h.date && new Date(h.date).toISOString().split('T')[0] === start.toISOString().split('T')[0]);
      const startIsFree = hasBalance && (isStartWeekend || isStartHoliday);
      
      const endDayOfWeek = end.getDay();
      const isEndWeekend = endDayOfWeek === 0 || endDayOfWeek === 6;
      const isEndHoliday = holidays.some(h => h.date && new Date(h.date).toISOString().split('T')[0] === end.toISOString().split('T')[0]);
      const endIsFree = hasBalance && (isEndWeekend || isEndHoliday);

      if (start.toDateString() === end.toDateString()) {
        if (!startIsFree) {
          diffDays = form.startDateBreakdown === 'FULL_DAY' ? 1 : 0.5;
        } else {
          diffDays = 0;
        }
      } else {
        if (!startIsFree && form.startDateBreakdown !== 'FULL_DAY') {
          diffDays -= 0.5;
        }
        if (!endIsFree && form.endDateBreakdown !== 'FULL_DAY') {
          diffDays -= 0.5;
        }
      }
    }

    setCalculatedDays(diffDays);
  }, [form.fromDate, form.toDate, form.startDateBreakdown, form.endDateBreakdown, holidays, form.leaveTypeId, leaveBalances]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleBreakdownChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setForm(prev => ({ ...prev, attachment: file, attachmentName: file.name }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.leaveTypeId) return toast.error("Please select leave type");
    if (!form.reason) return toast.error("Please provide a reason");
    if (calculatedDays <= 0) return toast.error("Invalid leave duration");

    const minBackdate = getMinBackdate();
    const from = new Date(form.fromDate);
    from.setHours(0, 0, 0, 0);
    if (from < minBackdate) {
      toast.error(
        canBackdate
          ? "Backdated leave is limited to 30 days."
          : "Backdated leave is only allowed for HR Admin or Company Admin."
      );
      return;
    }

    // Get selected leave type details
    const selectedType = leaveBalances.find(b => b.id === parseInt(form.leaveTypeId));

    // Check balance (skip for Emergency/WFH/LOP/Optional Holiday types)
    if (selectedType && !isBalanceExemptType(selectedType)) {
      if (calculatedDays > selectedType.remaining) {
        if (!isFinanceModule) {
          return toast.error(`Insufficient balance. You have ${selectedType.remaining} days available.`);
        }
        toast(`Balance is ${selectedType.remaining} days. Request will be sent for approval.`);
      }
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('leaveTypeId', form.leaveTypeId);
      formData.append('fromDate', form.fromDate);
      formData.append('toDate', form.toDate);
      formData.append('startDateBreakdown', form.startDateBreakdown);
      formData.append('endDateBreakdown', form.endDateBreakdown);
      formData.append('days', calculatedDays);
      formData.append('reason', form.reason);

      if (form.attachment) {
        formData.append('document', form.attachment);
      }

      await EmployeeLeaveService.requestLeave(formData);
      toast.success("Requests submitted successfully!");
      if (onSuccess) onSuccess();
      setForm({
        leaveTypeId: "",
        fromDate: "",
        toDate: "",
        startDateBreakdown: "FULL_DAY",
        endDateBreakdown: "FULL_DAY",
        reason: "",
        attachment: null,
        attachmentName: ""
      });
    } catch (error) {
      toast.error(error.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-sm border border-gray-200 p-8 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
        <span className="text-xs text-gray-500">Loading leave data...</span>
      </div>
    );
  }

  const isRestricted = userProfile?.status === "PROBATION" || userProfile?.status === "NOTICE_PERIOD";
  
  // Check if requested days exceed balance
  const selectedType = leaveBalances.find(b => b.id === parseInt(form.leaveTypeId));
  const isInsufficientBalance = !isFinanceModule &&
    selectedType &&
    !isBalanceExemptType(selectedType) &&
    calculatedDays > selectedType.remaining;

  return (
    <div className={`${compact ? '' : 'bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm'}`}>
      {!compact && (
        <div className="flex items-center gap-2 p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="p-1.5 bg-brand-50 dark:bg-brand-500/10 rounded-sm">
            <Plus size={16} className="text-brand-600" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900 dark:text-white">
            Submit Leave Request
          </h3>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${compact ? 'space-y-4' : 'p-6 space-y-6'}`}>
        {userProfile?.status === "PROBATION" && (
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-sm flex gap-3">
            <Info size={16} className="text-indigo-600 mt-0.5" />
            <p className="text-xs text-indigo-800 dark:text-indigo-300">
              <span className="font-bold">PROBATION NOTE:</span> You are currently in probation.
              While ELs are accrued monthly, policy disables leave application until confirmation.
            </p>
          </div>
        )}

        {userProfile?.status === "NOTICE_PERIOD" && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-sm flex gap-3">
            <AlertCircle size={16} className="text-red-600 mt-0.5" />
            <p className="text-xs text-red-800 dark:text-red-300">
              <span className="font-bold">NOTICE PERIOD BLOCK:</span> Leave applications are restricted during the notice period.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Left Column: Type & Reason */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Leave Type <span className="text-red-500">*</span>
                </label>
                {canManageLeaveTypes && (
                  <button
                    type="button"
                    onClick={() => setShowAddLeaveType(true)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-600 hover:text-brand-700 transition-colors"
                    disabled={submitting}
                  >
                    <Plus size={14} />
                    Add Type
                  </button>
                )}
              </div>
              <select
                name="leaveTypeId"
                value={form.leaveTypeId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-900 text-sm focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                disabled={isRestricted || submitting}
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.type} {isBalanceExemptType(type) ? '' : `(${type.remaining} left)`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                rows={compact ? 3 : 4}
                placeholder="Reason for leave..."
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-900 text-sm focus:ring-1 focus:ring-brand-500 outline-none resize-none transition-all"
                disabled={isRestricted || submitting}
              />
            </div>
          </div>

          {/* Right Column: Dates & Proof */}
          <div className="space-y-4">
            <div className={`grid grid-cols-1 ${compact ? '' : 'sm:grid-cols-2'} gap-4`}>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  From Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  name="fromDate"
                  value={form.fromDate}
                  onChange={handleChange}
                  minDate={getMinBackdate().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-900 text-sm focus:ring-1 focus:ring-brand-500 outline-none"
                  disabled={isRestricted || submitting}
                />
                
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                  {[
                    { value: 'FULL_DAY', label: 'Full Day' },
                    { value: 'FIRST_HALF', label: '1st Half' },
                    { value: 'SECOND_HALF', label: '2nd Half' }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="startDateBreakdown"
                          checked={form.startDateBreakdown === opt.value}
                          onChange={() => handleBreakdownChange('startDateBreakdown', opt.value)}
                          className="peer w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600"
                          disabled={isRestricted || submitting}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 group-hover:text-brand-600 transition-colors">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                  To Date <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  name="toDate"
                  value={form.toDate}
                  onChange={handleChange}
                  minDate={form.fromDate || getMinBackdate().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-900 text-sm focus:ring-1 focus:ring-brand-500 outline-none"
                  disabled={isRestricted || submitting}
                />

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                  {[
                    { value: 'FULL_DAY', label: 'Full Day' },
                    { value: 'FIRST_HALF', label: '1st Half' },
                    { value: 'SECOND_HALF', label: '2nd Half' }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input
                          type="radio"
                          name="endDateBreakdown"
                          checked={form.endDateBreakdown === opt.value}
                          onChange={() => handleBreakdownChange('endDateBreakdown', opt.value)}
                          className="peer w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600"
                          disabled={isRestricted || submitting}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 group-hover:text-brand-600 transition-colors">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-brand-50 dark:bg-brand-500/10 border border-brand-100 dark:border-brand-900/30 rounded-sm shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-brand-800 dark:text-brand-300 uppercase">Calculated Duration:</span>
                <span className="text-lg font-black text-brand-900 dark:text-brand-200">{calculatedDays} Day(s)</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Attachment (Optional)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              />
              {!form.attachmentName ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-600 rounded-sm text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-100 transition-colors shadow-sm"
                  disabled={isRestricted || submitting}
                >
                  <Upload size={14} />
                  <span>Upload Document</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-sm border border-gray-200 dark:border-gray-600">
                  <FileText size={14} className="text-brand-600" />
                  <span className="text-xs text-xs-700 dark:text-gray-300 truncate flex-1">{form.attachmentName}</span>
                  <button type="button" onClick={() => setForm(p => ({ ...p, attachment: null, attachmentName: "" }))} className="text-red-500 hover:text-red-700">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            type="submit"
            disabled={submitting || isRestricted || calculatedDays <= 0 || isInsufficientBalance}
            className="w-full md:w-auto md:min-w-[200px] flex items-center justify-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold uppercase tracking-widest rounded-sm shadow-md shadow-brand-200 dark:shadow-none hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Submit Request</span>
            )}
          </button>
        </div>
      </form>

      {showAddLeaveType && canManageLeaveTypes && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              if (!creatingLeaveType) setShowAddLeaveType(false);
            }}
          />
          <div className="relative w-full max-w-3xl">
            <LeaveTypeForm
              onSave={handleCreateLeaveType}
              onCancel={() => setShowAddLeaveType(false)}
              isSubmitting={creatingLeaveType}
            />
          </div>
        </div>
      )}
    </div>
  );
}
