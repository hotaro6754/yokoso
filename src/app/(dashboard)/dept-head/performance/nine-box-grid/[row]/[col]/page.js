"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { toast } from "react-hot-toast";
import { 
  Users, 
  ArrowLeft, 
  Search, 
  Download,
  User
} from "lucide-react";
import { performanceManagementService } from "@/services/hr-services/performance-management.service";

export default function DeptHeadNineBoxGridPositionPage() {
  const params = useParams();
  const router = useRouter();
  const { row, col } = params;
  
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, [row, col]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await performanceManagementService.getNineBoxGridData({
        boxRow: row,
        boxCol: col
      });
      
      setEmployees(response.data || []);
    } catch (error) {
      console.error("Error fetching employees for box:", error);
      toast.error(error.message || "Failed to load employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const getBoxLabelForPosition = (row, col) => {
    const labels = {
      '1,1': 'Stars',
      '1,2': 'High Performers', 
      '1,3': 'Solid Performers',
      '2,1': 'Future Stars',
      '2,2': 'Core',
      '2,3': 'Steady Performers',
      '3,1': 'High Potentials',
      '3,2': 'Potential Issues',
      '3,3': 'Problem Performers'
    };
    return labels[`${col},${row}`] || 'Unknown';
  };

  const getBoxColor = (performanceScore, potentialScore) => {
    // Exact mapping from HR page logic
    if (performanceScore >= 4.5 && potentialScore >= 4) return "bg-emerald-500";
    if (performanceScore >= 4.5 && potentialScore >= 3) return "bg-blue-500";
    if (performanceScore >= 4.5 && potentialScore >= 2) return "bg-gray-500";
    if (performanceScore >= 3.5 && potentialScore >= 4) return "bg-purple-500";
    if (performanceScore >= 3.5 && potentialScore >= 3) return "bg-yellow-500";
    if (performanceScore >= 3.5 && potentialScore >= 2) return "bg-orange-500";
    if (performanceScore >= 2.5 && potentialScore >= 4) return "bg-orange-500";
    if (performanceScore >= 2.5 && potentialScore >= 3) return "bg-red-500";
    if (performanceScore >= 2.5 && potentialScore >= 2) return "bg-red-500";
    return "bg-gray-400";
  };

  const getPerformanceColor = (score) => {
    if (score >= 4.5) return "text-emerald-600 bg-emerald-50";
    if (score >= 4.0) return "text-green-600 bg-green-50";
    if (score >= 3.5) return "text-blue-600 bg-blue-50";
    if (score >= 3.0) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getPotentialColor = (score) => {
    if (score >= 4) return "text-purple-600 bg-purple-50";
    if (score >= 3) return "text-blue-600 bg-blue-50";
    if (score >= 2) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getEmployeeDisplayData = (employee) => {
    const emp = employee.employee || employee;
    
    return {
      name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown Employee',
      designation: emp.designation || emp.designation?.name || emp.position || 'Employee',
      department: emp.department || emp.department?.name || 'N/A',
      performanceScore: employee.performanceScore || 3.0,
      potentialScore: employee.potentialScore || 3.0,
      potential: employee.potential || 'Medium',
      managerName: employee.managerName || emp.managerName || 'Not assigned',
      lastReviewDate: employee.lastReviewDate || emp.lastReviewDate || 'No reviews',
      recommendedActions: employee.recommendedActions || emp.recommendedActions || null
    };
  };

  const filteredEmployees = employees.filter(employee => {
    const displayData = getEmployeeDisplayData(employee);
    const searchLower = searchTerm.toLowerCase();
    
    return displayData.name.toLowerCase().includes(searchLower) ||
           displayData.designation.toLowerCase().includes(searchLower) ||
           displayData.department.toLowerCase().includes(searchLower);
  });

  const handleBackToGrid = () => {
    router.push('/dept-head/performance/nine-box-grid');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "Department Head", href: "/dept-head" },
          { label: "Performance", href: "/dept-head/performance" },
          { label: "9-Box Grid", href: "/dept-head/performance/nine-box-grid" },
          { label: `${getBoxLabelForPosition(row, col)} (Position ${col},${row})` }
        ]}
      />

      <div className="my-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToGrid}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Grid
            </button>
            <div className="rounded-lg bg-teal-50 p-3 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {getBoxLabelForPosition(row, col)}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Position ({col}, {row}) • {filteredEmployees.length} employees
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download size={16} />
            Export List
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees by name, designation, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        {filteredEmployees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredEmployees.map((employee) => {
              const displayData = getEmployeeDisplayData(employee);
              return (
                <div key={employee.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <User size={20} className="text-gray-500 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{displayData.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{displayData.designation}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mb-3">{displayData.department}</div>
                    </div>
                    <div className={`px-3 py-1 text-xs font-medium rounded-full ${getBoxColor(displayData.performanceScore, displayData.potentialScore)} text-white`}>
                      {getBoxLabelForPosition(row, col)}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Performance:</span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getPerformanceColor(displayData.performanceScore)}`}>
                        {displayData.performanceScore.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Potential:</span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getPotentialColor(displayData.potentialScore)}`}>
                        {displayData.potential}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Manager:</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300">{displayData.managerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Last Review:</span>
                      <span className="text-xs text-gray-700 dark:text-gray-300">{displayData.lastReviewDate}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Potential:</span>
                      <span className="text-xs text-gray-900 dark:text-white font-semibold">
                         {displayData.potential} (Read Only)
                      </span>
                    </div>
                    {displayData.recommendedActions && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Recommended Actions:</div>
                        <div className="text-xs text-gray-700 dark:text-gray-300">
                          {displayData.recommendedActions.join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Employees Found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No employees match your search criteria.' : 'There are no employees in this Nine-Box position from your department.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
