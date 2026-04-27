"use client";

import { useState, useEffect } from "react";
import { X, Save, FileText, AlertCircle } from "lucide-react";
import { attendanceService } from "@/services/hr-services/attendace.service";
import { toast } from "react-hot-toast";
import Label from "@/components/form/Label";
import InputField from "@/components/form/input/InputField";
import SelectField from "../../employees/add/components/SelectField";

// src/components/form/input/TimePickerField.js
import TimePickerField from "@/components/form/input/TimePickerField";

export default function CorrectAttendanceModal({ isOpen, onClose, attendance, onUpdate }) {
  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    status: "",
    totalHours: "",
    totalHoursValue: null,
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const calculateTotalHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "";
    const [inHours, inMinutes] = checkIn.split(":").map(Number);
    const [outHours, outMinutes] = checkOut.split(":").map(Number);
    if (Number.isNaN(inHours) || Number.isNaN(inMinutes) || Number.isNaN(outHours) || Number.isNaN(outMinutes)) {
      return "";
    }
    const inTotalMinutes = inHours * 60 + inMinutes;
    const outTotalMinutes = outHours * 60 + outMinutes;
    if (outTotalMinutes <= inTotalMinutes) return "";
    const diffMinutes = outTotalMinutes - inTotalMinutes;
    const hours = String(Math.floor(diffMinutes / 60)).padStart(2, "0");
    const minutes = String(diffMinutes % 60).padStart(2, "0");
    return { display: `${hours}:${minutes}`, value: Number((diffMinutes / 60).toFixed(2)) };
  };

  useEffect(() => {
    if (attendance && isOpen) {
      const attData = attendance.raw || attendance;
      const recordAttendance = attData.attendance || attData;
      const metrics = attData.metrics || {};
      const metricHours = metrics.productionHours && metrics.productionHours !== "00:00"
        ? metrics.productionHours
        : "";
      const totalHoursValue = metricHours
        ? {
          display: metricHours,
          value: Number((Number(metricHours.split(":")[0]) + Number(metricHours.split(":")[1]) / 60).toFixed(2))
        }
        : { display: "", value: null };
      setFormData({
        checkIn: recordAttendance.checkIn || "",
        checkOut: recordAttendance.checkOut || "",
        status: recordAttendance.status || "PRESENT",
        totalHours: totalHoursValue.display,
        totalHoursValue: totalHoursValue.value,
        reason: "",
      });
      setErrors({});
    }
  }, [attendance, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const computed = calculateTotalHours(formData.checkIn, formData.checkOut);
    setFormData((prev) => ({
      ...prev,
      totalHours: computed?.display || "",
      totalHoursValue: computed?.value ?? null,
    }));
  }, [formData.checkIn, formData.checkOut, isOpen]);
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      setErrors({ reason: "Reason is required for attendance correction" });
      return;
    }

    try {
      setLoading(true);
      console.log('attendance', attendance)
      // Use attendanceId if available (from corrections data), otherwise fallback to regular id
      const attId = (attendance.raw || attendance).attendanceId ||
        (attendance.raw || attendance).id ||
        attendance.attendanceId ||
        attendance.id || attendance?.attendance?.id

      if (!attId) {
        const attData = attendance.raw || attendance;
        const employeeId = attData.employee?.id;
        const attendanceDate = attendance.date || attData.date;

        if (!employeeId || !attendanceDate) {
          throw new Error("Employee and date are required to create attendance");
        }

        const isLop = formData.status === "LOP";
        const finalStatus = isLop ? "ABSENT" : formData.status;
        const finalNotes = isLop && !formData.reason.includes("[LOP]")
          ? `[LOP] ${formData.reason}`
          : formData.reason;

        const createData = {
          employeeId,
          date: attendanceDate,
          checkIn: formData.checkIn || undefined,
          checkOut: formData.checkOut || undefined,
          status: finalStatus || undefined,
          totalHours: formData.totalHoursValue !== null ? formData.totalHoursValue : undefined,
          notes: finalNotes
        };

        Object.keys(createData).forEach(
          (key) => createData[key] === undefined && delete createData[key]
        );

        await attendanceService.createAttendance(createData);
        toast.success("Attendance created successfully");
      } else {
        const isLop = formData.status === "LOP";
        const finalStatus = isLop ? "ABSENT" : formData.status;
        const finalReason = isLop && !formData.reason.includes("[LOP]")
          ? `[LOP] ${formData.reason}`
          : formData.reason;

        const correctionData = {
          checkIn: formData.checkIn || undefined,
          checkOut: formData.checkOut || undefined,
          status: finalStatus || undefined,
          totalHours: formData.totalHoursValue !== null ? formData.totalHoursValue : undefined,
          reason: finalReason,
        };

        // Remove undefined fields
        Object.keys(correctionData).forEach(
          (key) => correctionData[key] === undefined && delete correctionData[key]
        );

        await attendanceService.correctAttendance(attId, correctionData);
        toast.success("Attendance corrected successfully");
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error correcting attendance:", error);
      toast.error(error.message || "Failed to correct attendance");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "PRESENT", label: "Present" },
    { value: "ABSENT", label: "Absent" },
    { value: "LOP", label: "Loss of Pay (LOP)" },
    { value: "LATE", label: "Late" },
    { value: "HALF_DAY", label: "Half Day" },
    { value: "EARLY_LEAVE", label: "Early Leave" },
    { value: "HOLIDAY", label: "Holiday" },
    { value: "WEEKEND", label: "Weekend" },
    { value: "PENDING", label: "Pending" },
  ];

  if (!isOpen || !attendance) return null;

  const attData = attendance.raw || attendance;
  const recordAttendance = attData.attendance || attData;
  const metrics = attData.metrics || {};
  const employee = attData.employee || {};
  const recordDate = attendance.date || attData.date;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Correct Attendance
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update attendance record with reason for tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Employee Info (Read-only) */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">EMPLOYEE</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {employee.name || `${employee.firstName || ""} ${employee.lastName || ""}`.trim()}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ID: {employee.employeeId || "-"} | Date:{" "}
              {recordDate
                ? new Date(recordDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
                : "-"}
            </p>
          </div>

          {/* Current Values */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                CURRENT CHECK IN
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {recordAttendance.checkIn || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                CURRENT CHECK OUT
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {recordAttendance.checkOut || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                CURRENT STATUS
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {recordAttendance.status || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                CURRENT HOURS
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {recordAttendance.totalHours !== undefined && recordAttendance.totalHours !== null
                  ? `${recordAttendance.totalHours} hrs`
                  : metrics.productionHours && metrics.productionHours !== "00:00"
                    ? metrics.productionHours
                    : "-"}
              </p>
            </div>
          </div>

          {/* Correction Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <TimePickerField
                label="Check In Time (HH:mm)"
                value={formData.checkIn}
                onChange={(value) => handleInputChange("checkIn", value)}
                error={errors.checkIn}
              />
            </div>

            <div className="space-y-2">
              <TimePickerField
                label="Check Out Time (HH:mm)"
                value={formData.checkOut}
                onChange={(value) => handleInputChange("checkOut", value)}
                error={errors.checkOut}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <SelectField
                name="status"
                options={statusOptions}
                value={formData.status}
                onChange={(value) => handleInputChange("status", value)}
                error={errors.status}
                placeholder="Select status"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalHours">Total Hours</Label>
              <InputField
                id="totalHours"
                type="text"
                value={formData.totalHours}
                readOnly
                disabled
                error={errors.totalHours}
                placeholder="00:00"
              />
            </div>
          </div>

          {/* Reason (Required) */}
          <div className="space-y-2">
            <Label htmlFor="reason" required>
              Reason for Correction
            </Label>
            <textarea
              id="reason"
              rows={4}
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              className={`w-full px-4 py-2 bg-white dark:bg-gray-700 border ${errors.reason ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                } rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-gray-900 dark:text-white resize-none`}
              placeholder="Enter reason for attendance correction (required)..."
            />
            {errors.reason && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.reason}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mt-1">
              <AlertCircle className="w-3 h-3" />
              <span>Reason is required and will be logged for audit purposes</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Correcting...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Correct Attendance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
