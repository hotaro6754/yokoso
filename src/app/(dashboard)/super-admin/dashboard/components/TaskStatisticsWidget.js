"use client";
import React, { useEffect, useRef, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TaskStatisticsWidget() {
  const [period, setPeriod] = useState("This Week");
  const dropdownRef = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const chartData = {
    labels: ["Ongoing", "On Hold", "Overdue", "Completed"],
    datasets: [
      {
        data: [24, 10, 16, 40],
        backgroundColor: ["#0ea5e9", "#fbbf24", "#ef4444", "#10b981"],
        borderWidth: 0,
        hoverOffset: 6,
        cutout: "70%",
      },
    ],
  };

  const options = { plugins: { legend: { display: false } }, maintainAspectRatio: false };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-full h-full">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-2 flex-wrap">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
          Task Statistics
        </h5>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((p) => !p)}
            className="text-xs font-semibold px-2 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            {period}
          </button>
          {open && (
            <div className="absolute right-0 mt-1 w-32 z-20 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg overflow-hidden">
              {["Today", "This Week", "This Month"].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    setOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-xs ${
                    period === p ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="relative h-56">
          <Doughnut data={chartData} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xs text-gray-500 dark:text-gray-300">Total Tasks</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">124/165</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300">
          {[
            { label: "Ongoing", value: "24%", color: "bg-sky-500" },
            { label: "On Hold", value: "10%", color: "bg-amber-400" },
            { label: "Overdue", value: "16%", color: "bg-red-500" },
            { label: "Completed", value: "40%", color: "bg-emerald-500" },
          ].map((x) => (
            <div key={x.label} className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2">
              <span className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${x.color}`} />
                {x.label}
              </span>
              <span className="font-semibold">{x.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-gray-900 text-white p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] opacity-80">Spent on overall tasks this week</div>
            <div className="text-sm font-bold">389/689 hrs</div>
          </div>
          <button className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700">
            View All
          </button>
        </div>
      </div>
    </div>
  );
}

