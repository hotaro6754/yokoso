"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import HolidayForm from '../../components/HolidayForm';
import { holidayService } from '../../../../../../../services/hr-services/leave-holiday-calender.service';
import { toast } from 'react-hot-toast';

export default function EditHolidayPage() {
  const params = useParams();
  const router = useRouter();
  const [holiday, setHoliday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchHolidayData();
  }, [params.id]);

  const fetchHolidayData = async () => {
    setLoading(true);
    try {
      const response = await holidayService.getHolidayById(params.id);
      setHoliday(response.data);
    } catch (error) {
      console.error('Error fetching holiday:', error);
      toast.error(error.message || 'Failed to fetch holiday');
      router.push('/hr/leave/holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await holidayService.updateHoliday(params.id, formData);
      toast.success('Holiday updated successfully');
      router.push('/hr/leave/holidays');
      router.refresh();
    } catch (error) {
      console.error('Error updating holiday:', error);
      toast.error(error.message || 'Failed to update holiday');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-6">
        <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading holiday...</p>
        </div>
      </div>
    );
  }

  if (!holiday) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-6">
        <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">Holiday not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        pages={[
          { name: 'HR', href: '/hr' },
          { name: 'Leave', href: '/hr/leave' },
          { name: 'Holidays', href: '/hr/leave/holidays' },
          { name: 'Edit Holiday', href: '#' },
        ]}
        rightContent={null}
      />

      <div className="bg-white rounded-lg shadow dark:bg-gray-800 mt-6">
        <HolidayForm 
          holiday={holiday}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isEdit={true}
        />
      </div>
    </div>
  );
}