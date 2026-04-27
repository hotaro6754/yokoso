"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  AlertCircle,
  Calendar,
  Calculator,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Loader2,
  UserX,
  X,
} from "lucide-react";
import SettlementPdfDownloadButton from "./SettlementPdfDownloadButton";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function PendingSettlementsTab({
  settlements,
  loading,
  getStatusBadge,
  formatCurrency,
  onProcess,
}) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [processingAction, setProcessingAction] = useState(null);

  const handleViewDetails = (settlement) => {
    setSelectedSettlement(settlement);
    setShowDetailsModal(true);
  };

  const handleProcess = async (settlement, action) => {
    setProcessingAction(action);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (action === "approve") {
        toast.success(`Settlement approved for ${settlement.employee.name}`);
      } else if (action === "reject") {
        toast.error(`Settlement rejected for ${settlement.employee.name}`);
      } else if (action === "hold") {
        toast.info(`Settlement put on hold for ${settlement.employee.name}`);
      }

      setShowDetailsModal(false);
      setSelectedSettlement(null);
    } catch (error) {
      toast.error("Failed to process settlement");
    } finally {
      setProcessingAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400" />
      </div>
    );
  }

  const statusCounts = {
    PENDING: settlements.filter((s) => s.status === "PENDING").length,
    IN_PROGRESS: settlements.filter((s) => s.status === "IN_PROGRESS").length,
    ON_HOLD: settlements.filter((s) => s.status === "ON_HOLD").length,
  };

  const chartOptions = {
    chart: { type: "donut", fontFamily: "inherit", background: "transparent" },
    labels: ["Pending", "In Progress", "On Hold"],
    colors: ["#f59e0b", "#070C8A", "#ef4444"],
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              fontFamily: "inherit",
              fontWeight: 600,
              color: "var(--foreground)",
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              },
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
    legend: { position: "bottom", markers: { radius: 12 } },
    tooltip: {
      theme: "light",
      style: {
        fontSize: "12px",
        fontFamily: "inherit",
        color: "var(--foreground)",
      },
      y: {
        formatter: function (val) {
          return val + " settlements";
        },
      },
    },
  };

  const chartSeries = [
    statusCounts.PENDING,
    statusCounts.IN_PROGRESS,
    statusCounts.ON_HOLD,
  ];

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4">
            Status Distribution
          </h4>
          <div className="flex-1 flex items-center justify-center min-h-[220px]">
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="donut"
              height={220}
              width={"100%"}
            />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <div className="text-center">
              <p className="text-xs text-gray-500">Total Settlements</p>
              <p className="text-xl font-medium">{settlements.length}</p>
            </div>
          </div>
        </div>

        {/* Total Payable */}
        <div className="bg-primary-50 dark:bg-primary-900/20 p-8 rounded-3xl border border-primary-100 dark:border-primary-800 shadow-sm flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-800/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

          <div className="relative z-10 flex flex-col h-full justify-center">
            <div className="p-3 bg-primary-100 dark:bg-primary-800 text-primary-600 rounded-2xl w-fit mb-6">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary-600/80 dark:text-primary-300 uppercase tracking-wider">
                Total Estimated Payable
              </p>
              <h3 className="text-4xl font-extrabold text-primary-700 dark:text-primary-100 mt-2">
                {formatCurrency(
                  settlements.reduce((sum, s) => sum + s.totalSettlement, 0)
                )}
              </h3>
              <p className="text-sm text-primary-600/60 dark:text-primary-400 mt-2 font-medium">
                Across {settlements.length} active settlement requests
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-bold text-foreground">Pending Queue</h3>
            <p className="text-sm text-muted-foreground">
              Processing {settlements.length} active settlements
            </p>
          </div>
        </div>

        {settlements.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {settlements.map((settlement, index) => (
              <motion.div
                key={settlement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className="glass-card hover:bg-card/80 rounded-xl p-5 border border-border/20 transition-all group premium-shadow-hover"
              >
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="relative">
                      {settlement.employee?.profileImage ? (
                        <img
                          src={settlement.employee.profileImage}
                          alt={settlement.employee?.name}
                          className="w-16 h-16 rounded-2xl object-cover shadow-md"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextElementSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-16 h-16 rounded-2xl shadow-md flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-brand-500 to-brand-600 ${settlement.employee?.profileImage ? "hidden" : ""
                          }`}
                        style={{
                          display: settlement.employee?.profileImage
                            ? "none"
                            : "flex",
                        }}
                      >
                        {settlement.employee?.name?.charAt(0)?.toUpperCase() ||
                          "E"}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-card rounded-full p-1 shadow-sm border border-border">
                        <UserX className="w-3 h-3 text-brand-500" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-bold text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {settlement.employee?.name}
                        </h4>
                        {getStatusBadge(settlement.status)}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium mb-3">
                        {settlement.employee?.employeeId} •{" "}
                        {settlement.employee?.department}
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 mt-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                              Resignation
                            </p>
                            <p className="text-xs font-bold text-foreground">
                              {new Date(
                                settlement.resignationDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                              Last Day
                            </p>
                            <p className="text-xs font-bold text-foreground">
                              {new Date(
                                settlement.lastWorkingDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800/30 ml-auto sm:ml-0">
                          <DollarSign className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-brand-600/80 dark:text-brand-400/80 font-semibold">
                              Est. Amount
                            </p>
                            <p className="text-sm font-extrabold text-brand-700 dark:text-brand-400">
                              {formatCurrency(settlement.totalSettlement)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <button
                      onClick={() => onProcess(settlement)}
                      className="px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl hover:shadow-lg hover:shadow-brand-500/20 transition-all text-sm font-bold flex items-center justify-center gap-2"
                    >
                      <Calculator className="w-4 h-4" />
                      Process
                    </button>
                    <button
                      onClick={() => handleViewDetails(settlement)}
                      className="px-6 py-2.5 bg-white dark:bg-white/5 text-foreground border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
            <div className="mb-4">
              <Clock className="w-16 h-16 text-gray-900 dark:text-gray-100 stroke-[1.5]" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              No Pending Settlements
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              All settlement requests are up to date.
            </p>
          </div>
        )}
      </div>
      <AnimatePresence>
        {showDetailsModal && selectedSettlement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Settlement Details - {selectedSettlement.employee.name}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Employee Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/20 rounded-full flex items-center justify-center">
                        <span className="text-brand-600 dark:text-brand-400 font-semibold text-sm">
                          {selectedSettlement.employee.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {selectedSettlement.employee.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedSettlement.employee.employeeId} •{" "}
                          {selectedSettlement.employee.department}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Settlement Timeline
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                          Resignation Date
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          {new Date(
                            selectedSettlement.resignationDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                          Last Working Day
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {new Date(
                            selectedSettlement.lastWorkingDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Settlement Breakdown
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-medium text-green-700 dark:text-green-400 mb-3">
                      Earnings
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-green-50 dark:bg-green-900/10 rounded">
                        <span className="text-sm">Gross Salary</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            selectedSettlement.totalSettlement * 1.2
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-green-50 dark:bg-green-900/10 rounded">
                        <span className="text-sm">Leave Encashment</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            selectedSettlement.totalSettlement * 0.1
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-green-50 dark:bg-green-900/10 rounded">
                        <span className="text-sm">Gratuity</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            selectedSettlement.totalSettlement * 0.15
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-green-50 dark:bg-green-900/10 rounded">
                        <span className="text-sm">Bonus</span>
                        <span className="font-semibold">
                          {formatCurrency(
                            selectedSettlement.totalSettlement * 0.05
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between p-3 bg-green-100 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/30">
                      <span className="font-bold text-green-800 dark:text-green-200">
                        Total Earnings
                      </span>
                      <span className="font-bold text-lg">
                        {formatCurrency(
                          selectedSettlement.totalSettlement * 1.5
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium text-red-700 dark:text-red-400 mb-3">
                      Deductions
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between p-2 bg-red-50 dark:bg-red-900/10 rounded">
                        <span className="text-sm">Provident Fund</span>
                        <span className="font-semibold">
                          -{formatCurrency(selectedSettlement.totalSettlement * 0.12)}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-red-50 dark:bg-red-900/10 rounded">
                        <span className="text-sm">Professional Tax</span>
                        <span className="font-semibold">
                          -{formatCurrency(selectedSettlement.totalSettlement * 0.08)}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-red-50 dark:bg-red-900/10 rounded">
                        <span className="text-sm">Income Tax</span>
                        <span className="font-semibold">
                          -{formatCurrency(selectedSettlement.totalSettlement * 0.1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between p-3 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/30">
                      <span className="font-bold text-red-800 dark:text-red-200">
                        Total Deductions
                      </span>
                      <span className="font-bold text-lg">
                        -{formatCurrency(selectedSettlement.totalSettlement * 0.3)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-6 bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/20 dark:to-brand-900/30 rounded-xl border border-brand-200 dark:border-brand-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
                        Net Settlement Amount
                      </p>
                      <p className="text-3xl font-bold text-brand-800 dark:text-brand-200">
                        {formatCurrency(selectedSettlement.totalSettlement)}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(selectedSettlement.status)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <SettlementPdfDownloadButton
                  settlement={selectedSettlement}
                  formatCurrency={formatCurrency}
                  label="Download PDF"
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                />
                <button
                  onClick={() => handleProcess(selectedSettlement, "approve")}
                  disabled={processingAction === "approve"}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingAction === "approve" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {processingAction === "approve" ? "Approving..." : "Approve"}
                </button>
                <button
                  onClick={() => handleProcess(selectedSettlement, "hold")}
                  disabled={processingAction === "hold"}
                  className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingAction === "hold" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {processingAction === "hold" ? "Putting on Hold..." : "Put on Hold"}
                </button>
                <button
                  onClick={() => handleProcess(selectedSettlement, "reject")}
                  disabled={processingAction === "reject"}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingAction === "reject" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserX className="w-4 h-4" />
                  )}
                  {processingAction === "reject" ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
