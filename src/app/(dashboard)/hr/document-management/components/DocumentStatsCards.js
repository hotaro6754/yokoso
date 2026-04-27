"use client";
import { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Upload,
  FileX,
} from "lucide-react";
import { documentsService } from "@/services/hr-services/documents.service";

export default function DocumentStatsCards() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await documentsService.getDocumentStats();
        const statsData = response.success ? response.data : response;
        setStats(statsData);
      } catch (error) {
        console.error("Document stats error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-gray-200 dark:bg-gray-700 h-32 rounded-xl"
          ></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cardData = [
    {
      title: "Total Documents",
      value: stats.totalDocuments || 0,
      icon: FileText,
      iconBg: "bg-gradient-to-br from-brand-500 to-brand-600",
      textColor: "text-brand-600 dark:text-brand-400",
    },
    {
      title: "Verified Documents",
      value: stats.verifiedDocuments || stats.byStatus?.verified || 0,
      icon: CheckCircle,
      iconBg: "bg-gradient-to-br from-green-500 to-green-600",
      textColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Pending Verification",
      value: stats.pendingDocuments || stats.byStatus?.pending || 0,
      icon: Upload,
      iconBg: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      textColor: "text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "Expiring Soon",
      value: stats.expiringSoon || stats.expiringDocuments || 0,
      icon: Clock,
      iconBg: "bg-gradient-to-br from-orange-500 to-orange-600",
      textColor: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Rejected Documents",
      value: stats.rejectedDocuments || stats.byStatus?.rejected || 0,
      icon: FileX,
      iconBg: "bg-gradient-to-br from-red-500 to-red-600",
      textColor: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6">
      {cardData.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="group relative bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${index === 0 ? 'from-brand-100/50 to-transparent dark:from-brand-900/20' : 'from-gray-100/50 to-transparent dark:from-gray-900/20'} rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity duration-300`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.iconBg} p-2.5 rounded-sm shadow-sm`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                {card.title}
              </p>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {typeof card.value === "number"
                  ? card.value.toLocaleString()
                  : card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
