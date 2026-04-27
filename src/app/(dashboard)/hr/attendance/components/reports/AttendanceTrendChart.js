// src/app/(dashboard)/hr/attendance/reports/components/charts/AttendanceTrendChart.js
"use client";

import { CHART_TYPES } from "@/types/attendanceReports";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function AttendanceTrendChart({
  data,
  chartType,
  dateRange,
  customDateRange,
}) {
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 640);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        No data available for the selected period
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case CHART_TYPES.BAR:
        return (
          <div className="h-64 sm:h-80 lg:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 60 : 40}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                <Bar dataKey="present" fill="#0088FE" name="Present" />
                <Bar dataKey="late" fill="#FFBB28" name="Late" />
                <Bar dataKey="absent" fill="#FF8042" name="Absent" />
                <Bar dataKey="overtime" fill="#00C49F" name="Overtime" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case CHART_TYPES.LINE:
        return (
          <div className="h-64 sm:h-80 lg:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? "end" : "middle"}
                  height={isMobile ? 60 : 40}
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                <Line type="monotone" dataKey="present" stroke="#0088FE" />
                <Line type="monotone" dataKey="late" stroke="#FFBB28" />
                <Line type="monotone" dataKey="absent" stroke="#FF8042" />
                <Line type="monotone" dataKey="overtime" stroke="#00C49F" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case CHART_TYPES.PIE:
        const aggregatedData = [
          { name: "Present", value: data.reduce((s, i) => s + i.present, 0) },
          { name: "Late", value: data.reduce((s, i) => s + i.late, 0) },
          { name: "Absent", value: data.reduce((s, i) => s + i.absent, 0) },
          { name: "Overtime", value: data.reduce((s, i) => s + i.overtime, 0) },
        ];

        return (
          <div className="h-64 sm:h-80 lg:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aggregatedData}
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 80 : 120}
                  labelLine={false}
                  label={
                    isMobile
                      ? false
                      : ({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  dataKey="value"
                >
                  {aggregatedData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case CHART_TYPES.TABLE:
        return (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-[600px] w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {["Date", "Present", "Late", "Absent", "Overtime"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm">{item.date}</td>
                    <td className="px-4 py-3 text-sm">{item.present}</td>
                    <td className="px-4 py-3 text-sm">{item.late}</td>
                    <td className="px-4 py-3 text-sm">{item.absent}</td>
                    <td className="px-4 py-3 text-sm">{item.overtime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        Showing data for{" "}
        {dateRange === "custom"
          ? `${customDateRange.startDate.toLocaleDateString()} to ${customDateRange.endDate.toLocaleDateString()}`
          : dateRange.replace("_", " ")}
      </div>
      {renderChart()}
    </div>
  );
}
