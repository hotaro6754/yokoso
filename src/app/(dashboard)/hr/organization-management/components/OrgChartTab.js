"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Building, Mail, CalendarDays, User, ArrowLeft, Edit, FileText, CreditCard, Clock, AlertTriangle, Calendar, Users } from "lucide-react";
import { getFileUrl } from "@/utils/fileUrl";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const Tree = dynamic(() => import("react-d3-tree"), { ssr: false });

const staticHierarchy = {
  name: "Organization Archon",
  attributes: { role: "Presidency & Vision", department: "Executive Office" },
  children: [
    {
      name: "Strategy Division",
      attributes: { role: "Regional Director", department: "Operations" },
      children: [
        {
          name: "Operational Nexus",
          attributes: { role: "Cluster Lead", department: "Logistics" },
          children: [
            { name: "Field Operative A", attributes: { role: "Specialist", department: "Operations" } },
            { name: "Field Operative B", attributes: { role: "Specialist", department: "Operations" } }
          ]
        }
      ]
    },
    {
      name: "Human Capital",
      attributes: { role: "Chief People Officer", department: "HR" },
      children: [
        { name: "Talent Acquisition", attributes: { role: "Lead Recruiter", department: "HR" } },
        { name: "Cultural Development", attributes: { role: "L&D Head", department: "HR" } }
      ]
    },
    {
      name: "Fiscal Control",
      attributes: { role: "CFO", department: "Finance" }
    }
  ]
};

export default function OrgChartTab({ allowFetch = true }) {
  const router = useRouter();
  const { user } = useAuth();
  const rawUserRole = user?.systemRole || user?.role || "";
  const userRole = String(rawUserRole).toUpperCase().replace(/[\s-]+/g, "_");
  const canFetchEmployeeDetails = !["DEPT_HEAD", "DEPARTMENT_HEAD"].includes(userRole);
  const [hierarchyData, setHierarchyData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedEmployee, setSelectedEmployee] = React.useState(null);
  const [translate, setTranslate] = React.useState({ x: 500, y: 80 });

  const containerRef = React.useCallback((containerElem) => {
    if (containerElem !== null) {
      const { width } = containerElem.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 80 });
    }
  }, []);

  React.useEffect(() => {
    const fetchTreeData = async () => {
      try {
        if (!allowFetch) {
          setHierarchyData(staticHierarchy);
          return;
        }

        const { employeeService } = await import('@/services/hr-services/employeeService');
        // Fetch pre-mapped hierarchy from backend
        const result = await employeeService.getHierarchy();
        const hierarchy = result?.data || result;

        if (!hierarchy || (Array.isArray(hierarchy) && hierarchy.length === 0) || !hierarchy.name) {
          setHierarchyData({ name: "No Employees Found", attributes: { role: "N/A" } });
          setLoading(false);
          return;
        }

        setHierarchyData(hierarchy);
        
      } catch (err) {
        console.error("Failed to load hierarchy:", err);
        setHierarchyData(staticHierarchy); // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchTreeData();
  }, [allowFetch]);

  return (
    <div className="space-y-8 h-[800px]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Relational Hierarchy</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Dynamic architectural view of your organization's reporting lines and chain of command.
          </p>
        </div>
      </div>

      <div className="relative bg-gray-50 dark:bg-gray-900/40 rounded-[2.5rem] border border-gray-100 dark:border-gray-700/50 h-full overflow-hidden shadow-inner" ref={containerRef}>
        <div className="absolute top-6 right-8 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 silver-shadow">
          Interactive Canvas • Scroll to Zoom • Drag to Pan
        </div>

        <div className="w-full h-full text-center" id="treeWrapper">
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500">Loading structure...</div>
          ) : hierarchyData ? (
            <Tree
              data={hierarchyData}
              orientation="vertical"
              pathFunc="step"
              translate={translate}
              collapsible={true}
              draggable={true}
              zoom={0.8}
              separation={{ siblings: 1.5, nonSiblings: 2 }}
              nodeSize={{ x: 260, y: 180 }}
              renderCustomNodeElement={(rd3tProps) => (
                <g>
                  <circle r="8" fill="#2563EB" className="animate-pulse" />
                  <foreignObject x="-110" y="20" width="220" height="100">
                    <div 
                      className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 text-center shadow-xl hover:shadow-2xl transition-all duration-300 silver-shadow scale-95 hover:scale-100 select-none cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const employeeId = rd3tProps.nodeDatum.attributes?.uid || rd3tProps.nodeDatum.id;
                        if (employeeId) {
                          setSelectedEmployee({
                            id: employeeId,
                            name: rd3tProps.nodeDatum.name,
                            role: rd3tProps.nodeDatum.attributes?.role,
                            department: rd3tProps.nodeDatum.attributes?.department,
                          });
                        }
                      }}
                    >
                      <p className="font-black text-xs text-primary-600 uppercase tracking-tighter mb-1 truncate">
                        {rd3tProps.nodeDatum.attributes?.role || 'Stakeholder'}
                      </p>
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {rd3tProps.nodeDatum.name}
                      </p>
                      {rd3tProps.nodeDatum.attributes?.department && (
                        <div className="mt-3">
                          <span className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-gray-100 dark:border-gray-700">
                            {rd3tProps.nodeDatum.attributes.department}
                          </span>
                        </div>
                      )}
                    </div>
                  </foreignObject>
                </g>
              )}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">No hierarchy data available.</div>
          )}
        </div>
      </div>

      {selectedEmployee && (
        <EmployeeDetailsPopup 
          employeeId={selectedEmployee.id} 
          nodeData={selectedEmployee}
          allowEmployeeFetch={canFetchEmployeeDetails}
          onClose={() => setSelectedEmployee(null)} 
        />
      )}

      <style jsx global>{`
        .silver-shadow {
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05);
        }
        .rd3t-link {
          stroke: #e2e8f0 !important;
          stroke-width: 2px !important;
          transition: all 0.3s ease;
        }
        .dark .rd3t-link {
          stroke: #334155 !important;
        }
      `}</style>
    </div>
  );
}

/**
 * Quick View Popup for Org Chart Nodes
 */
function EmployeeDetailsPopup({ employeeId, nodeData, allowEmployeeFetch = true, onClose }) {
  const [employee, setEmployee] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [accessDenied, setAccessDenied] = React.useState(false);
  const router = useRouter();
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const employeeBasePath = pathname.startsWith("/it-admin")
    ? "/it-admin"
    : pathname.startsWith("/manager")
      ? "/manager"
      : pathname.startsWith("/dept-head")
        ? "/dept-head"
        : pathname.startsWith("/payroll")
          ? "/payroll"
          : "/hr";

  React.useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (!allowEmployeeFetch) {
          setEmployee({
            displayName: nodeData?.name || "Employee",
            designationName: nodeData?.role || "Stakeholder",
            departmentName: nodeData?.department || "General",
          });
          return;
        }
        const { employeeService } = await import('@/services/hr-services/employeeService');
        const response = await employeeService.getEmployeeById(employeeId);
        if (response.success) {
          setEmployee(response.data);
        }
      } catch (err) {
        const message = err?.message || "Failed to load details";
        if (message.toLowerCase().includes("access denied")) {
          setAccessDenied(true);
        } else {
          console.error("Popup fetch failed:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [employeeId, allowEmployeeFetch, nodeData]);

  if (!employeeId) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transform transition-all">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Retrieving profile...</p>
          </div>
        ) : employee ? (
          <div className="flex flex-col">
            {/* Header / Avatar */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-8 text-center relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full mx-auto mb-4 border-4 border-white/30 flex items-center justify-center shadow-lg overflow-hidden">
                {employee.profileImage ? (
                  <img 
                    src={getFileUrl(employee.profileImage, "")} 
                    className="w-full h-full object-cover" 
                    alt="" 
                  />
                ) : (
                  <span className="text-3xl font-bold text-white uppercase">
                    {(employee.displayName || employee.firstName || "E").charAt(0)}
                  </span>
                )}
              </div>
              <h4 className="text-xl font-bold text-white">
                {employee.displayName || `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Employee"}
              </h4>
              <p className="text-white/70 text-sm font-medium uppercase tracking-widest mt-1">
                {employee.designation?.name || employee.designationName || 'Stakeholder'}
              </p>
            </div>

            {/* Quick Stats/Details */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 transition-colors">
                    <Building className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Department</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{employee.department?.name || employee.departmentName || 'General'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 transition-colors">
                    <Mail className="w-5 h-5 text-gray-400 group-hover:text-emerald-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Official Email</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{employee.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center group-hover:bg-sky-50 dark:group-hover:bg-sky-500/10 transition-colors">
                    <CalendarDays className="w-5 h-5 text-gray-400 group-hover:text-sky-500" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Joined On</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => router.push(`${employeeBasePath}/employees/${employeeId}`)}
                  className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl font-bold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={!allowEmployeeFetch}
                >
                  View Full Profile
                </button>
                <button 
                  onClick={onClose}
                  className="px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-700 font-bold text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ) : accessDenied ? (
          <div className="p-8 text-center text-gray-500">Access denied. Insufficient permissions.</div>
        ) : (
          <div className="p-8 text-center text-gray-500">Could not load details.</div>
        )}
      </div>
    </div>
  );
}
