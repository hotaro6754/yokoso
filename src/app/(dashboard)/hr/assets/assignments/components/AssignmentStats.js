"use client";
import { PackageCheck, UserCheck, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { assetService } from "../../../../../../services/hr-services/asset.service";

export default function AssignmentStats() {
  const [stats, setStats] = useState({
    totalAssignments: 0,
    activeAssignments: 0,
    returnedAssignments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await assetService.getAssignmentStats();
        
        // Extract data from response
        const data = response.data || response;
        
        setStats({
          totalAssignments: data.totalAssignments || 0,
          activeAssignments: data.activeAssignments || 0,
          returnedAssignments: data.returnedAssignments || 0
        });
      } catch (error) {
        console.error("Error fetching assignment stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Assignments",
      value: stats.totalAssignments,
      icon: PackageCheck,
      color: "blue",
    },
    {
      label: "Active Assignments",
      value: stats.activeAssignments,
      icon: UserCheck,
      color: "green",
    },
    {
      label: "Returned Assets",
      value: stats.returnedAssignments,
      icon: RotateCcw,
      color: "purple",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {card.value}
              </p>
            </div>
            <div className={`p-3 rounded-full bg-${card.color}-50 dark:bg-${card.color}-900/20`}>
              <card.icon className={`w-6 h-6 text-${card.color}-600 dark:text-${card.color}-400`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}