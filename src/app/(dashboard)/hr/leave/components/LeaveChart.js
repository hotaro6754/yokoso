// 'use client';

// import React from "react";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// const LeaveChart = ({ data }) => {
//   return (
//     <div className="h-80">
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart
//           data={data}
//           margin={{
//             top: 5,
//             right: 30,
//             left: 20,
//             bottom: 5,
//           }}
//         >
//           <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
//           <XAxis dataKey="name" className="text-sm" />
//           <YAxis className="text-sm" />
//           <Tooltip 
//             contentStyle={{ 
//               backgroundColor: 'rgba(255, 255, 255, 0.9)',
//               borderColor: '#e5e7eb',
//               borderRadius: '0.5rem'
//             }}
//           />
//           <Bar dataKey="approved" fill="#10B981" name="Approved" radius={[4, 4, 0, 0]} />
//           <Bar dataKey="rejected" fill="#EF4444" name="Rejected" radius={[4, 4, 0, 0]} />
//           <Bar dataKey="pending" fill="#F59E0B" name="Pending" radius={[4, 4, 0, 0]} />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default LeaveChart;
'use client';

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const LeaveChart = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#6B7280',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1F2937',
        bodyColor: '#1F2937',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        // This enables the tooltip to show all datasets for the hovered category
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function(tooltipItems) {
            // Show the day name (e.g., "Mon") as title
            return tooltipItems[0].label;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12
          },
          precision: 0
        }
      }
    },
    // Add interaction settings to highlight the entire column
    interaction: {
      mode: 'index',
      intersect: false,
    },
    // Add onHover event to highlight all bars in the same category
    onHover: (event, chartElement) => {
      // Custom hover styling can be added here if needed
    },
  };

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Approved',
        data: data.map(item => item.approved),
        backgroundColor: '#10B981',
        borderRadius: 6,
        borderSkipped: false,
        // Add hover effect to make all bars in category stand out
        hoverBackgroundColor: '#059669',
        categoryPercentage: 0.8,
        barPercentage: 0.7,
      },
      {
        label: 'Rejected',
        data: data.map(item => item.rejected),
        backgroundColor: '#EF4444',
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: '#DC2626',
        categoryPercentage: 0.8,
        barPercentage: 0.7,
      },
      {
        label: 'Pending',
        data: data.map(item => item.pending),
        backgroundColor: '#F59E0B',
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: '#D97706',
        categoryPercentage: 0.8,
        barPercentage: 0.7,
      },
    ],
  };

  return (
    <div className="h-80">
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default LeaveChart;