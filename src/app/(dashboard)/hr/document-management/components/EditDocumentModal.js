"use client";

import { useState, useEffect } from "react";
import { X, Save, Calendar, FileText, AlertCircle } from "lucide-react";
import { documentsService } from "@/services/hr-services/documents.service";
import { toast } from "react-hot-toast";
import Label from "@/components/form/Label";
import InputField from "@/components/form/input/InputField";
import SelectField from "../../employees/add/components/SelectField";
import DatePickerField from "@/components/form/input/DatePickerField";

export default function EditDocumentModal({ isOpen, onClose, document, onUpdate }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    status: "",
    description: "",
    expiresAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (document && isOpen) {
      const docData = document.raw || document;
      setFormData({
        name: docData.name || document.name || "",
        type: docData.type || document.type || "",
        status: docData.status || document.status || "PENDING",
        description: docData.description || document.description || "",
        expiresAt: docData.expiresAt || document.expiresAt
          ? new Date(docData.expiresAt || document.expiresAt).toISOString().split("T")[0]
          : "",
      });
      setErrors({});
    }
  }, [document, isOpen]);

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

    try {
      setLoading(true);
      const updateData = {
        name: formData.name,
        type: formData.type,
        status: formData.status,
        description: formData.description,
      };

      if (formData.expiresAt) {
        updateData.expiresAt = new Date(formData.expiresAt).toISOString();
      }

      const docId = (document.raw || document).id || document.id;
      await documentsService.updateDocument(docId, updateData);
      toast.success("Document updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error(error.message || "Failed to update document");
    } finally {
      setLoading(false);
    }
  };

  const documentTypes = [
    { value: "ID_PROOF", label: "ID Proof" },
    { value: "ADDRESS_PROOF", label: "Address Proof" },
    { value: "AADHAAR", label: "Aadhaar Card" },
    { value: "PAN", label: "PAN Card" },
    { value: "EDUCATION", label: "Educational Credentials" },
    { value: "EMPLOYMENT_LETTER", label: "Employment Letters" },
    { value: "OFFER_LETTER", label: "Offer Letters" },
    { value: "CONTRACT", label: "Contracts" },
    { value: "RESUME", label: "Resume" },
    { value: "PHOTO", label: "Photo" },
    { value: "EXPERIENCE", label: "Experience Certificate" },
    { value: "OTHER", label: "Other" },
  ];

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "VERIFIED", label: "Verified" },
    { value: "REJECTED", label: "Rejected" },
    { value: "EXPIRED", label: "Expired" },
  ];

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ring-1 ring-gray-200 dark:ring-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2">
              <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit Document
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update document details, status, and expiry information
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
          {/* Document Name */}
          <div className="space-y-2">
            <Label htmlFor="name" required>
              Document Name
            </Label>
            <InputField
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={errors.name}
              placeholder="Enter document name"
            />
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <Label htmlFor="type" required>
              Document Type
            </Label>
            <SelectField
              name="type"
              options={documentTypes}
              value={formData.type}
              onChange={(value) => handleInputChange("type", value)}
              error={errors.type}
              placeholder="Select document type"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status" required>
              Status
            </Label>
            <SelectField
              name="status"
              options={statusOptions}
              value={formData.status}
              onChange={(value) => handleInputChange("status", value)}
              error={errors.status}
              placeholder="Select status"
            />
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">
              Expiry Date (Optional)
            </Label>
            <DatePickerField
              id="expiresAt"
              name="expiresAt"
              value={formData.expiresAt}
              onChange={(date) => {
                // date is typically returned as "Y-m-d" string or Date object from some pickers
                // DatePickerField returns flatpickr string or dates.
                // Assuming DatePickerField implementation returns correctly formatted string or date.
                // Checking DatePickerField.js: onChange?.(dateStr)
                handleInputChange("expiresAt", date); // dateStr
              }}
              placeholder="Select expiry date"
              error={errors.expiresAt}
            />
            {formData.expiresAt && (
              <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 mt-1">
                <AlertCircle className="w-3 h-3" />
                <span>Document will be tracked for expiry</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-gray-900 dark:text-white resize-none transition-all"
              placeholder="Enter document description or notes..."
            />
          </div>

          {/* Employee Info (Read-only) */}
          {document.employeeName && (
            <div className="p-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                EMPLOYEE
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {document.employeeName}
              </p>
              {document.employeeEmployeeId && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ID: {document.employeeEmployeeId}
                </p>
              )}
            </div>
          )}

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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
