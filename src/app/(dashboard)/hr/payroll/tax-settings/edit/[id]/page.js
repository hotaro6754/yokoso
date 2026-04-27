// src/app/(dashboard)/hr/payroll/tax-settings/edit/[id]/page.js
"use client";
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import TaxBracketForm from '../../components/TaxBracketForm';
import { payrollService } from '@/services/hr-services/payroll.service';

export default function EditTaxBracketPage() {
  const params = useParams();
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBracket = async () => {
      try {
        setLoading(true);
        // We might need an API to get single bracket, 
        // but for now we can get all and find or use a generic getById if available.
        // Looking at payrollService, there isn't a direct getTaxBracketById.
        // Let's check if we can fetch all and find it.
        const response = await payrollService.getTaxBrackets();
        const found = response.data.find(b => b.id === params.id || b.id === parseInt(params.id));
        if (found) {
          setBracket(found);
        } else {
          setError('Tax bracket not found');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching tax bracket:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchBracket();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !bracket) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-6">
        <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-6 text-center text-red-600 dark:text-red-400">
          <p>{error || 'Tax bracket not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900">
      <Breadcrumb rightContent={null} />

      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        <TaxBracketForm bracket={bracket} isEdit={true} />
      </div>
    </div>
  );
}
