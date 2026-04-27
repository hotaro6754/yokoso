"use client";

import { useState, useEffect } from "react";
import { Package, Loader2, CheckCircle, Clock } from "lucide-react";
import { onboardingExitService } from "@/services/hr-services/onboarding-exit.service";
import { toast } from "react-hot-toast";

export default function AssetClearanceTab({ resignationId }) {
  const [assetData, setAssetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedResignationId, setSelectedResignationId] = useState("");
  const isLockedToResignation = Boolean(resignationId);

  useEffect(() => {
    if (isLockedToResignation && resignationId) {
      setSelectedResignationId(resignationId);
      return;
    }
    if (selectedResignationId) {
      fetchAssetClearance();
    }
  }, [selectedResignationId, resignationId, isLockedToResignation]);

  const fetchAssetClearance = async () => {
    if (!selectedResignationId) return;
    try {
      setLoading(true);
      const response = await onboardingExitService.getAssetClearance(selectedResignationId);
      const data = response.success ? response.data : response;
      setAssetData(data);
    } catch (error) {
      console.error("Error fetching asset clearance:", error);
      toast.error(error.message || "Failed to fetch asset and clearance data");
      setAssetData(null);
    } finally {
      setLoading(false);
    }
  };

  const getReturnStatusBadge = (status) => {
    const config = {
      RETURNED: { icon: CheckCircle, label: "Returned", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      PENDING: { icon: Clock, label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    };
    const statusConfig = config[status] || config.PENDING;
    const Icon = statusConfig.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
        <Icon className="w-3 h-3" />
        {statusConfig.label}
      </span>
    );
  };

  const getClearanceStatusBadge = (status) => {
    const config = {
      COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    };
    const statusConfig = config[status] || config.PENDING;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.className}`}>
        {statusConfig.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {!isLockedToResignation && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
          Select a separation record from the dashboard to view asset and clearance tracking.
        </div>
      )}

      {/* Asset & Clearance Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : assetData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          {assetData.summary && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Assets</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {assetData.summary.totalAssets || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Returned</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {assetData.summary.returnedAssets || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                  {assetData.summary.pendingAssets || 0}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Clearance Items</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {assetData.summary.clearanceItems || 0}
                </p>
              </div>
            </div>
          )}

          {/* Assets List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned Assets</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {assetData.assets && assetData.assets.length > 0 ? (
                assetData.assets.map((asset) => (
                  <div key={asset.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-gray-400" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{asset.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {asset.category} • Serial: {asset.serialNumber}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Assigned: {new Date(asset.assignedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getReturnStatusBadge(asset.returnStatus)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No assets found</p>
                </div>
              )}
            </div>
          </div>

          {/* Clearance Checklist */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Clearance Checklist</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {assetData.clearanceChecklist && assetData.clearanceChecklist.length > 0 ? (
                assetData.clearanceChecklist.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</h4>
                        {item.completedAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Completed: {new Date(item.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {getClearanceStatusBadge(item.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No clearance items found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {isLockedToResignation
              ? "Asset and clearance tracking is not available yet."
              : "Enter a resignation ID to view asset and clearance tracking"}
          </p>
        </div>
      )}
    </div>
  );
}
