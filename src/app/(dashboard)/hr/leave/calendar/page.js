"use client";
import { useState, useEffect, useMemo } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import LeaveCalendarHeader from './components/LeaveCalendarHeader';
import FullPageCalendar from './components/FullPageCalendar';
import CalendarFilters from './components/CalendarFilters';
import LeaveDetailsModal from './components/LeaveDetailsModal';
import QuickStats from './components/QuickStats';
import { leaveCalendarService } from '../../../../../services/hr-services/leave-calender.service';
import { toast } from 'react-hot-toast';

export default function LeaveCalendar() {
  const [leaves, setLeaves] = useState([]);
  const [filters, setFilters] = useState({
    view: 'month',
    department: 'all',
    status: 'all',
    leaveType: 'all',
    employee: 'all'
  });
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    leaveTypes: [],
    statuses: ['approved', 'pending', 'rejected']
  });
  const [calendarData, setCalendarData] = useState(null);

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [currentDate, filters.department, filters.status, filters.leaveType]);

  // Fetch filter options
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      if (filters.view === 'month') {
        // Fetch calendar view data
        const calendarResponse = await leaveCalendarService.getCalendarView({
          month,
          year,
          department: filters.department === 'all' ? undefined : filters.department,
          status: filters.status === 'all' ? undefined : filters.status,
          leaveType: filters.leaveType === 'all' ? undefined : filters.leaveType
        });
        setCalendarData(calendarResponse.data);
      }

      // Fetch all leaves for stats and list
      const leavesResponse = await leaveCalendarService.getAllLeaves({
        month,
        year,
        department: filters.department === 'all' ? undefined : filters.department,
        status: filters.status === 'all' ? undefined : filters.status,
        leaveType: filters.leaveType === 'all' ? undefined : filters.leaveType,
        limit: 100
      });
      setLeaves(leavesResponse.data.leaves || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(error.message || 'Failed to fetch calendar data');
      setLeaves([]);
      setCalendarData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await leaveCalendarService.getFilterOptions();
      setFilterOptions(response.data || {
        departments: [],
        leaveTypes: [],
        statuses: ['approved', 'pending', 'rejected']
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleLeaveClick = (leave) => {
    setSelectedLeave(leave);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLeave(null);
  };

  const handleStatusUpdate = async (leaveId, newStatus) => {
    try {
      await leaveCalendarService.updateLeaveStatus(leaveId, {
        status: newStatus,
        ...(newStatus === 'rejected' && { rejectionReason: 'Rejected by manager' })
      });

      toast.success(`Leave ${newStatus} successfully`);

      // Refresh data
      fetchData();

      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating leave status:', error);
      toast.error(error.message || 'Failed to update leave status');
    }
  };

  const filteredLeaves = useMemo(() => {
    let result = leaves;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(leave =>
        leave.employeeName.toLowerCase().includes(searchLower) ||
        leave.department.toLowerCase().includes(searchLower) ||
        leave.leaveType.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [leaves, searchTerm]);

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        pages={[
          { name: 'HR', href: '/hr' },
          { name: 'Leave', href: '/hr/leave' },
          { name: 'Calendar', href: '#' },
        ]}
      />

      <div className="mt-6">
        <LeaveCalendarHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          view={filters.view}
          onViewChange={(view) => setFilters({ ...filters, view })}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>

      {loading ? (
        <div className="animate-pulse">
          <QuickStats leaves={[]} />
          <div className="mt-6 bg-white rounded-sm shadow dark:bg-gray-800 h-64"></div>
        </div>
      ) : (
        <>
          <QuickStats leaves={filteredLeaves} />

          <div className="mt-6">
            <CalendarFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              departments={filterOptions.departments}
              leaveTypes={filterOptions.leaveTypes}
              statuses={filterOptions.statuses}
            />
          </div>

          <div className="mt-6 bg-white rounded-sm shadow dark:bg-gray-800">
            <FullPageCalendar
              leaves={filteredLeaves}
              calendarData={calendarData}
              currentDate={currentDate}
              view={filters.view}
              onLeaveClick={handleLeaveClick}
              onDateChange={setCurrentDate}
              loading={loading}
            />
          </div>
        </>
      )}

      {isModalOpen && selectedLeave && (
        <LeaveDetailsModal
          leave={selectedLeave}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}