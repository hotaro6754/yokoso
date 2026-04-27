"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import HolidayForm from '../components/HolidayForm';
import { holidayService } from '../../../../../../services/hr-services/leave-holiday-calender.service';
import { toast } from 'react-hot-toast';

export default function AddHolidayPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await holidayService.createHoliday(formData);
      toast.success('Holiday created successfully');
      router.push('/hr/leave/holidays');
      router.refresh();
    } catch (error) {
      console.error('Error creating holiday:', error);
      toast.error(error.message || 'Failed to create holiday');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        pages={[
          { name: 'HR', href: '/hr' },
          { name: 'Leave', href: '/hr/leave' },
          { name: 'Holidays', href: '/hr/leave/holidays' },
          { name: 'Add Holiday', href: '#' },
        ]}
        rightContent={null}
      />

      <div className="bg-white rounded-lg shadow dark:bg-gray-800 mt-6">
        <HolidayForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEdit={false}
        />
      </div>
    </div>
  );
}