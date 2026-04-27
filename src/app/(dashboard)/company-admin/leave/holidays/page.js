"use client";
import { useState, useEffect } from 'react';
import { PlusCircle, X } from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import HolidaysHeader from './components/HolidaysHeader';
import HolidaysCalendar from './components/HolidaysCalendar';
import HolidaysList from './components/HolidaysList';
import Link from 'next/link';
import { holidayService } from '../../../../../services/hr-services/leave-holiday-calender.service';
import { toast } from 'react-hot-toast';

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [view, setView] = useState('list');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [availableYears, setAvailableYears] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, resolve: null });

  // Fetch holidays and available years on mount
  useEffect(() => {
    fetchHolidays();
    fetchHolidayYears();
  }, [yearFilter, typeFilter]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        year: yearFilter,
        ...(typeFilter !== 'all' && { type: typeFilter }),
        limit: 100 // Get all holidays for the year
      };

      const response = await holidayService.getAllHolidays(params);

      // Extract holidays array from response.data
      if (response.success && response.data) {
        setHolidays(response.data);

        // Update pagination if available
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setHolidays([]);
      }
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast.error(error.message || 'Failed to fetch holidays');
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidayYears = async () => {
    try {
      const response = await holidayService.getHolidayYears();

      // Check if response has data array
      let years = [];
      if (Array.isArray(response)) {
        years = response;
      } else if (response && response.data) {
        years = response.data;
      } else if (response && Array.isArray(response)) {
        years = response;
      }

      // Ensure current year is included
      const currentYear = new Date().getFullYear();
      if (!years.includes(currentYear)) {
        years.push(currentYear);
      }

      setAvailableYears(years.sort((a, b) => b - a));
    } catch (error) {
      console.error('Error fetching holiday years:', error);
      // Set default years
      const currentYear = new Date().getFullYear();
      setAvailableYears([currentYear - 1, currentYear, currentYear + 1]);
    }
  };

  const confirmDelete = (holidayId) =>
    new Promise((resolve) => {
      setDeleteModal({ isOpen: true, id: holidayId, resolve });
    });

  const handleCloseDeleteModal = (result) => {
    if (deleteModal.resolve) {
      deleteModal.resolve(result);
    }
    setDeleteModal({ isOpen: false, id: null, resolve: null });
  };

  const handleDeleteHoliday = async (holidayId) => {
    const confirmed = await confirmDelete(holidayId);
    if (!confirmed) return;

    try {
      await holidayService.deleteHoliday(holidayId);
      setHolidays(prev => prev.filter(holiday => holiday.id !== holidayId));
      toast.success('Holiday deleted successfully');
    } catch (error) {
      console.error('Error deleting holiday:', error);
      toast.error(error.message || 'Failed to delete holiday');
    }
  };

  const filteredHolidays = holidays.filter(holiday => {
    if (!holiday || !holiday.date) return false;

    try {
      const holidayYear = new Date(holiday.date).getFullYear();
      const matchesYear = holidayYear === yearFilter;
      const matchesType = typeFilter === 'all' || holiday.type === typeFilter;

      return matchesYear && matchesType;
    } catch (error) {
      console.error('Error filtering holiday:', holiday, error);
      return false;
    }
  });

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6 [--color-primary:hsl(238,56%,83%)] [--color-primary-hover:hsl(236,94%,94%)] [--color-secondary:hsl(236,94%,94%)]">
      <Breadcrumb
        pages={[
          { name: 'Admin', href: '/company-admin' },
          { name: 'People Operations', href: '/company-admin/timesheet-approvals' },
          { name: 'Holidays', href: '#' },
        ]}
        rightContent={
          <Link
            href="/company-admin/leave/holidays/add"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-[#0b1220] hover:bg-[var(--color-primary-hover)] transition-all shadow-sm hover:shadow-md font-semibold"
          >
            <PlusCircle size={18} /> Add Holiday
          </Link>
        }
      />

      <HolidaysHeader
        view={view}
        onViewChange={setView}
        yearFilter={yearFilter}
        onYearFilterChange={setYearFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        totalHolidays={filteredHolidays.length}
        availableYears={availableYears}
        loading={loading}
      />

      <div className="mt-6 bg-white rounded-lg shadow dark:bg-gray-800 min-h-[400px]">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading holidays...</p>
          </div>
        ) : view === 'calendar' ? (
          <HolidaysCalendar holidays={filteredHolidays} />
        ) : (
          <HolidaysList
            holidays={filteredHolidays}
            onDeleteHoliday={handleDeleteHoliday}
          />
        )}

        {!loading && filteredHolidays.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No holidays found for the selected filters</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Try changing the year or type filter
            </p>
          </div>
        )}
      </div>

      {/* Centered Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
            onClick={() => handleCloseDeleteModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl p-10 border border-gray-100 dark:border-gray-700/50 transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-red-500">
                <X className="w-10 h-10" />
              </div>
              
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
                Are you sure?
              </h3>
              <p className="text-base text-gray-500 dark:text-gray-400 mb-8 max-w-[280px]">
                This action will permanently delete this holiday. It cannot be recovered.
              </p>
              
              <div className="flex w-full gap-4">
                <button
                  onClick={() => handleCloseDeleteModal(false)}
                  className="flex-1 px-6 py-4 text-sm font-bold rounded-2xl text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all active:scale-95"
                >
                  No, Keep it
                </button>
                <button
                  onClick={() => handleCloseDeleteModal(true)}
                  className="flex-1 px-6 py-4 text-sm font-bold rounded-2xl text-white bg-red-600 hover:bg-red-700 shadow-xl shadow-red-500/30 transition-all active:scale-95"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
