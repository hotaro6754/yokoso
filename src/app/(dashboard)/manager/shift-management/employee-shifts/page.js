"use client";
import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Filter, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { employeeShiftService } from '@/services/manager-services/employeeShift.service';
import { managerTeamService } from '@/services/manager-services/team.service';

export default function EmployeeShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    departmentId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch team members and shifts in parallel
        const [teamData, shiftsData] = await Promise.all([
          managerTeamService.getTeamOverview(),
          employeeShiftService.getEmployeeShifts(filters)
        ]);

        setTeamMembers(Array.isArray(teamData) ? teamData : (teamData?.data || []));
        setShifts(Array.isArray(shiftsData) ? shiftsData : (shiftsData?.data || []));
      } catch (error) {
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = !searchTerm ||
      shift.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.shift.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters =
      (!filters.employeeId || shift.employeeId.toString() === filters.employeeId) &&
      (!filters.startDate || shift.date >= filters.startDate) &&
      (!filters.endDate || shift.date <= filters.endDate) &&
      (!filters.departmentId || shift.departmentId === filters.departmentId);

    return matchesSearch && matchesFilters;
  });

  const handleDeleteShift = async (shiftId) => {
    if (window.confirm('Are you sure you want to delete this shift assignment?')) {
      try {
        await employeeShiftService.deleteEmployeeShift(shiftId);
        toast.success('Shift deleted successfully');

        // Refresh shifts
        const updatedShifts = await employeeShiftService.getEmployeeShifts(filters);
        setShifts(Array.isArray(updatedShifts) ? updatedShifts : (updatedShifts?.data || []));
      } catch (error) {
        toast.error('Failed to delete shift');
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      employeeId: '',
      startDate: '',
      endDate: '',
      departmentId: ''
    });
    setSearchTerm('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Shift Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and view employee shift assignments</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => window.location.href = '/manager/shift-management/assign-shift'}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Plus size={16} />
            Assign New Shift
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search shifts..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filters.employeeId}
              onChange={(e) => handleFilterChange('employeeId', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">All Employees</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          <div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No shift assignments found</p>
            <p className="text-sm text-gray-400 dark:text-gray-400">
              {searchTerm && 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredShifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-brand-600">
                            {shift.employeeName?.charAt(0)?.toUpperCase() || 'E'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {shift.employeeName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {shift.employeeCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {shift.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                        {shift.shiftCode} ({shift.timing})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {shift.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${shift.status === 'Scheduled' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 border border-green-200 dark:border-green-800' :
                          shift.status === 'Completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border border-blue-200 dark:border-blue-800' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-200 border border-gray-200 dark:border-gray-800'
                        }`}>
                        {shift.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => window.location.href = `/manager/shift-management/assign-shift/${shift.id}`}
                          className="p-1 text-brand-600 hover:text-brand-800 dark:text-brand-400 transition-colors"
                          title="Edit Shift"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteShift(shift.id)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 transition-colors"
                          title="Delete Shift"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
