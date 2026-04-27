// src/app/(dashboard)/hr/payroll/tax-settings/components/TaxBracketsTable.js
"use client";
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { payrollService } from '@/services/hr-services/payroll.service';

const TaxBracketsTable = ({ taxSettingId }) => {
  const [brackets, setBrackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrackets = async () => {
      try {
        setLoading(true);
        const response = await payrollService.getTaxBrackets({ taxSettingId });
        const data = response.data || response;
        setBrackets(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching tax brackets:', err);
      } finally {
        setLoading(false);
      }
    };

    if (taxSettingId) {
      fetchBrackets();
    }
  }, [taxSettingId]);

  const handleDeleteBracket = async (id) => {
    if (confirm('Are you sure you want to delete this tax bracket?')) {
      try {
        await payrollService.deleteTaxBracket(id);
        setBrackets(brackets.filter(bracket => bracket.id !== id));
      } catch (err) {
        alert('Failed to delete tax bracket: ' + err.message);
      }
    }
  };

  if (loading && brackets.length === 0) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Tax Brackets</h2>
        <Link
          href="/hr/payroll/tax-settings/add"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
        >
          <PlusCircle size={18} /> Add Bracket
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Brackets Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                Min Income
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                Max Income
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                Rate (%)
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
            {brackets.length > 0 ? (
              brackets.map((bracket) => (
                <tr key={bracket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {payrollService.formatCurrency(bracket.minIncome)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {bracket.maxIncome ? payrollService.formatCurrency(bracket.maxIncome) : 'No limit'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600 dark:text-blue-400">
                    {bracket.rate}%
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {bracket.description || '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/hr/payroll/tax-settings/edit/${bracket.id}`}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        title="Edit bracket"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteBracket(bracket.id)}
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
                  No tax brackets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {brackets.length} tax brackets
      </div>
    </div>
  );
};

export default TaxBracketsTable;
