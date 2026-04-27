// src/app/(dashboard)/hr/payroll/tax-settings/components/TaxExemptionsList.js
"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { payrollService } from '@/services/hr-services/payroll.service';

const TaxExemptionsList = ({ taxSettingId }) => {
  const [exemptions, setExemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    regime: 'NEW',
    description: ''
  });

  useEffect(() => {
    const fetchExemptions = async () => {
      try {
        setLoading(true);
        const response = await payrollService.getTaxExemptions(taxSettingId);
        const data = response.data || response;
        setExemptions(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching tax exemptions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (taxSettingId) {
      fetchExemptions();
    }
  }, [taxSettingId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const handleSaveExemption = async () => {
    if (!formData.name || formData.amount < 0) {
      alert('Please provide a valid name and amount');
      return;
    }

    try {
      if (isEditing) {
        const response = await payrollService.updateTaxExemption(editingId, {
          ...formData,
          taxSettingId
        });
        setExemptions(exemptions.map(ex => ex.id === editingId ? response.data : ex));
      } else {
        const response = await payrollService.createTaxExemption({
          ...formData,
          taxSettingId
        });
        setExemptions([...exemptions, response.data]);
      }
      resetForm();
    } catch (err) {
      alert('Failed to save exemption: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', amount: 0, regime: 'NEW', description: '' });
    setIsAdding(false);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEditClick = (exemption) => {
    setFormData({
      name: exemption.name,
      amount: exemption.amount,
      regime: exemption.regime || 'NEW',
      description: exemption.description || ''
    });
    setEditingId(exemption.id);
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleDeleteExemption = async (id) => {
    if (confirm('Are you sure you want to delete this tax exemption?')) {
      try {
        await payrollService.deleteTaxExemption(id);
        setExemptions(exemptions.filter(exemption => exemption.id !== id));
      } catch (err) {
        alert('Failed to delete exemption: ' + err.message);
      }
    }
  };

  if (loading && exemptions.length === 0) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="text-left">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Tax Exemptions</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition font-medium"
          >
            <Plus size={18} />
            Add Exemption
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Exemption Form */}
      {isAdding && (
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg mb-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4">
            {isEditing ? 'Edit Tax Exemption' : 'Add New Tax Exemption'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Exemption Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                placeholder="e.g. Standard Deduction"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Regime *
              </label>
              <select
                name="regime"
                value={formData.regime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                required
              >
                <option value="NEW">New Regime</option>
                <option value="OLD">Old Regime</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-100 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                placeholder="Brief details"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveExemption}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {isEditing ? 'Update Exemption' : 'Save Exemption'}
            </button>
          </div>
        </div>
      )}

      {/* Exemptions List */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                Exemption Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                Regime
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {exemptions.length > 0 ? (
              exemptions.map((exemption) => (
                <tr key={exemption.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-left">
                    {exemption.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 text-left font-mono">
                    {payrollService.formatCurrency(exemption.amount)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 text-left">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${exemption.regime === 'NEW'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      }`}>
                      {exemption.regime || 'NEW'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 text-left">
                    {exemption.description || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(exemption)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExemption(exemption.id)}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No tax exemptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {exemptions.length} tax exemptions
      </div>
    </div>
  );
};

export default TaxExemptionsList;
