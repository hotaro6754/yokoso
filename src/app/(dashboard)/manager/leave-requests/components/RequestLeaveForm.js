"use client";

import { useState, useEffect } from "react";
import ManagerLeaveService from "@/services/manager/leave-requests.service";
import { toast } from "react-hot-toast";
import { Plus, FileText, Upload, X, Calendar, Info, AlertCircle } from "lucide-react";
import { userService } from "@/services/user-services/user.service";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/flatpickr.min.css";

export default function RequestLeaveForm({ onSubmitted }) {
  const [form, setForm] = useState({
    leaveTypeId: "",
    effectiveFrom: "",
    effectiveTo: "",
    remark: "",
    proof: null,
  });
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [errors, setErrors] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    fetchLeaveTypes();
    fetchProfile();
  }, []);

  const hideRemainingForType = (t) => {
    if (!t) return false;
    if (t.hideRemaining || t.isBalanceExempt) return true;
    const name = String(t.name || "").toLowerCase();
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

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await userService.getProfile();
      if (response.success) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const response = await ManagerLeaveService.getLeaveTypes();
      setLeaveTypes(response || []);
    } catch (error) {
      console.error("Failed to fetch leave types", error);
      toast.error("Failed to load leave types");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    const newValue = files ? files[0] : value;

    setForm(prev => {
      const updated = { ...prev, [name]: newValue };
      if (name === 'leaveTypeId' || name === 'effectiveFrom' || name === 'effectiveTo') {
        setAvailability(null);
      }
      return updated;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const checkAvailability = async () => {
    if (!form.leaveTypeId || !form.effectiveFrom || !form.effectiveTo) return;

    try {
      const result = await ManagerLeaveService.checkLeaveAvailability(
        form.effectiveFrom,
        form.effectiveTo,
        form.leaveTypeId
      );
      setAvailability(result);

      const isPastDateError = !result.available && result.message && result.message.toLowerCase().includes('past');

      if (!result.available && !isPastDateError) {
        setErrors(prev => ({ ...prev, availability: result.message }));
      } else {
        setErrors(prev => ({ ...prev, availability: null }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.leaveTypeId) newErrors.leaveTypeId = "Leave type is required.";
    if (!form.effectiveFrom) newErrors.effectiveFrom = "Start date is required.";
    if (!form.effectiveTo) newErrors.effectiveTo = "End date is required.";
    if (
      form.effectiveFrom &&
      form.effectiveTo &&
      form.effectiveTo < form.effectiveFrom
    ) {
      newErrors.effectiveTo = "End date cannot be earlier than start date.";
    }
    if (!form.remark) newErrors.remark = "Remarks are required.";

    const isPastDateError = availability && !availability.available && availability.message && availability.message.toLowerCase().includes('past');
    if (availability && !availability.available && !isPastDateError) {
      newErrors.availability = availability.message;
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('leaveTypeId', form.leaveTypeId);
      formData.append('fromDate', form.effectiveFrom);
      formData.append('toDate', form.effectiveTo);
      formData.append('reason', form.remark);
      if (form.proof) {
        formData.append('document', form.proof);
      }

      await ManagerLeaveService.requestLeave(formData);

      toast.success("Leave request submitted successfully!");
      setForm({
        leaveTypeId: "",
        effectiveFrom: "",
        effectiveTo: "",
        remark: "",
        proof: null,
      });
      setAvailability(null);
      if (onSubmitted) {
        onSubmitted();
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-primary-100/50 dark:border-gray-700 shadow-sm p-6 space-y-5"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl">
          <Plus size={18} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Submit Leave Request
        </h3>
      </div>

      {errors.availability && (
        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 rounded-xl text-sm">
          {errors.availability}
        </div>
      )}

      {userProfile?.status === "PROBATION" && (
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
          <div className="flex gap-3 text-xs text-indigo-800">
            <Info size={16} className="flex-shrink-0" />
            <p>
              <span className="font-bold">Probation Period:</span> You are currently in your probation period.
              While you accrue ELs monthly, you can only apply for leave after your probation is confirmed.
            </p>
          </div>
        </div>
      )}

      {userProfile?.status === "NOTICE_PERIOD" && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
          <div className="flex gap-3 text-xs text-red-800">
            <AlertCircle size={16} className="flex-shrink-0" />
            <p>
              <span className="font-bold">Notice Period:</span> Leave applications are restricted once resignation is submitted or during the notice period as per company policy.
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Leave Type Name <span className="text-red-500">*</span>
        </label>
        <select
          name="leaveTypeId"
          value={form.leaveTypeId}
          onChange={handleChange}
          disabled={loading}
          className="w-full px-4 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm"
        >
          <option value="">{loading ? "Loading..." : "Please Select Leave Type"}</option>
          {leaveTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name} {hideRemainingForType(type) ? "" : `(${type.remaining ?? type.balance?.remaining ?? 0} remaining)`}
            </option>
          ))}
        </select>
        {errors.leaveTypeId && (
          <p className="text-red-500 text-xs mt-1.5">{errors.leaveTypeId}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* FROM DATE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select From Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
            <Flatpickr
              value={form.effectiveFrom}
              onChange={(dates, dateStr) => {
                const iso = dateStr;
                setForm(prev => {
                  const newState = { ...prev, effectiveFrom: iso };
                  // If end date is now before start date, sync it
                  if (newState.effectiveTo && iso && newState.effectiveTo < iso) {
                    newState.effectiveTo = iso;
                  }
                  return newState;
                });
                if (errors.effectiveFrom) setErrors(prev => ({ ...prev, effectiveFrom: null }));
                setAvailability(null);
              }}
              onClose={checkAvailability}
              options={{
                dateFormat: "Y-m-d",
                altInput: true,
                altFormat: "d-m-Y",
                allowInput: false,
                clickOpens: true,
                disableMobile: true,
              }}
              className="w-full pl-9 pr-4 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer"
              placeholder="dd-mm-yyyy"
            />
          </div>
          {errors.effectiveFrom && (
            <p className="text-red-500 text-xs mt-1.5">{errors.effectiveFrom}</p>
          )}
        </div>

        {/* TO DATE */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select To Date <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" size={16} />
            <Flatpickr
              value={form.effectiveTo}
              onChange={(dates, dateStr) => {
                const iso = dateStr;
                setForm(prev => ({ ...prev, effectiveTo: iso }));
                if (errors.effectiveTo) setErrors(prev => ({ ...prev, effectiveTo: null }));
                setAvailability(null);
              }}
              onClose={checkAvailability}
              options={{
                dateFormat: "Y-m-d",
                altInput: true,
                altFormat: "d-m-Y",
                allowInput: false,
                clickOpens: true,
                disableMobile: true,
                minDate: form.effectiveFrom || null,
              }}
              className="w-full pl-9 pr-4 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm cursor-pointer"
              placeholder="dd-mm-yyyy"
            />
          </div>
          {errors.effectiveTo && (
            <p className="text-red-500 text-xs mt-1.5">{errors.effectiveTo}</p>
          )}
        </div>
      </div>

      {availability && availability.available && (
        <div className="p-3 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-500/30 rounded-xl text-sm font-medium">
          {availability.days} day(s) will be deducted.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Remarks <span className="text-red-500">*</span>
        </label>
        <textarea
          name="remark"
          value={form.remark}
          onChange={handleChange}
          rows={4}
          placeholder="Enter reason for leave..."
          className="w-full px-4 py-2.5 border border-primary-200/50 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 dark:focus:border-primary-500 transition-all duration-200 text-sm resize-none"
        />
        {errors.remark && (
          <p className="text-red-500 text-xs mt-1.5">{errors.remark}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Attach Proof Document (Optional)
        </label>
        <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-200/50 dark:border-primary-500/30 rounded-xl text-sm font-medium cursor-pointer hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors duration-200">
          <Upload size={16} />
          Upload Document
          <input
            type="file"
            name="proof"
            onChange={handleChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </label>
        {form.proof && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <FileText size={14} className="text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 truncate">{form.proof.name}</span>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={() => setForm(prev => ({ ...prev, proof: null }))}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || userProfile?.status === "PROBATION" || userProfile?.status === "NOTICE_PERIOD"}
          className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium shadow-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {submitting ? "Submitting..." :
            (userProfile?.status === "PROBATION" || userProfile?.status === "NOTICE_PERIOD") ? "Application Restricted" : "Submit Leave Request"}
        </button>
      </div>
    </form>
  );
}
