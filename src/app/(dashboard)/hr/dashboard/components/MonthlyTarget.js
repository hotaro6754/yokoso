"use client";
import dynamic from "next/dynamic";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { useState } from "react";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { MoreHorizontal } from "lucide-react";

// Dynamically import ApexChart
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlyTarget() {
  const [isOpen, setIsOpen] = useState(false);

  const series = [75.55];

  const options = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "32px",
            fontWeight: "600",
            offsetY: -30,
            color: "#1D2939",
            formatter: (val) => `${val}%`,
          },
        },
      },
    },
    fill: { type: "solid", colors: ["#465FFF"] },
    stroke: { lineCap: "round" },
    labels: ["Progress"],
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 
                    bg-gray-100 dark:bg-white/[0.03] w-full h-full">
      {/* Top Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm 
                      px-4 pt-4 pb-8 sm:px-6 sm:pt-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white/90">
              Monthly Target
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Target you've set for each month
            </p>
          </div>

          {/* Dropdown */}
          <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)}>
              <MoreHorizontal
                size={20}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              />
            </button>

            <Dropdown
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              className="w-40 p-2"
            >
              <DropdownItem
                onItemClick={() => setIsOpen(false)}
                className="w-full text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                View More
              </DropdownItem>
              <DropdownItem
                onItemClick={() => setIsOpen(false)}
                className="w-full text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                Delete
              </DropdownItem>
            </Dropdown>
          </div>
        </div>

        {/* Chart */}
        <div className="relative flex justify-center mt-4">
          <div className="w-full max-w-[260px] sm:max-w-[300px]">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={260}
            />
          </div>

          {/* Badge */}
          <span
            className="absolute bottom-2 left-1/2 -translate-x-1/2 
                       rounded-full bg-success-50 px-3 py-1 
                       text-xs font-medium text-success-600 
                       dark:bg-success-500/15 dark:text-success-500"
          >
            +10%
          </span>
        </div>

        {/* Description */}
        <p className="mx-auto mt-6 max-w-[380px] text-center text-xs sm:text-sm text-gray-500">
          You earn $3287 today, it's higher than last month. Keep up your good
          work!
        </p>
      </div>

      {/* Bottom Stats */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 
                   px-4 py-4 sm:px-6 sm:py-5"
      >
        {[
          { label: "Target", value: "$20K", up: false },
          { label: "Revenue", value: "$20K", up: true },
          { label: "Today", value: "$20K", up: true },
        ].map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center"
          >
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {item.label}
            </p>
            <p className="flex items-center gap-1 text-base sm:text-lg font-semibold text-gray-800 dark:text-white/90">
              {item.value}
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d={
                    item.up
                      ? "M7.6 2.33c.13-.15.34-.25.56-.25.22 0 .43.1.56.25l4 4a.75.75 0 11-1.06 1.06L8.91 4.64V13.5a.75.75 0 01-1.5 0V4.64L4.36 7.39a.75.75 0 11-1.06-1.06l4-4z"
                      : "M7.27 13.66c.13.16.33.25.56.25.22 0 .43-.09.56-.25l4-4a.75.75 0 10-1.06-1.06L8.58 11.36V2.5a.75.75 0 00-1.5 0v8.86L4.36 8.6a.75.75 0 10-1.06 1.06l3.97 4z"
                  }
                  fill={item.up ? "#039855" : "#D92D20"}
                />
              </svg>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
