"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Save, 
  Send, 
  Plus, 
  FileText, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Upload,
  Calendar,
  X,
  Building2,
  ShieldCheck,
  Wallet,
  Eye
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import investmentDeclarationService from "@/services/investment-declaration.service";

export default function InvestmentDeclarationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isProofWindow, setIsProofWindow] = useState(false);
  const [declarations, setDeclarations] = useState([]);
  const [currentView, setCurrentView] = useState('LIST'); // 'LIST' or 'FORM'
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [financialYear, setFinancialYear] = useState("2025-2026");
  
  const [formData, setFormData] = useState({
    hraRentPaid: "",
    hraLandlordName: "",
    hraLandlordPan: "",
    hraAddress: "",
    ltaAmount: "",
    section80C: { lic: 0, ppf: 0, elss: 0, nsc: 0, others: 0 },
    section80D: { medicalSelf: 0, medicalParents: 0 },
    otherDeductions: { homeLoanInterest: 0, educationLoanInterest: 0 },
    supportingDocs: []
  });

  const months = [
    "April", "May", "June", "July", "August", "September",
    "October", "November", "December", "January", "February", "March"
  ];

  const currentMonthName = new Date().toLocaleString('default', { month: 'long' });

  useEffect(() => {
    if (user && user.systemRole === 'EMPLOYEE') {
      const taxRegime = user.employee?.taxRegime || 'OLD';
      if (taxRegime === 'NEW') {
        router.push('/employee/dashboard');
      }
    }
  }, [user, router]);

  // Loading state if not on OLD regime (will redirect)
  if (user?.systemRole === 'EMPLOYEE' && user.employee?.taxRegime === 'NEW') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  useEffect(() => {
    fetchStatus();
    fetchMyDeclarations();
  }, [selectedMonth]);

  const fetchStatus = async () => {
    try {
      const resp = await investmentDeclarationService.checkProofWindow();
      setIsProofWindow(resp.isOpen);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyDeclarations = async () => {
    try {
      setLoading(true);
      const resp = await investmentDeclarationService.getMyDeclarations(financialYear);
      const decls = resp.declarations || [];
      setDeclarations(decls);
      
      const current = decls.find(d => d.month === selectedMonth);
      if (current) {
        setFormData({
          hraRentPaid: current.hraRentPaid || "",
          hraLandlordName: current.hraLandlordName || "",
          hraLandlordPan: current.hraLandlordPan || "",
          hraAddress: current.hraAddress || "",
          ltaAmount: current.ltaAmount || "",
          section80C: current.section80C || { lic: 0, ppf: 0, elss: 0, nsc: 0, others: 0 },
          section80D: current.section80D || { medicalSelf: 0, medicalParents: 0 },
          otherDeductions: current.otherDeductions || { homeLoanInterest: 0, educationLoanInterest: 0 },
          supportingDocs: current.supportingDocs || []
        });
      } else {
        setFormData({
            hraRentPaid: "",
            hraLandlordName: "",
            hraLandlordPan: "",
            hraAddress: "",
            ltaAmount: "",
            section80C: { lic: 0, ppf: 0, elss: 0, nsc: 0, others: 0 },
            section80D: { medicalSelf: 0, medicalParents: 0 },
            otherDeductions: { homeLoanInterest: 0, educationLoanInterest: 0 },
            supportingDocs: []
        });
      }
    } catch (err) {
      toast.error("Failed to load declarations");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (sectionKey, file) => {
    try {
      setLoading(true);
      const resp = await investmentDeclarationService.uploadProof(file);
      const newProof = {
        section: sectionKey,
        url: resp.file.url,
        name: resp.file.name,
        uploadedAt: new Date()
      };
      
      setFormData(prev => ({
        ...prev,
        supportingDocs: [...(prev.supportingDocs || []).filter(p => p.section !== sectionKey), newProof]
      }));
      toast.success(`${resp.file.name} uploaded for ${sectionKey}`);
    } catch (err) {
      toast.error("Failed to upload proof");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value, group = null) => {
    if (group) {
      setFormData(prev => ({
        ...prev,
        [group]: { ...prev[group], [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (status) => {
    try {
      setLoading(true);
      
      const castToNumbers = (obj) => {
        const result = { ...obj };
        Object.keys(result).forEach(key => {
          if (typeof result[key] === 'string' && result[key] !== '') {
            const val = parseFloat(result[key]);
            if (!isNaN(val)) result[key] = val;
          }
        });
        return result;
      };

      const payload = {
        ...formData,
        hraRentPaid: formData.hraRentPaid ? parseFloat(formData.hraRentPaid) : 0,
        ltaAmount: formData.ltaAmount ? parseFloat(formData.ltaAmount) : 0,
        section80C: castToNumbers(formData.section80C),
        section80D: castToNumbers(formData.section80D),
        otherDeductions: castToNumbers(formData.otherDeductions),
        month: selectedMonth,
        financialYear,
        status,
        isProofSubmission: isProofWindow
      };
      
      await investmentDeclarationService.submitDeclaration(payload);
      toast.success(status === 'SUBMITTED' ? "Declaration submitted successfully!" : "Draft saved successfully!");
      fetchMyDeclarations();
      setCurrentView('LIST');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit declaration");
    } finally {
      setLoading(false);
    }
  };

  const ProofUploadButton = ({ sectionKey, label }) => {
    if (!isProofWindow) return null;
    
    const proof = formData.supportingDocs?.find(p => p.section === sectionKey);
    
    return (
      <div className="flex flex-col gap-1 mt-2">
        <div className="flex items-center justify-between gap-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Proof for {label}</label>
          {proof && (
            <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
              <CheckCircle2 size={10} />
              Uploaded
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!proof ? (
            <label className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-600 rounded-lg text-xs font-bold cursor-pointer transition-all border border-brand-100 border-dashed">
              <Upload size={14} />
              Upload Document
              <input 
                type="file" 
                className="hidden" 
                disabled={isLocked}
                onChange={(e) => e.target.files[0] && handleFileUpload(sectionKey, e.target.files[0])} 
              />
            </label>
          ) : (
            <div className="flex-1 flex items-center justify-between gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg group">
              <a 
                href={proof.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 overflow-hidden hover:text-brand-600 transition-colors cursor-pointer"
              >
                <Eye size={14} className="text-brand-500 shrink-0" />
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate font-medium underline underline-offset-2">{proof.name}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  const currentDecl = declarations.find(d => d.month === selectedMonth);
  const currentStatus = currentDecl?.status || 'NOT_STARTED';
  // Form is locked if it's already processed, UNLESS the proof window is open for re-submission
  const isLocked = (currentStatus === 'SUBMITTED' || currentStatus === 'APPROVED' || currentStatus === 'PENDING') && !isProofWindow;

  const currentMonthDecl = declarations.find(d => d.month === currentMonthName);
  const isCurrentMonthDisabled = currentMonthDecl && (currentMonthDecl.status === 'SUBMITTED' || currentMonthDecl.status === 'APPROVED' || currentMonthDecl.status === 'PENDING');

  const openDeclaration = (month) => {
    setSelectedMonth(month);
    setCurrentView('FORM');
  };

  const handleRegimeSelect = async (regime) => {
    try {
      setLoading(true);
      // We'll need a way to update the employee's tax regime.
      // Assuming employee service has this or adding to investment service
      await apiClient.patch(`/employees/me/tax-regime`, { taxRegime: regime });
      toast.success(`Tax regime set to ${regime}`);
      
      // Update local user state if possible or just refresh
      window.location.reload();
    } catch (err) {
      toast.error("Failed to update tax regime");
    } finally {
      setLoading(false);
    }
  };

  if (user?.systemRole === 'EMPLOYEE' && !user.employee?.taxRegime) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Select Your Tax Regime</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Choose the tax scheme that best suits your financial goals for FY {financialYear}.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {/* New Regime Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => handleRegimeSelect('NEW')}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border-2 border-transparent hover:border-brand-500 cursor-pointer transition-all flex flex-col items-center text-center space-y-6"
            >
              <div className="h-20 w-20 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600">
                <ShieldCheck size={40} />
              </div>
              <h3 className="text-2xl font-bold">New Tax Regime</h3>
              <ul className="text-sm text-gray-500 space-y-2 text-left w-full">
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 font-bold">✓</span>
                  Lower tax rates across income slabs.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-500 font-bold">✓</span>
                  Simple compliance (no proofs required).
                </li>
                <li className="flex items-start gap-2 text-red-500">
                  <span className="font-bold">✗</span>
                  Forego most exemptions (HRA, 80C, etc).
                </li>
              </ul>
              <button className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold">Select New Regime</button>
            </motion.div>

            {/* Old Regime Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              onClick={() => handleRegimeSelect('OLD')}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border-2 border-transparent hover:border-blue-500 cursor-pointer transition-all flex flex-col items-center text-center space-y-6"
            >
              <div className="h-20 w-20 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Building2 size={40} />
              </div>
              <h3 className="text-2xl font-bold">Old Tax Regime</h3>
              <ul className="text-sm text-gray-500 space-y-2 text-left w-full">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">✓</span>
                  Avail standard deductions & exemptions.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">✓</span>
                  Benefit from HRA, 80C, 80D savings.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">✓</span>
                  Ideal if you have high investments.
                </li>
              </ul>
              <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold">Select Old Regime</button>
            </motion.div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 p-6 rounded-2xl flex gap-4">
             <AlertCircle className="text-amber-600 shrink-0" size={24} />
             <p className="text-sm text-amber-800 dark:text-amber-200">
               <strong>Note:</strong> Once selected, you can only change your tax regime once per financial year (if allowed by your organization policy). Choice made here will be final for proof submission.
             </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Investment Declaration</h1>
          <p className="text-gray-500 mt-1">Manage your tax declarations and submission proofs.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm"
          >
            <option value="2025-2026">FY 2025-2026</option>
            <option value="2024-2025">FY 2024-2025</option>
            <option value="2023-2024">FY 2023-2024</option>
          </select>

          {currentView === 'LIST' ? (
            <button 
              disabled={isCurrentMonthDisabled}
              onClick={() => openDeclaration(currentMonthName)}
              className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50 disabled:bg-gray-400 disabled:shadow-none"
            >
              <Plus size={18} />
              {isCurrentMonthDisabled ? `Declaration Submitted for ${currentMonthName}` : `Declare for ${currentMonthName}`}
            </button>
          ) : (
            <button 
              onClick={() => setCurrentView('LIST')}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              <ChevronRight size={18} className="rotate-180" />
              Back to Listing
            </button>
          )}
        </div>
      </div>

      {isProofWindow && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-center gap-4"
        >
          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600">
            <Calendar size={20} />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm">Proof Submission Window is OPEN</h4>
            <p className="text-amber-700 dark:text-amber-400 text-xs">January 1st - January 22nd. Please upload valid proof for all declarations.</p>
          </div>
        </motion.div>
      )}

      {currentView === 'LIST' ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white">FY {financialYear} Declaration Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Month</th>
                  <th className="px-6 py-4">HRA Rent</th>
                  <th className="px-6 py-4">80C Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {months.map(month => {
                  const decl = declarations.find(d => d.month === month);
                  const status = decl?.status || 'NOT_STARTED';
                  const sec80CTotal = decl ? Object.values(decl.section80C || {}).reduce((a, b) => a + (parseFloat(b) || 0), 0) : 0;
                  const isOldMonth = months.indexOf(month) < months.indexOf(currentMonthName);
                  const isFutureMonth = months.indexOf(month) > months.indexOf(currentMonthName);

                  return (
                    <tr key={month} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 dark:text-white">{month}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {decl ? `₹${(decl.hraRentPaid || 0).toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {decl ? `₹${sec80CTotal.toLocaleString()}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700' :
                          status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                          status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                          status === 'DRAFT' ? 'bg-amber-50 text-amber-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openDeclaration(month)}
                          disabled={!decl && month !== currentMonthName}
                          className="text-brand-600 hover:text-brand-700 font-bold text-sm disabled:text-gray-300 disabled:cursor-not-allowed transition-all"
                        >
                          {status === 'NOT_STARTED' ? 'Declare' : 
                          (status === 'SUBMITTED' || status === 'APPROVED' || status === 'PENDING') ? 'View' : 'Edit'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Form View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form Side */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Section: HRA */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                    <Building2 size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">House Rent Allowance (HRA) - {selectedMonth}</h3>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Rent Paid</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input 
                      type="number" 
                      value={formData.hraRentPaid}
                      disabled={isLocked}
                      onChange={(e) => handleInputChange('hraRentPaid', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <ProofUploadButton sectionKey="HRA_RENT" label="Rent Paid" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Landlord Name</label>
                  <input 
                    type="text" 
                    value={formData.hraLandlordName}
                    disabled={isLocked}
                    onChange={(e) => handleInputChange('hraLandlordName', e.target.value)}
                    placeholder="Enter Name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Landlord PAN</label>
                  <input 
                    type="text" 
                    value={formData.hraLandlordPan}
                    disabled={isLocked}
                    onChange={(e) => handleInputChange('hraLandlordPan', e.target.value)}
                    placeholder="ABCDE1234F"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rental Address</label>
                  <textarea 
                    rows="2"
                    value={formData.hraAddress}
                    disabled={isLocked}
                    onChange={(e) => handleInputChange('hraAddress', e.target.value)}
                    placeholder="Full address of the rented property"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section: 80C Investments */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                    <ShieldCheck size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Section 80C Investments</h3>
                </div>
                <p className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded">Limit: ₹1,50,000</p>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                      { key: 'lic', label: 'Life Insurance (LIC)' },
                      { key: 'ppf', label: 'PPF' },
                      { key: 'elss', label: 'ELSS Mutual Funds' },
                      { key: 'nsc', label: 'NSC' },
                      { key: 'others', label: 'Tuition Fees / Others' }
                  ].map(item => (
                      <div key={item.key} className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                              <input 
                                  type="number" 
                                  value={formData.section80C[item.key]}
                                  disabled={isLocked}
                                  onChange={(e) => handleInputChange(item.key, e.target.value, 'section80C')}
                                  placeholder="0.00"
                                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                              />
                          </div>
                          <ProofUploadButton sectionKey={`80C_${item.key.toUpperCase()}`} label={item.label} />
                      </div>
                  ))}
              </div>
            </div>

            {/* Section: Other Deductions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                  <Wallet size={18} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Section 80D & Others</h3>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Medical Insurance (Self/Family)</label>
                      <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                          <input 
                              type="number" 
                              value={formData.section80D.medicalSelf}
                              disabled={isLocked}
                              onChange={(e) => handleInputChange('medicalSelf', e.target.value, 'section80D')}
                              placeholder="0.00"
                              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                      </div>
                      <ProofUploadButton sectionKey="80D_MEDICAL" label="Medical Insurance" />
                  </div>

                  <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Home Loan Interest (Section 24)</label>
                      <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                          <input 
                              type="number" 
                              value={formData.otherDeductions.homeLoanInterest}
                              disabled={isLocked}
                              onChange={(e) => handleInputChange('homeLoanInterest', e.target.value, 'otherDeductions')}
                              placeholder="0.00"
                              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                      </div>
                      <ProofUploadButton sectionKey="SEC24_HOME_LOAN" label="Home Loan Interest" />
                  </div>
              </div>
            </div>
          </div>

          {/* Right Info Side */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">Submission Status</h4>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl mb-6">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Status</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                  currentStatus === 'SUBMITTED' ? 'bg-blue-100 text-blue-700' :
                  currentStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  currentStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  status === 'DRAFT' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {currentStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => handleSubmit('DRAFT')}
                  disabled={loading || isLocked}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  Save as Draft
                </button>
                <button 
                  onClick={() => handleSubmit('SUBMITTED')}
                  disabled={loading || isLocked}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                  Submit Declaration
                </button>
              </div>
              
              {(currentStatus === 'SUBMITTED' || currentStatus === 'APPROVED' || currentStatus === 'PENDING') && (
                <p className="mt-4 text-xs text-center text-gray-500 italic">
                  {isProofWindow 
                    ? "Proof submission is active. You can upload documents and update your declaration for the final audit." 
                    : `Form is locked for editing as it has been ${currentStatus.toLowerCase()}.`
                  }
                </p>
              )}
            </div>

            {/* Quick Info Card */}
            <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl shadow-gray-200 dark:shadow-none">
              <div className="flex items-center gap-3 mb-4">
                <Info className="text-blue-400" size={20} />
                <h4 className="font-bold">Guidelines</h4>
              </div>
              <ul className="space-y-4 text-sm text-gray-300">
                <li className="flex gap-2">
                  <ChevronRight size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  Declarations can be modified during the financial year before final submission.
                </li>
                <li className="flex gap-2">
                  <ChevronRight size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  Landlord PAN is mandatory if annual rent exceeds ₹1,00,000.
                </li>
                <li className="flex gap-2">
                  <ChevronRight size={16} className="text-blue-400 shrink-0 mt-0.5" />
                  Supporting documents are only mandatory during January window.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
