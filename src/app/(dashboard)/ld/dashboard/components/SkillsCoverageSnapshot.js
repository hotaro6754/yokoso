"use client";

import React, { useState, useEffect } from "react";
import { ldService } from "@/services/ld-services/ld.service";
import { Brain, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function SkillsCoverageSnapshot() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    keySkillsTracked: 45,
    skillGaps: 12,
    skillsByCategory: [
      { category: "Technical Skills", count: 20, gaps: 5 },
      { category: "Soft Skills", count: 15, gaps: 4 },
      { category: "Leadership Skills", count: 7, gaps: 2 },
      { category: "Compliance Skills", count: 3, gaps: 1 },
    ],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await ldService.getSkillsCoverageSnapshot();
      setData(response.data || response);
    } catch (error) {
      console.error("Error fetching skills coverage:", error);
      // Use mock data on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
            <Brain className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Skills Coverage Snapshot
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Key skills and identified gaps
            </p>
          </div>
        </div>
        <Link
          href="/ld/skills"
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
            <span className="text-sm text-gray-600 dark:text-gray-400">Key Skills Tracked</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {data.keySkillsTracked || 0}
            </span>
          </div>

          {/* Skills by Category */}
          {data.skillsByCategory && data.skillsByCategory.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Skills by Category
              </h4>
              <div className="space-y-3">
                {data.skillsByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {category.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full"
                          style={{
                            width: `${(category.count / data.keySkillsTracked) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white w-8 text-right">
                        {category.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Gaps Alert */}
          {data.skillGaps > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  {data.skillGaps} skill gap(s) identified
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
