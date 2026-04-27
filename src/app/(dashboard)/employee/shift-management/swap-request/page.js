"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Loader2,
  RefreshCw,
  Clock,
  MapPin,
  Send,
  AlertCircle,
  SendIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { employeeShiftService } from "@/services/employee/shift.service";
import DatePicker from "@/components/common/DatePicker";

export default function SwapRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [peers, setPeers] = useState([]);
  const [formData, setFormData] = useState({
    date: "",
    peerId: "",
    reason: "",
    comments: "",
  });
  const [peerShift, setPeerShift] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    // Load eligible peers on page load
    employeeShiftService
      .getEligiblePeers()
      .then((res) => {
        if (res.success) setPeers(res.data);
      })
      .catch((error) => {
        toast.error("Failed to load eligible colleagues");
        console.error("Peers load error:", error);
      });
  }, []);

  // When peer and date selected, fetch peer shift
  useEffect(() => {
    if (formData.date && formData.peerId) {
      setLoading(true);
      employeeShiftService
        .getPeerShift(formData.peerId, formData.date)
        .then((res) => {
          if (res.success) setPeerShift(res.data);
          else setPeerShift(null);
        })
        .catch(() => setPeerShift(null))
        .finally(() => setLoading(false));
    } else {
      setPeerShift(null);
    }
  }, [formData.date, formData.peerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.peerId || !formData.reason) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitLoading(true);
    try {
      await employeeShiftService.requestSwap(formData);
      toast.success("Swap Request Submitted Successfully!");
      // Redirect back to shift management after successful submission
      router.push("/employee/shift-management");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  const selectedDate = formData.date ? new Date(formData.date) : null;
  const isDateValid = selectedDate && selectedDate >= new Date(today);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Shift Management
          </button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full mb-4">
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Request Shift Swap
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Swap your shift with a colleague for a specific date. Select a
            colleague, choose a date, and provide a reason for the swap request.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Date Selection */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
              <label htmlFor="swap-date" className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-3 mb-4 cursor-pointer">
                <Calendar className="w-6 h-6 text-brand-500" />
                Select Date to Swap
              </label>
              <div className="relative">
                <DatePicker
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  minDate={today}
                  required={true}
                  className={isDateValid ? "border-blue-300 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200" : ""}
                />
                {formData.date && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                    {isDateValid ? (
                      <div className="w-6 h-6 text-blue-500">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-8-8a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 text-red-500">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L10 10.414l-4.293 4.293a1 1 0 01-1.414-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {formData.date && !isDateValid && (
                <div className="mt-3 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  Please select a date that is today or in the future
                </div>
              )}
            </div>

            {/* Peer Selection */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
              <label className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-3 mb-4">
                <User className="w-6 h-6 text-brand-500" />
                Select Colleague to Swap With
              </label>
              <select
                name="peerId"
                value={formData.peerId}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-lg font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                required
              >
                <option value="">
                  Choose a colleague from your team...
                </option>
                {peers.map((peer) => (
                  <option key={peer.id} value={peer.id}>
                    {peer.name} ({peer.designation}) -{" "}
                    {peer.shift || "No shift assigned"}
                  </option>
                ))}
              </select>
            </div>

            {/* Peer Shift Preview */}
            {peerShift ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                    Colleague's Shift Details
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 dark:text-gray-400">
                      Shift:
                    </span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                      {peerShift.shift}
                    </span>
                    <span className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-sm font-mono">
                      {peerShift.shiftCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 dark:text-gray-400">
                      Timing:
                    </span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                      {peerShift.timing}
                    </span>
                  </div>
                </div>
              </div>
            ) : formData.date && formData.peerId ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-center gap-3 text-lg text-yellow-800 dark:text-yellow-200">
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Checking colleague's schedule...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      No shift found for selected colleague on this date
                    </>
                  )}
                </div>
              </div>
            ) : null}

            {/* Reason Selection */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
              <label className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-brand-500" />
                Reason for Swap Request
              </label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-lg font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                required
              >
                <option value="">
                  Select a reason for your swap request...
                </option>
                <option value="Personal Emergency">
                  🚨 Personal Emergency
                </option>
                <option value="Medical">🏥 Medical / Doctor Appointment</option>
                <option value="Commute">🚗 Commute Issues</option>
                <option value="Family">👨‍👩‍👧 Family Commitment</option>
                <option value="Other">📋 Other</option>
              </select>
            </div>

            {/* Comments */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
              <label className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-brand-500" />
                Additional Comments (Optional)
              </label>
              <textarea
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-lg font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
                placeholder="Provide any additional details about your swap request... Max 500 characters"
              ></textarea>
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {formData.comments.length}/500 characters
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.push("/employee/shift-management")}
                className="flex-1 px-8 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading || !peerShift || !isDateValid}
                className="flex-1 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg flex justify-center gap-3 shadow-lg"
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Submitting Swap Request...
                  </>
                ) : (
                  <>
                    <SendIcon className="w-6 h-6" />
                    Submit Swap Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
