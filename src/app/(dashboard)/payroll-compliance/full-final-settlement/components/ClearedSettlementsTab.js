"use client";

import React, { useState } from "react";
import { CheckCircle2, FileText, Loader2, Search } from "lucide-react";
import SettlementPDFModal from "./SettlementPDFModal";
import SettlementPdfDownloadButton from "./SettlementPdfDownloadButton";

export default function ClearedSettlementsTab({
  settlements,
  loading,
  getStatusBadge,
  formatCurrency,
}) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);

  const handleViewDetails = (settlement) => {
    setSelectedSettlement(settlement);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-foreground">History</h3>
            <p className="text-sm text-muted-foreground">
              Archive of completed settlements
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search history..."
              className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary-500/20 outline-none"
            />
          </div>
        </div>

        {settlements.length > 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm bg-white dark:bg-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Exit Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {settlements.map((settlement) => (
                    <tr
                      key={settlement.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {settlement.employee?.profileImage ? (
                            <img
                              src={settlement.employee.profileImage}
                              alt={settlement.employee?.name}
                              className="w-10 h-10 rounded-full object-cover shadow-sm"
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextElementSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-10 h-10 rounded-full shadow-sm flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-brand-500 to-brand-600 ${settlement.employee?.profileImage ? "hidden" : ""
                              }`}
                            style={{
                              display: settlement.employee?.profileImage
                                ? "none"
                                : "flex",
                            }}
                          >
                            {settlement.employee?.name
                              ?.charAt(0)
                              ?.toUpperCase() || "E"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {settlement.employee?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {settlement.employee?.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {new Date(
                          settlement.lastWorkingDate
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-brand-600 dark:text-brand-400 font-mono">
                          {formatCurrency(settlement.totalSettlement)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(settlement.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <SettlementPdfDownloadButton
                            settlement={settlement}
                            formatCurrency={formatCurrency}
                            label="Download PDF"
                            className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20"
                          />
                          <button
                            onClick={() => handleViewDetails(settlement)}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-muted"
                          >
                            <FileText className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white/50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <CheckCircle2 className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              No cleared settlements record found.
            </p>
          </div>
        )}
      </div>

      {showDetailsModal && selectedSettlement && (
        <SettlementPDFModal
          settlement={selectedSettlement}
          formatCurrency={formatCurrency}
          getStatusBadge={getStatusBadge}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  );
}
