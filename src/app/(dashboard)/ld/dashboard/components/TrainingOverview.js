"use client";

import React, { useState, useEffect } from "react";
import { ldService } from "@/services/ld-services/ld.service";
import { BookOpen, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function TrainingOverview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalActiveCourses: 15,
    mandatoryTrainings: 8,
    trainingsInProgress: 42,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await ldService.getTrainingOverview();
      setData(response.data || response);
    } catch (error) {
      console.error("Error fetching training overview:", error);
      // Use mock data on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-500/20 rounded-lg">
            <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Training Overview
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Active courses and training status
            </p>
          </div>
        </div>
        <Link
          href="/ld/courses"
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Active Courses</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {data.totalActiveCourses || 0}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Mandatory Trainings</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {data.mandatoryTrainings || 0}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Trainings in Progress</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {data.trainingsInProgress || 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
