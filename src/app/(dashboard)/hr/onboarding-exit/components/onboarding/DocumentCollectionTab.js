"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { onboardingExitService } from "@/services/hr-services/onboarding-exit.service";
import { toast } from "react-hot-toast";

export default function DocumentCollectionTab({ employeeId }) {
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const isLockedToEmployee = Boolean(employeeId);

  useEffect(() => {
    if (isLockedToEmployee && employeeId) {
      setSelectedEmployeeId(employeeId);
      return;
    }
    if (selectedEmployeeId) {
      fetchDocuments();
    }
  }, [selectedEmployeeId, employeeId, isLockedToEmployee]);

  const fetchDocuments = async () => {
    if (!selectedEmployeeId) return;
    try {
      setLoading(true);
      const response = await onboardingExitService.getDocumentCollection(selectedEmployeeId);
      const data = response.success ? response.data : response;
      setDocumentData(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error(error.message || "Failed to fetch documents");
      setDocumentData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      VERIFIED: { icon: CheckCircle, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      PENDING: { icon: Clock, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
      REJECTED: { icon: XCircle, className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    };
    const statusConfig = config[status] || config.PENDING;
    const Icon = statusConfig.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      AADHAAR: "Aadhaar Card",
      PAN: "PAN Card",
      RESUME: "Resume",
      PHOTO: "Photo",
      ID_PROOF: "ID Proof",
      ADDRESS_PROOF: "Address Proof",
      OFFER_LETTER: "Offer Letter",
      EMPLOYMENT_LETTER: "Employment Letter",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {!isLockedToEmployee && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
          Select an employee from the onboarding dashboard to review document collection.
        </div>
      )}

      {/* Document Collection Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : documentData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          {documentData.summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {documentData.summary.total || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Collected</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {documentData.summary.collected || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Missing</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {documentData.summary.missing || 0}
                </p>
              </div>
            </div>
          )}

          {/* Employee Info */}
          {documentData.employee && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {documentData.employee.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {documentData.employee.employeeId} • {documentData.employee.department}
              </p>
            </div>
          )}

          {/* Documents List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Document Collection</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {documentData.documents && documentData.documents.length > 0 ? (
                documentData.documents.map((doc) => (
                  <div key={doc.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {getDocumentTypeLabel(doc.type)}
                          </h4>
                          {doc.name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{doc.name}</p>
                          )}
                          {doc.uploadedAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(doc.status)}
                        {doc.expiresAt && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Expires: {new Date(doc.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No documents found</p>
                </div>
              )}
            </div>
          </div>

          {/* Missing Documents */}
          {documentData.summary?.missingTypes && documentData.summary.missingTypes.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                Missing Documents
              </h4>
              <div className="flex flex-wrap gap-2">
                {documentData.summary.missingTypes.map((type, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded text-xs"
                  >
                    {getDocumentTypeLabel(type)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isLockedToEmployee
              ? "Document collection details are not available yet."
              : "Select an employee to view their document collection"}
          </p>
        </div>
      )}
    </div>
  );
}
