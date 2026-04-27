"use client";

import React, { useState, useEffect } from "react";
import { recruiterService } from "@/services/recruiter-services/recruiter.service";
import { toast } from "react-hot-toast";
import { Briefcase, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function OpenPositionsSummary() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalOpenRequisitions: 0,
    positionsByDepartment: [],
    overduePositions: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await recruiterService.getOpenPositionsSummary();
      setData(response.data || response);
    } catch (error) {
      console.error("Error fetching open positions:", error);
      toast.error("Failed to load open positions summary");
      setData({
        totalOpenRequisitions: 0,
        positionsByDepartment: [],
        overduePositions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
            <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Open Positions Summary
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Total: {data.totalOpenRequisitions} requisitions
            </p>
          </div>
        </div>
        <Link
          href="/recruiter/requisitions"
          className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 font-medium"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Positions by Department */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Positions by Department
            </h4>
            <div className="space-y-3">
              {data.positionsByDepartment?.map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {dept.department}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${(dept.count / data.totalOpenRequisitions) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
                      {dept.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overdue Positions */}
          {data.overduePositions > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {data.overduePositions} position(s) overdue
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
