"use client";

import React, { useCallback, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Building, GitBranch } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";

const Tree = dynamic(() => import('react-d3-tree'), { ssr: false });

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

export default function EmployeeOrgStructurePage() {
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [hierarchyData, setHierarchyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const containerRef = useCallback((containerElem) => {
    if (containerElem !== null) {
      const { width } = containerElem.getBoundingClientRect();
      setTranslate({ x: width / 2, y: 80 });
    }
  }, []);

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        const { employeeService } = await import('@/services/hr-services/employeeService');
        const result = await employeeService.getHierarchy();
        const hierarchy = result?.data || result;

        if (!hierarchy || (Array.isArray(hierarchy) && hierarchy.length === 0) || !hierarchy.name) {
          setHierarchyData({ name: "No Employees Found", attributes: { role: "N/A" } });
        } else {
          setHierarchyData(hierarchy);
        }
      } catch (err) {
        console.error("Failed to load hierarchy:", err);
        setHierarchyData(staticHierarchy);
      } finally {
        setLoading(false);
      }
    };
    fetchTreeData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-120px)]">
        <Breadcrumb 
          items={[
            { label: 'Employee', href: '/employee/dashboard' },
            { label: 'Organization Structure', href: '#' }
          ]} 
        />

        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] border border-primary-100/50 dark:border-gray-700 shadow-xl overflow-hidden flex flex-col flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 border-b border-primary-100/30 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-inner">
                <GitBranch size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Hierarchy</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">Visual representation of company departments and leadership.</p>
              </div>
            </div>
          </div>

          <div className="relative flex-1 bg-gray-50/30 dark:bg-gray-900/10" ref={containerRef}>
            <div className="absolute top-6 right-8 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500 silver-shadow">
              Scroll to Zoom • Drag to Pan
            </div>

            <div className="w-full h-full text-center">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mr-3"></div>
                   Initializing structure...
                </div>
              ) : (
                <Tree
                  data={hierarchyData}
                  translate={translate}
                  orientation="vertical"
                  pathFunc="step"
                  separation={{ siblings: 1.5, nonSiblings: 2 }}
                  zoomable={true}
                  draggable={true}
                  collapsible={true}
                  nodeSize={{ x: 260, y: 180 }}
                  zoom={0.7}
                  renderCustomNodeElement={(rd3tProps) => (
                    <g>
                      <circle r="8" fill="#2563EB" className="animate-pulse" />
                      <foreignObject x="-110" y="20" width="220" height="100">
                        <div 
                          className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 text-center shadow-xl silver-shadow scale-95 select-none transition-all duration-300"
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
              )}
            </div>
          </div>
        </div>
      </div>

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
