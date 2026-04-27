"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { toast } from 'react-hot-toast';
import { Calculator, Save, CheckCircle, ArrowRight } from 'lucide-react';
import { employeeService } from '@/services/hr-services/employeeService';
import { salaryTemplateService } from '@/services/payroll-role-services/salary-templates.service';
import { payrollSalaryStructureService } from '@/services/payroll-role-services/salary-structure.service';
import { apiClient } from '@/lib/api';
import DatePicker from '@/components/common/DatePicker';
import SalaryRevisionBulkUploadModal from './RevisionBulkUploadModal';

export default function SalaryRevisionForm() {
  const router = useRouter();
  
  const [employees, setEmployees] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [revisionReason, setRevisionReason] = useState('INCREMENT');
  const [notes, setNotes] = useState('');
  
  // Salary State
  const [oldStructure, setOldStructure] = useState(null);
  const [incrementPercent, setIncrementPercent] = useState('');
  const [newAnnualCTC, setNewAnnualCTC] = useState('');
  const [newStructure, setNewStructure] = useState(null);
  
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [empRes, tplRes] = await Promise.all([
        employeeService.getAllEmployees({ limit: 1000 }),
        salaryTemplateService.getTemplates()
      ]);
      setEmployees(empRes.data?.employees || empRes.data?.data || empRes.data || []);
      setTemplates(tplRes.data?.data || tplRes.data || []);
      
      const today = new Date().toISOString().split('T')[0];
      setEffectiveDate(today);
    } catch (error) {
      toast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  // Handle Employee Selection
  const handleEmployeeChange = async (e) => {
    const empId = e.target.value;
    setSelectedEmployeeId(empId);
    setOldStructure(null);
    setNewStructure(null);
    setIncrementPercent('');
    setNewAnnualCTC('');
    
    if (!empId) return;

    try {
      const emp = employees.find(e => e.employee?.id.toString() === empId.toString());
      
      // Safe fallback: fetch all and filter client side to avoid brittle backend search keys
      const res = await payrollSalaryStructureService.getAllSalaryStructures({ limit: 1000 });
      const structures = res.data?.salaryStructures || res.data?.data || res.data || [];
      
      let targetStructure = null;
      if (Array.isArray(structures)) {
        const empCode = emp?.biometricId || emp?.employeeId || emp?.employee?.employeeId || '';
        const empDbId = empId; // This is now the Employee ID from dropdown

        const empStructures = structures.filter(s => {
          // Check DB primary key match
          if (s.employeeId && parseInt(s.employeeId) === parseInt(empDbId)) return true;
          if (s.employee?.id && parseInt(s.employee.id) === parseInt(empDbId)) return true;
          
          // Check string code match
          const sCode = s.employee_id || s.employee?.employeeId;
          if (sCode && empCode && sCode.toString().trim() === empCode.toString().trim()) {
             return true;
          }
          return false;
        });
        
        // Prioritize ACTIVE, fallback to the first (latest) available
        targetStructure = empStructures.find(s => s.status === 'ACTIVE') || empStructures[0];
      }
      
      if (targetStructure) {
        setOldStructure(targetStructure);
        setSelectedTemplateId(targetStructure.salaryTemplateId || '');
        // Do not auto-fill newAnnualCTC to allow user to enter it themselves
        setNewAnnualCTC(''); 
        setIncrementPercent('');
        
        if (targetStructure.status !== 'ACTIVE') {
          toast.success("Found an INACTIVE structure to revise.");
        }
      } else {
        toast.error('No salary structure found for this employee to revise.');
      }
    } catch (error) {
     toast.error('Could not fetch active salary structure');
    }
  };

  const handlePercentChange = (e) => {
    const val = e.target.value;
    setIncrementPercent(val);
    const percent = parseFloat(val);
    
    if (!oldStructure || isNaN(percent)) {
        if (val === '') setNewAnnualCTC('');
        return;
    }
    const oldCTC = parseFloat(oldStructure.annualCTC) || (parseFloat(oldStructure.monthlyCTC) * 12) || 0;
    const newCTC = oldCTC + (oldCTC * (percent / 100));
    setNewAnnualCTC(Math.round(newCTC).toString());
  };

  const handleNewCTCChange = (e) => {
    const val = e.target.value;
    setNewAnnualCTC(val);
    const newCTC = parseFloat(val);
    
    if (!oldStructure || isNaN(newCTC)) {
        if (val === '') setIncrementPercent('');
        return;
    }
    const oldCTC = parseFloat(oldStructure.annualCTC) || (parseFloat(oldStructure.monthlyCTC) * 12) || 0;
    if (oldCTC > 0) {
      const percent = ((newCTC - oldCTC) / oldCTC) * 100;
      setIncrementPercent(percent.toFixed(2));
    }
  };

  // Auto-calculate new structure when NewCTC or Template changes
  useEffect(() => {
    if (!selectedTemplateId || !newAnnualCTC) return;
    
    const calculateNewStructure = async () => {
      try {
        const tplRes = await salaryTemplateService.getTemplateById(selectedTemplateId);
        const template = tplRes.data?.data || tplRes.data;
        if (!template) return;

        const ctc = parseFloat(newAnnualCTC) || 0;
        const monthlyCTC = ctc / 12;

        const newStruct = {
            annualCTC: ctc,
            monthlyCTC: monthlyCTC,
            basicSalary: 0,
            hra: 0,
            pf: 0,
            pt: 0,
            tds: 0,
            specialAllowance: 0,
            conveyance: 0,
            medical: 0,
            otherAllowances: [],
            deductions: []
        };

        const components = [...(template.components || [])].sort((a, b) => {
            const nameA = (a.component?.name || "").toLowerCase();
            if (nameA.includes("basic")) return -1;
            return 1;
        });

        components.forEach((tc) => {
            const comp = tc.component;
            if (!comp) return;

            let value = tc.overrideValue !== null ? tc.overrideValue : comp.value;
            const calcType = tc.overrideCalculationType || comp.calculationType;
            const name = comp.name.toLowerCase();

            if (calcType === "PERCENTAGE_OF_CTC" && monthlyCTC > 0) {
                value = Math.round((value / 100) * monthlyCTC);
            } else if (calcType === "PERCENTAGE_OF_BASIC" && newStruct.basicSalary > 0) {
                value = Math.round((value / 100) * newStruct.basicSalary);
            }

            if (comp.maxAmount && value > comp.maxAmount) value = comp.maxAmount;
            if (comp.eligibilityThreshold && newStruct.basicSalary > comp.eligibilityThreshold) value = 0;

            if (name.includes("basic")) newStruct.basicSalary = value;
            else if (name === "hra") newStruct.hra = value;
            else if (name.includes("pf") && comp.type === "DEDUCTION") newStruct.pf = value;
            else if (name.includes("professional tax") || name === "pt") newStruct.pt = value;
            else if (name.includes("income tax") || name === "tds") newStruct.tds = value;
            else if (name === "special allowance") return; // Handled later
            else if (comp.type === "EARNING") newStruct.otherAllowances.push({ name: comp.name, amount: value });
            else if (comp.type === "DEDUCTION") newStruct.deductions.push({ name: comp.name, amount: value });
        });

        // ESIC Rule: 4% of BASIC salary if BASIC <= 21,000
        const esic = newStruct.basicSalary <= 21000 ? Math.ceil(newStruct.basicSalary * 0.04) : 0;
        const employerEsic = 0; 
        
        // Push ESIC to deductions if > 0
        if (esic > 0) {
            newStruct.deductions.push({ name: "ESIC", amount: esic });
        }

        const otherEarningsTotal = newStruct.otherAllowances.reduce((a, b) => a + b.amount, 0);
        const earningsTotal = newStruct.basicSalary + newStruct.hra + otherEarningsTotal;
        
        // Special Allowance is the balancing component to reach the Monthly CTC
        // We do not subtract deductions here as CTC is typically treated as Gross in this context
        newStruct.specialAllowance = Math.max(0, Math.round(monthlyCTC - earningsTotal));

        setNewStructure(newStruct);
      } catch (e) {
        console.error(e);
      }
    };
    
    calculateNewStructure();
  }, [newAnnualCTC, selectedTemplateId]);

  const handleSubmit = async (status) => {
    // Form Validation Step
    if (!selectedEmployeeId) { toast.error("Employee is required"); return; }
    if (!selectedTemplateId) { toast.error("Salary Template is required"); return; }
    if (!effectiveDate) { toast.error("Effective Date is required"); return; }
    if (!newAnnualCTC || parseFloat(newAnnualCTC) <= 0) {
        toast.error("Valid New Annual CTC is required and must be greater than zero");
        return;
    }
    if (!newStructure) {
        toast.error('Please ensure the structure is properly calculated before submitting.');
        return;
    }

    setSubmitting(true);
    try {
      const payload = {
        employeeId: parseInt(selectedEmployeeId),
        salaryTemplateId: parseInt(selectedTemplateId),
        oldStructure: oldStructure || {},
        newStructure: newStructure,
        effectiveDate: effectiveDate,
        revisionReason: revisionReason,
        notes: notes,
        status: status // 'DRAFT' or 'PENDING_APPROVAL'
      };

      await payrollSalaryStructureService.createRevision(payload);
      toast.success(`Revision ${status === 'DRAFT' ? 'saved as draft' : 'submitted for approval'} successfully`);
      router.push('/payroll-compliance/salary-structure/revisions');
    } catch (error) {
      toast.error(error.message || 'Failed to process revision');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading form...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold dark:text-white">Salary Revision Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track increment cycles, promotions, and retro-impact</p>
        </div>
        <div className="flex gap-3">
          <button 
             onClick={() => setIsBulkModalOpen(true)}
             className="px-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-50 flex items-center gap-2"
          >
            <Calculator className="w-4 h-4"/> Bulk Upload
          </button>
          <button 
             onClick={() => handleSubmit('DRAFT')}
             disabled={submitting}
             className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg bg-white dark:bg-gray-800 hover:bg-blue-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4"/> Save Draft
          </button>
          <button 
             onClick={() => handleSubmit('PENDING_APPROVAL')}
             disabled={submitting}
             className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-primary-500/20"
          >
            <CheckCircle className="w-4 h-4"/> Submit for Approval
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Revision Details</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Employee *</label>
                <select 
                  value={selectedEmployeeId} 
                  onChange={handleEmployeeChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                >
                  <option value="">Select Employee</option>
                  {employees.filter(e => e.employee).map(emp => {
                    const firstName = emp.employee?.firstName || emp.firstName || 'Unknown';
                    const lastName = emp.employee?.lastName || emp.lastName || '';
                    const empIdCode = emp.employee?.employeeId || emp.employeeCode || emp.biometricId || emp.employee?.id;
                    return (
                      <option key={emp.employee.id} value={emp.employee.id}>
                        {firstName} {lastName} ({empIdCode})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                 <label className="block text-sm font-medium mb-1 dark:text-gray-300">Salary Template *</label>
                 <select 
                   value={selectedTemplateId} 
                   onChange={e => setSelectedTemplateId(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                 >
                   <option value="">Select Template</option>
                   {templates.map(tpl => (
                     <option key={tpl.id} value={tpl.id}>{tpl.templateName}</option>
                   ))}
                 </select>
              </div>
            </div>

            {/* Current Salary Information Card */}
            {oldStructure && (
              <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">Current Active CTC</p>
                  <p className="text-xl font-black text-amber-900 dark:text-amber-200">
                    ₹{(oldStructure.annualCTC || (oldStructure.monthlyCTC * 12))?.toLocaleString() || 0}
                    <span className="text-xs font-normal ml-2 opacity-60">per annum</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Effective Since</p>
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    {oldStructure.effectiveDate ? new Date(oldStructure.effectiveDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium mb-1 dark:text-gray-300">Effective Date *</label>
                 <DatePicker 
                   value={effectiveDate}
                   onChange={e => setEffectiveDate(e.target.value)}
                   required
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium mb-1 dark:text-gray-300">Reason</label>
                 <select 
                   value={revisionReason}
                   onChange={e => setRevisionReason(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                 >
                   <option value="INCREMENT">Increment</option>
                   <option value="PROMOTION">Promotion</option>
                   <option value="MARKET_ADJUSTMENT">Market Adjustment</option>
                   <option value="PERFORMANCE_BONUS">Performance Bonus</option>
                   <option value="CORRECTION">Correction</option>
                 </select>
              </div>
            </div>

            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/50">
               <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3 uppercase tracking-wider">Revision Input</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Revised Annual CTC *</label>
                   <div className="relative">
                     <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                     <input 
                       type="number"
                       value={newAnnualCTC}
                       onChange={handleNewCTCChange}
                       placeholder="Enter new annual amount"
                       className="w-full pl-8 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 font-bold text-lg focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                     />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-medium mb-1 dark:text-gray-300">Increment (%)</label>
                   <div className="relative">
                     <input 
                       type="number"
                       value={incrementPercent}
                       onChange={handlePercentChange}
                       placeholder="0.00"
                       className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 font-medium text-lg focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                     />
                     <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                   </div>
                 </div>
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Revision Notes</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                placeholder="Manager recommendations or approval remarks..."
              />
            </div>

            {/* Integrated Breakdown Section */}
            {(oldStructure || newStructure) && (
              <div className="pt-4 border-t dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                   <div className="h-5 w-1 bg-primary-600 rounded-full"></div>
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">Salary Breakdown Analysis</h3>
                </div>
                
                <div className="bg-gray-50/50 dark:bg-gray-700/30 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-100/50 dark:bg-gray-800 font-bold">
                      <tr>
                        <th className="px-6 py-3">Components</th>
                        <th className="px-6 py-3 text-right">Current Structure</th>
                        <th className="px-6 py-3 text-right text-primary-600">Revised Structure</th>
                        <th className="px-6 py-3 text-right">Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      <tr className="bg-white/50 dark:bg-transparent font-bold">
                        <td className="px-6 py-4">Annual CTC</td>
                        <td className="px-6 py-4 text-right">₹{(oldStructure?.annualCTC || (oldStructure?.monthlyCTC * 12))?.toLocaleString() || 0}</td>
                        <td className="px-6 py-4 text-right text-primary-600 font-extrabold text-base">₹{newStructure?.annualCTC?.toLocaleString() || 0}</td>
                        <td className="px-6 py-4 text-right text-green-600">
                           {newStructure && oldStructure && (newStructure.annualCTC - (oldStructure.annualCTC || oldStructure.monthlyCTC * 12)) > 0 ? 
                             `+ ₹${(newStructure.annualCTC - (oldStructure.annualCTC || oldStructure.monthlyCTC * 12)).toLocaleString()}` : '—'}
                        </td>
                      </tr>
                      <tr className="bg-gray-50/30 dark:bg-transparent font-semibold">
                        <td className="px-6 py-3">Monthly CTC</td>
                        <td className="px-6 py-3 text-right">₹{oldStructure?.monthlyCTC?.toLocaleString() || 0}</td>
                        <td className="px-6 py-3 text-right">₹{newStructure?.monthlyCTC?.toLocaleString() || 0}</td>
                        <td className="px-6 py-3 text-right"></td>
                      </tr>
                      
                      {/* Earnings Breakdown */}
                      <tr><td colSpan="4" className="px-6 py-2 bg-gray-50 dark:bg-gray-800 text-[10px] font-black text-gray-400 uppercase tracking-widest">Earnings</td></tr>
                      
                      <ComparisonRow label="Basic Salary" oldVal={oldStructure?.basicSalary} newVal={newStructure?.basicSalary} />
                      <ComparisonRow label="HRA" oldVal={oldStructure?.hra} newVal={newStructure?.hra} />
                      <ComparisonRow label="Special Allowance" oldVal={oldStructure?.specialAllowance} newVal={newStructure?.specialAllowance} />
                      
                      {/* Allowances Combined */}
                      <ComparisonRow 
                        label="Other Allowances" 
                        oldVal={oldStructure?.otherAllowances?.reduce((a,b)=>a+(b.amount||0), 0) || 0} 
                        newVal={newStructure?.otherAllowances?.reduce((a,b)=>a+(b.amount||0), 0) || 0} 
                      />

                      {/* Deductions Breakdown */}
                      <tr><td colSpan="4" className="px-6 py-2 bg-gray-50 dark:bg-gray-800 text-[10px] font-black text-gray-400 uppercase tracking-widest">Deductions (Monthly)</td></tr>
                      
                      <ComparisonRow label="PF (Employee)" oldVal={oldStructure?.pf} newVal={newStructure?.pf} />
                      <ComparisonRow 
                         label="ESIC" 
                         oldVal={oldStructure?.deductions?.find(d => d.name === "ESIC")?.amount || 0} 
                         newVal={newStructure?.deductions?.find(d => d.name === "ESIC")?.amount || 0} 
                      />
                      <ComparisonRow label="Professional Tax (PT)" oldVal={oldStructure?.pt} newVal={newStructure?.pt} />
                      <ComparisonRow label="TDS / Income Tax" oldVal={oldStructure?.tds} newVal={newStructure?.tds} />
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bulk Upload Modal */}
      <SalaryRevisionBulkUploadModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImportSuccess={() => {
          setIsBulkModalOpen(false);
          router.push('/payroll-compliance/salary-structure/revisions');
        }}
      />
    </div>
  );
}

function ComparisonRow({ label, oldVal, newVal }) {
  const o = oldVal || 0;
  const n = newVal || 0;
  const diff = n - o;
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <td className="px-6 py-3 text-gray-600 dark:text-gray-400 font-medium">{label}</td>
      <td className="px-6 py-3 text-right text-gray-700 dark:text-gray-300">₹{o.toLocaleString()}</td>
      <td className="px-6 py-3 text-right text-gray-900 dark:text-white font-semibold">₹{n.toLocaleString()}</td>
      <td className="px-6 py-3 text-right">
        {diff !== 0 && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diff > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
            {diff > 0 ? '+' : ''}{Math.round(diff).toLocaleString()}
          </span>
        )}
      </td>
    </tr>
  );
}
