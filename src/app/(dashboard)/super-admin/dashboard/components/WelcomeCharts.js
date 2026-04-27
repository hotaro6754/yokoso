"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function WelcomeCharts() {
  const series = useMemo(
    () => [
      {
        name: "Users",
        data: [15000, 18000, 16000, 19000, 22000, 24000],
      },
    ],
    []
  );

  const options = useMemo(
    () => ({
      chart: {
        toolbar: { show: false },
        background: "transparent",
        foreColor: "#94a3b8",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 700,
        },
      },
      stroke: {
        curve: "smooth",
        width: 3,
      },
      markers: {
        size: 0,
        hover: { size: 6 },
      },
      dataLabels: {
        enabled: false, // ✅ cleaner modern look
      },
      xaxis: {
        categories: ["W1", "W2", "W3", "W4", "W5", "W6"],
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          formatter: (val) => Math.round(val).toLocaleString(),
        },
      },
      grid: {
        borderColor: "rgba(148,163,184,0.15)",
        strokeDashArray: 5,
      },
      colors: ["#f59e0b"],
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 0.4,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      title: {
        text: "Users Last Month",
        style: {
          fontSize: "14px",
          fontWeight: 600,
          color: "#e5e7eb",
        },
      },
      tooltip: {
        theme: "dark",
        y: {
          formatter: (val) => val.toLocaleString(),
        },
      },
    }),
    []
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Line Chart */}
      <div className="rounded-2xl p-4 bg-white dark:bg-[#0f172a] shadow-sm">
        <ReactApexChart
          type="area"
          height={230}
          series={series}
          options={options}
        />
      </div>

      {/* Bar Chart */}
      <div className="rounded-2xl p-4 bg-white dark:bg-[#0f172a] shadow-sm">
        <ReactApexChart
          type="bar"
          height={240}
          series={[
            {
              name: "Revenue",
              data: [120, 98, 150, 130, 170],
            },
          ]}
          options={{
            chart: {
              toolbar: { show: false },
              background: "transparent",
              foreColor: "#94a3b8",
            },
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: "45%",
                endingShape: "rounded",
              },
            },
            dataLabels: { enabled: false },
            xaxis: {
              categories: ["Acme", "Globex", "Initech", "Umbrella", "Hooli"],
              axisBorder: { show: false },
              axisTicks: { show: false },
            },
            yaxis: {
              labels: {
                formatter: (val) => `$${val}k`,
              },
            },
            grid: {
              borderColor: "rgba(148,163,184,0.15)",
              strokeDashArray: 5,
            },
            fill: {
              type: "gradient",
              gradient: {
                shade: "light",
                type: "vertical",
                shadeIntensity: 0.4,
                gradientToColors: ["#16a99a"],
                opacityFrom: 0.95,
                opacityTo: 0.7,
                stops: [0, 100],
              },
            },
            colors: ["#22c55e"],
            title: {
              text: "Top 5 Companies Revenue",
              style: {
                fontSize: "14px",
                fontWeight: 600,
                color: "#e5e7eb",
              },
            },
            tooltip: {
              theme: "dark",
              y: { formatter: (val) => `$${val}k` },
            },
          }}
        />
      </div>
    </div>
  );
}
