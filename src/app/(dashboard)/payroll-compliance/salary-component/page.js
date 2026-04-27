"use client";
import React, { useState, useEffect } from 'react';
import axios from '@/lib/api';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SalaryComponentPage() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('EARNING');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchComponents = async () => {
    try {
      const { data } = await axios.get('/payroll/payroll-compliance/salary-component-configs');
      const componentsData = Array.isArray(data.data) ? data.data : (data.data?.components || []);
      setComponents(componentsData);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load components');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const handleDelete = async (id, isDeletable) => {
    if (!isDeletable) {
      toast.error('Cannot delete mandatory statutory component');
      return;
    }
    if (!confirm('Are you sure you want to delete this component?')) return;
    try {
      await axios.delete(`/payroll/payroll-compliance/salary-component-configs/${id}`);
      toast.success('Deleted successfully');
      fetchComponents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const ComponentModal = ({ onClose, onSuccess, initialData }) => {
    const [formData, setFormData] = useState(initialData || {
      name: '', type: activeTab, category: 'Non-Statutory', calculationType: 'FIXED_AMOUNT',
      value: 0, maxAmount: null, eligibilityThreshold: null, considerForPf: false, considerForEsi: false, taxable: true, status: 'ACTIVE'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (initialData?.id) {
          await axios.put(`/payroll/payroll-compliance/salary-component-configs/${initialData.id}`, formData);
          toast.success('Updated successfully');
        } else {
          await axios.post('/payroll/payroll-compliance/salary-component-configs', formData);
          toast.success('Created successfully');
        }
        onSuccess();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error saving component');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">{initialData ? 'Edit Component' : 'Add Component'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input required className="w-full border rounded p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className="w-full border rounded p-2" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="EARNING">Earning</option>
                  <option value="DEDUCTION">Deduction</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Calculation Type</label>
                <select className="w-full border rounded p-2" value={formData.calculationType} onChange={e => setFormData({...formData, calculationType: e.target.value})}>
                  <option value="FIXED_AMOUNT">Fixed Amount</option>
                  <option value="PERCENTAGE_OF_BASIC">Percentage of Basic</option>
                  <option value="PERCENTAGE_OF_CTC">Percentage of CTC</option>
                  <option value="FORMULA_BASED">Formula Based</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Default Value / Percentage</label>
                <input type="number" step="0.01" className="w-full border rounded p-2" value={formData.value || ''} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Amount (Optional)</label>
                <input type="number" step="1" className="w-full border rounded p-2" placeholder="e.g. 1800" value={formData.maxAmount || ''} onChange={e => setFormData({...formData, maxAmount: e.target.value ? parseFloat(e.target.value) : null})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Eligibility Threshold (Optional)</label>
                <input type="number" step="1" className="w-full border rounded p-2" placeholder="e.g. 21000" value={formData.eligibilityThreshold || ''} onChange={e => setFormData({...formData, eligibilityThreshold: e.target.value ? parseFloat(e.target.value) : null})} />
                <p className="text-xs text-gray-500 mt-1">Deduct only if Basic Salary is less than or equal to this amount.</p>
              </div>
            </div>
            {formData.calculationType === 'FORMULA_BASED' && (
              <div>
                <label className="block text-sm font-medium mb-1">Formula (Optional)</label>
                <input className="w-full border rounded p-2" value={formData.formula || ''} onChange={e => setFormData({...formData, formula: e.target.value})} />
              </div>
            )}
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.taxable} onChange={e => setFormData({...formData, taxable: e.target.checked})} /> Taxable
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="w-full border rounded p-2" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const filtered = components.filter(c => c.type === activeTab);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Salary Components</h1>
        <button onClick={() => { setEditData(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={18} /> Add Component
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b">
          {['EARNING', 'DEDUCTION'].map(tab => (
            <button key={tab} className={`px-6 py-3 font-medium ${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`} onClick={() => setActiveTab(tab)}>
              {tab === 'EARNING' ? 'Earnings' : 'Deductions'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 font-medium text-gray-600">Name</th>
                  <th className="p-4 font-medium text-gray-600">Type</th>
                  <th className="p-4 font-medium text-gray-600">Calculation Type</th>
                  <th className="p-4 font-medium text-gray-600">Max Amount</th>
                  <th className="p-4 font-medium text-gray-600">Threshold</th>
                  <th className="p-4 font-medium text-gray-600">Status</th>
                  <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-500">No components found</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">
                      {c.name}
                      {c.isDefault && <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">System</span>}
                    </td>
                    <td className="p-4">{c.category}</td>
                    <td className="p-4">{c.calculationType}</td>
                    <td className="p-4">{c.maxAmount ? `₹${c.maxAmount}` : '-'}</td>
                    <td className="p-4">{c.eligibilityThreshold ? `₹${c.eligibilityThreshold}` : '-'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-3">
                      <button onClick={() => { setEditData(c); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(c.id, c.deletable)} className={`${c.deletable ? 'text-red-500 hover:text-red-700' : 'text-gray-300 cursor-not-allowed'}`}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ComponentModal 
          initialData={editData} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchComponents(); }} 
        />
      )}
    </div>
  );
}
