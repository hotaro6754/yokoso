'use client';

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Breadcrumb from '@/components/common/Breadcrumb';
import {
    Users,
    Search,
    Filter,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Building2,
    CheckCircle2,
    AlertCircle,
    Briefcase,
    User,
    MoreVertical,
    Eye,
    Pencil,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        // Mock data based on provided Prisma schema
        const fetchEmployees = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 800));
                setEmployees([
                    {
                        id: 1,
                        employeeId: 'EMP-001',
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@abccorp.com',
                        phone: '+1-234-567-8900',
                        profileImage: null,
                        designation: { name: 'Senior Developer' },
                        department: { name: 'Engineering' },
                        company: { name: 'ABC Corp' },
                        status: 'ACTIVE',
                        joiningDate: '2023-01-15',
                        location: { name: 'New York' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 2,
                        employeeId: 'EMP-002',
                        firstName: 'Sarah',
                        lastName: 'Smith',
                        email: 'sarah.smith@techsol.com',
                        phone: '+1-234-567-8901',
                        profileImage: null,
                        designation: { name: 'Product Manager' },
                        department: { name: 'Product' },
                        company: { name: 'Tech Solutions Inc' },
                        status: 'ACTIVE',
                        joiningDate: '2023-03-20',
                        location: { name: 'San Francisco' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 3,
                        employeeId: 'EMP-003',
                        firstName: 'Michael',
                        lastName: 'Brown',
                        email: 'm.brown@abccorp.com',
                        phone: '+1-234-567-8902',
                        profileImage: null,
                        designation: { name: 'Frontend Developer' },
                        department: { name: 'Engineering' },
                        company: { name: 'ABC Corp' },
                        status: 'ON_LEAVE',
                        joiningDate: '2023-06-10',
                        location: { name: 'Remote' },
                        employmentType: 'CONTRACT'
                    },
                    {
                        id: 4,
                        employeeId: 'EMP-004',
                        firstName: 'Emily',
                        lastName: 'Davis',
                        email: 'emily.d@globalind.com',
                        phone: '+1-234-567-8903',
                        profileImage: null,
                        designation: { name: 'HR Manager' },
                        department: { name: 'Human Resources' },
                        company: { name: 'Global Industries' },
                        status: 'ACTIVE',
                        joiningDate: '2022-11-01',
                        location: { name: 'Chicago' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 5,
                        employeeId: 'EMP-005',
                        firstName: 'David',
                        lastName: 'Wilson',
                        email: 'david.w@abccorp.com',
                        phone: '+1-234-567-8904',
                        profileImage: null,
                        designation: { name: 'DevOps Engineer' },
                        department: { name: 'Engineering' },
                        company: { name: 'ABC Corp' },
                        status: 'NOTICE_PERIOD',
                        joiningDate: '2022-05-15',
                        location: { name: 'New York' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 6,
                        employeeId: 'EMP-006',
                        firstName: 'Jessica',
                        lastName: 'Taylor',
                        email: 'jessica.t@techsol.com',
                        phone: '+1-234-567-8905',
                        profileImage: null,
                        designation: { name: 'UX Designer' },
                        department: { name: 'Design' },
                        company: { name: 'Tech Solutions Inc' },
                        status: 'ACTIVE',
                        joiningDate: '2023-08-01',
                        location: { name: 'San Francisco' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 7,
                        employeeId: 'EMP-007',
                        firstName: 'Robert',
                        lastName: 'Anderson',
                        email: 'robert.a@globalind.com',
                        phone: '+1-234-567-8906',
                        profileImage: null,
                        designation: { name: 'Sales Executive' },
                        department: { name: 'Sales' },
                        company: { name: 'Global Industries' },
                        status: 'INACTIVE',
                        joiningDate: '2023-02-28',
                        location: { name: 'Chicago' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 8,
                        employeeId: 'EMP-008',
                        firstName: 'Lisa',
                        lastName: 'Martinez',
                        email: 'lisa.m@abccorp.com',
                        phone: '+1-234-567-8907',
                        profileImage: null,
                        designation: { name: 'Project Manager' },
                        department: { name: 'Management' },
                        company: { name: 'ABC Corp' },
                        status: 'ACTIVE',
                        joiningDate: '2022-09-10',
                        location: { name: 'New York' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 9,
                        employeeId: 'EMP-009',
                        firstName: 'James',
                        lastName: 'White',
                        email: 'james.white@digitalvent.com',
                        phone: '+1-234-567-8908',
                        profileImage: null,
                        designation: { name: 'Marketing Director' },
                        department: { name: 'Marketing' },
                        company: { name: 'Digital Ventures' },
                        status: 'ACTIVE',
                        joiningDate: '2022-07-15',
                        location: { name: 'Boston' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 10,
                        employeeId: 'EMP-010',
                        firstName: 'Olivia',
                        lastName: 'Harris',
                        email: 'olivia.h@innovate.com',
                        phone: '+1-234-567-8909',
                        profileImage: null,
                        designation: { name: 'Business Analyst' },
                        department: { name: 'Consulting' },
                        company: { name: 'Innovate LLC' },
                        status: 'ACTIVE',
                        joiningDate: '2023-04-12',
                        location: { name: 'Seattle' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 11,
                        employeeId: 'EMP-011',
                        firstName: 'William',
                        lastName: 'Clark',
                        email: 'william.c@futuresys.com',
                        phone: '+1-234-567-8910',
                        profileImage: null,
                        designation: { name: 'Network Engineer' },
                        department: { name: 'IT Support' },
                        company: { name: 'Future Systems' },
                        status: 'ACTIVE',
                        joiningDate: '2022-12-01',
                        location: { name: 'Miami' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 12,
                        employeeId: 'EMP-012',
                        firstName: 'Sophia',
                        lastName: 'Lewis',
                        email: 'sophia.l@smartsol.com',
                        phone: '+1-234-567-8911',
                        profileImage: null,
                        designation: { name: 'Data Scientist' },
                        department: { name: 'R&D' },
                        company: { name: 'Smart Solutions' },
                        status: 'ACTIVE',
                        joiningDate: '2023-01-20',
                        location: { name: 'Denver' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 13,
                        employeeId: 'EMP-013',
                        firstName: 'Alexander',
                        lastName: 'Lee',
                        email: 'alex.lee@techcorp.com',
                        phone: '+1-234-567-8912',
                        profileImage: null,
                        designation: { name: 'Cloud Architect' },
                        department: { name: 'Engineering' },
                        company: { name: 'Tech Corp' },
                        status: 'ACTIVE',
                        joiningDate: '2022-10-05',
                        location: { name: 'Austin' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 14,
                        employeeId: 'EMP-014',
                        firstName: 'Mia',
                        lastName: 'Walker',
                        email: 'mia.w@datasys.com',
                        phone: '+1-234-567-8913',
                        profileImage: null,
                        designation: { name: 'Data Analyst' },
                        department: { name: 'Analytics' },
                        company: { name: 'Data Systems' },
                        status: 'ACTIVE',
                        joiningDate: '2023-05-18',
                        location: { name: 'Portland' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 15,
                        employeeId: 'EMP-015',
                        firstName: 'Daniel',
                        lastName: 'Hall',
                        email: 'daniel.h@cloudserv.com',
                        phone: '+1-234-567-8914',
                        profileImage: null,
                        designation: { name: 'System Administrator' },
                        department: { name: 'IT Operations' },
                        company: { name: 'Cloud Services' },
                        status: 'ACTIVE',
                        joiningDate: '2022-08-22',
                        location: { name: 'Phoenix' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 16,
                        employeeId: 'EMP-016',
                        firstName: 'Ava',
                        lastName: 'Allen',
                        email: 'ava.a@netsol.com',
                        phone: '+1-234-567-8915',
                        profileImage: null,
                        designation: { name: 'Security Specialist' },
                        department: { name: 'Security' },
                        company: { name: 'Net Solutions' },
                        status: 'ACTIVE',
                        joiningDate: '2023-02-14',
                        location: { name: 'Las Vegas' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 17,
                        employeeId: 'EMP-017',
                        firstName: 'Ethan',
                        lastName: 'Young',
                        email: 'ethan.y@innovlab.com',
                        phone: '+1-234-567-8916',
                        profileImage: null,
                        designation: { name: 'Research Scientist' },
                        department: { name: 'Research' },
                        company: { name: 'Innovation Labs' },
                        status: 'ACTIVE',
                        joiningDate: '2022-11-30',
                        location: { name: 'Atlanta' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 18,
                        employeeId: 'EMP-018',
                        firstName: 'Isabella',
                        lastName: 'King',
                        email: 'isabella.k@abccorp.com',
                        phone: '+1-234-567-8917',
                        profileImage: null,
                        designation: { name: 'QA Engineer' },
                        department: { name: 'Engineering' },
                        company: { name: 'ABC Corp' },
                        status: 'ACTIVE',
                        joiningDate: '2023-03-10',
                        location: { name: 'New York' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 19,
                        employeeId: 'EMP-019',
                        firstName: 'Matthew',
                        lastName: 'Wright',
                        email: 'matthew.w@techsol.com',
                        phone: '+1-234-567-8918',
                        profileImage: null,
                        designation: { name: 'Backend Developer' },
                        department: { name: 'Engineering' },
                        company: { name: 'Tech Solutions Inc' },
                        status: 'ON_LEAVE',
                        joiningDate: '2022-09-25',
                        location: { name: 'San Francisco' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 20,
                        employeeId: 'EMP-020',
                        firstName: 'Amelia',
                        lastName: 'Scott',
                        email: 'amelia.s@globalind.com',
                        phone: '+1-234-567-8919',
                        profileImage: null,
                        designation: { name: 'Operations Manager' },
                        department: { name: 'Operations' },
                        company: { name: 'Global Industries' },
                        status: 'ACTIVE',
                        joiningDate: '2022-06-18',
                        location: { name: 'Chicago' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 21,
                        employeeId: 'EMP-021',
                        firstName: 'Charlotte',
                        lastName: 'Green',
                        email: 'charlotte.g@digitalvent.com',
                        phone: '+1-234-567-8920',
                        profileImage: null,
                        designation: { name: 'Social Media Manager' },
                        department: { name: 'Marketing' },
                        company: { name: 'Digital Ventures' },
                        status: 'ACTIVE',
                        joiningDate: '2023-01-05',
                        location: { name: 'Boston' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 22,
                        employeeId: 'EMP-022',
                        firstName: 'Liam',
                        lastName: 'Baker',
                        email: 'liam.b@innovate.com',
                        phone: '+1-234-567-8921',
                        profileImage: null,
                        designation: { name: 'Consultant' },
                        department: { name: 'Consulting' },
                        company: { name: 'Innovate LLC' },
                        status: 'NOTICE_PERIOD',
                        joiningDate: '2022-10-12',
                        location: { name: 'Seattle' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 23,
                        employeeId: 'EMP-023',
                        firstName: 'Benjamin',
                        lastName: 'Adams',
                        email: 'ben.a@futuresys.com',
                        phone: '+1-234-567-8922',
                        profileImage: null,
                        designation: { name: 'Tech Support Lead' },
                        department: { name: 'IT Support' },
                        company: { name: 'Future Systems' },
                        status: 'ACTIVE',
                        joiningDate: '2022-08-08',
                        location: { name: 'Miami' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 24,
                        employeeId: 'EMP-024',
                        firstName: 'Lucas',
                        lastName: 'Nelson',
                        email: 'lucas.n@smartsol.com',
                        phone: '+1-234-567-8923',
                        profileImage: null,
                        designation: { name: 'AI Engineer' },
                        department: { name: 'Engineering' },
                        company: { name: 'Smart Solutions' },
                        status: 'ACTIVE',
                        joiningDate: '2023-04-01',
                        location: { name: 'Denver' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 25,
                        employeeId: 'EMP-025',
                        firstName: 'Henry',
                        lastName: 'Carter',
                        email: 'henry.c@techcorp.com',
                        phone: '+1-234-567-8924',
                        profileImage: null,
                        designation: { name: 'Cloud Specialist' },
                        department: { name: 'Engineering' },
                        company: { name: 'Tech Corp' },
                        status: 'INACTIVE',
                        joiningDate: '2022-05-30',
                        location: { name: 'Austin' },
                        employmentType: 'PART_TIME'
                    },
                    {
                        id: 26,
                        employeeId: 'EMP-026',
                        firstName: 'Harper',
                        lastName: 'Mitchell',
                        email: 'harper.m@datasys.com',
                        phone: '+1-234-567-8925',
                        profileImage: null,
                        designation: { name: 'BI Analyst' },
                        department: { name: 'Analytics' },
                        company: { name: 'Data Systems' },
                        status: 'ACTIVE',
                        joiningDate: '2023-02-22',
                        location: { name: 'Portland' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 27,
                        employeeId: 'EMP-027',
                        firstName: 'Evelyn',
                        lastName: 'Perez',
                        email: 'evelyn.p@cloudserv.com',
                        phone: '+1-234-567-8926',
                        profileImage: null,
                        designation: { name: 'Database Administrator' },
                        department: { name: 'IT Operations' },
                        company: { name: 'Cloud Services' },
                        status: 'ACTIVE',
                        joiningDate: '2022-12-15',
                        location: { name: 'Phoenix' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 28,
                        employeeId: 'EMP-028',
                        firstName: 'Jack',
                        lastName: 'Roberts',
                        email: 'jack.r@netsol.com',
                        phone: '+1-234-567-8927',
                        profileImage: null,
                        designation: { name: 'Network Architect' },
                        department: { name: 'Engineering' },
                        company: { name: 'Net Solutions' },
                        status: 'ACTIVE',
                        joiningDate: '2023-01-30',
                        location: { name: 'Las Vegas' },
                        employmentType: 'FULL_TIME'
                    },
                    {
                        id: 29,
                        employeeId: 'EMP-029',
                        firstName: 'Ella',
                        lastName: 'Turner',
                        email: 'ella.t@innovlab.com',
                        phone: '+1-234-567-8928',
                        profileImage: null,
                        designation: { name: 'Lab Technician' },
                        department: { name: 'Research' },
                        company: { name: 'Innovation Labs' },
                        status: 'ACTIVE',
                        joiningDate: '2022-11-10',
                        location: { name: 'Atlanta' },
                        employmentType: 'INTERN'
                    },
                    {
                        id: 30,
                        employeeId: 'EMP-030',
                        firstName: 'Sebastian',
                        lastName: 'Phillips',
                        email: 'seb.p@abccorp.com',
                        phone: '+1-234-567-8929',
                        profileImage: null,
                        designation: { name: 'Junior Developer' },
                        department: { name: 'Engineering' },
                        company: { name: 'ABC Corp' },
                        status: 'ACTIVE',
                        joiningDate: '2023-06-01',
                        location: { name: 'New York' },
                        employmentType: 'FULL_TIME'
                    }
                ]);
            } catch (error) {
                console.error("Failed to fetch employees:", error);
                toast.error("Failed to load employees");
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter(employee => {
        const searchString = searchTerm.toLowerCase();
        const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();

        const matchesSearch =
            fullName.includes(searchString) ||
            employee.email.toLowerCase().includes(searchString) ||
            employee.employeeId.toLowerCase().includes(searchString);

        const matchesStatus = !selectedStatus || employee.status === selectedStatus;
        const matchesDepartment = !selectedDepartment || employee.department?.name === selectedDepartment;
        const matchesCompany = !selectedCompany || employee.company?.name === selectedCompany;
        const matchesLocation = !selectedLocation || employee.location?.name === selectedLocation;
        const matchesType = !selectedType || employee.employmentType === selectedType;

        return matchesSearch && matchesStatus && matchesDepartment && matchesCompany && matchesLocation && matchesType;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);

    const clearFilters = () => {
        setSelectedStatus('');
        setSelectedDepartment('');
        setSelectedCompany('');
        setSelectedLocation('');
        setSelectedType('');
        setSearchTerm('');
        setCurrentPage(1);
    };

    const uniqueStatuses = [...new Set(employees.map(e => e.status))];
    const uniqueDepartments = [...new Set(employees.map(e => e.department?.name).filter(Boolean))];
    const uniqueCompanies = [...new Set(employees.map(e => e.company?.name).filter(Boolean))];
    const uniqueLocations = [...new Set(employees.map(e => e.location?.name).filter(Boolean))];
    const uniqueTypes = [...new Set(employees.map(e => e.employmentType).filter(Boolean))];

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'ON_LEAVE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            case 'NOTICE_PERIOD': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            case 'INACTIVE': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
        }
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    // Stats calculation
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'ACTIVE').length;
    const onLeaveEmployees = employees.filter(e => e.status === 'ON_LEAVE').length;
    const departmentsCount = new Set(employees.map(e => e.department?.name)).size;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900">
            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">

                <Breadcrumb
                    items={[
                        { label: 'Master Admin', href: '/master-admin/dashboard' },
                        { label: 'Employees', href: '/master-admin/employees' }
                    ]}
                />

                {/* Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Employees</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalEmployees}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <Users size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Employees</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{activeEmployees}</h3>
                            </div>
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">On Leave</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{onLeaveEmployees}</h3>
                            </div>
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <Calendar size={20} className="text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Departments</p>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{departmentsCount}</h3>
                            </div>
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <Briefcase size={20} className="text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="relative flex-1 w-full sm:max-w-md flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="relative min-w-[200px]">
                            <select
                                value={selectedCompany}
                                onChange={(e) => setSelectedCompany(e.target.value)}
                                className="w-full pl-4 pr-10 py-2 border border-gray-200 dark:border-gray-700 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:text-white"
                            >
                                <option value="">All Companies</option>
                                {uniqueCompanies.map((company, index) => (
                                    <option key={index} value={company}>{company}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <Building2 size={16} />
                            </div>
                        </div>

                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${(selectedStatus || selectedDepartment || selectedLocation || selectedType)
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <Filter size={20} />
                            <span>Filter</span>
                            {(selectedStatus || selectedDepartment || selectedLocation || selectedType) && (
                                <span className="h-2 w-2 bg-primary-500 rounded-full"></span>
                            )}
                            <ChevronsDown size={16} className={`transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showFilterDropdown && (
                            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                                <div className="p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                                        <button
                                            onClick={() => setShowFilterDropdown(false)}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        >
                                            <ChevronsLeft size={16} className="text-gray-500" />
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Status
                                            </label>
                                            <select
                                                value={selectedStatus}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            >
                                                <option value="">All Status</option>
                                                {uniqueStatuses.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Department
                                            </label>
                                            <select
                                                value={selectedDepartment}
                                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            >
                                                <option value="">All Departments</option>
                                                {uniqueDepartments.map(dept => (
                                                    <option key={dept} value={dept}>{dept}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Location
                                            </label>
                                            <select
                                                value={selectedLocation}
                                                onChange={(e) => setSelectedLocation(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            >
                                                <option value="">All Locations</option>
                                                {uniqueLocations.map(loc => (
                                                    <option key={loc} value={loc}>{loc}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Employment Type
                                            </label>
                                            <select
                                                value={selectedType}
                                                onChange={(e) => setSelectedType(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            >
                                                <option value="">All Types</option>
                                                {uniqueTypes.map(type => (
                                                    <option key={type} value={type}>{type?.replace('_', ' ')}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={clearFilters}
                                            className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Clear All
                                        </button>
                                        <button
                                            onClick={() => setShowFilterDropdown(false)}
                                            className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Employees Table */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-primary-50 dark:bg-primary-900/20 border-b border-primary-200 dark:border-primary-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Employee</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Role & Dept</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Company</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Joined Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {currentItems.length > 0 ? (
                                        currentItems.map((employee) => (
                                            <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {employee.profileImage ? (
                                                            <img src={employee.profileImage} alt="" className="h-10 w-10 rounded-full object-cover" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                                                                {getInitials(employee.firstName, employee.lastName)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="font-medium text-gray-900 dark:text-white block">
                                                                {employee.firstName} {employee.lastName}
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {employee.employeeId}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <Mail size={14} />
                                                            {employee.email}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <Phone size={14} />
                                                            {employee.phone}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <span className="block text-sm font-medium text-gray-900 dark:text-white">{employee.designation?.name}</span>
                                                        <span className="block text-xs text-gray-500 dark:text-gray-400">{employee.department?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-900 dark:text-white">{employee.company?.name || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <MapPin size={14} />
                                                        {employee.location?.name || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                                        {employee.employmentType?.replace('_', ' ') || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                                                        {employee.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">{employee.joiningDate}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => toast("View functionality coming soon!")}
                                                            className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="9" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                <div className="flex flex-col items-center justify-center">
                                                    <Users size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                                                    <p className="text-lg font-medium">No employees found</p>
                                                    <p className="text-sm">Try adjusting your search or filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} entries
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                ? 'bg-primary-600 text-white'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
}
