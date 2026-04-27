// src/app/(dashboard)/hr/payroll/tax-settings/add/page.js
"use client";
import Breadcrumb from '@/components/common/Breadcrumb';
import TaxBracketForm from '../components/TaxBracketForm';

export default function AddTaxBracketPage() {
  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900">
      {/* Breadcrumb */}
      <Breadcrumb rightContent={null} />
      
      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        <TaxBracketForm />
      </div>
    </div>
  );
}