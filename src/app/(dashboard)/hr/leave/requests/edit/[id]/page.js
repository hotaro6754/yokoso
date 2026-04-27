// "use client";
// import { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import Breadcrumb from '@/components/common/Breadcrumb';
// import LeaveRequestForm from '../../../components/LeaveRequestForm';

// // Mock data for leave requests (same as your table data)
// const defaultData = [
//   {
//     id: 'LR-001',
//     employeeId: '01',
//     employeeName: 'Willie Torres',
//     leaveType: 'Medical Leave',
//     reason: 'Going to Hospital',
//     days: 2,
//     fromDate: '11 Oct, 2023',
//     toDate: '12 Oct, 2023',
//     status: 'approved',
//     image: '/images/users/user-01.png',
//     startDateBreakdown: 'full_day',
//     endDateBreakdown: 'full_day',
//   },
//   // ... include all your other mock data objects
// ];

// export default function EditLeaveRequest() {
//   const router = useRouter();
//   const params = useParams();
//   const [leaveRequest, setLeaveRequest] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // In a real app, you would fetch the leave request data from an API
//     const requestId = params.id;
//     const request = defaultData.find(item => item.id === requestId);

//     if (request) {
//       setLeaveRequest(request);
//     }

//     setLoading(false);
//   }, [params.id]);

//   const handleSave = (formData) => {
//     // Here you would typically send the updated data to your API
//     console.log('Updating leave request:', formData);

//     // For now, just redirect back to the leave requests page
//     router.push('/hr/leave/requests');
//   };

//   const handleCancel = () => {
//     router.push('/hr/leave/requests');
//   };

//   if (loading) {
//     return (
//       <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-6">
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         </div>
//       </div>
//     );
//   }

// //   if (!leaveRequest) {
// //     return (
// //       <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-6">
// //         <Breadcrumb
// //           pages={[
// //             { name: 'HR', href: '/hr' },
// //             { name: 'Leave', href: '/hr/leave' },
// //             { name: 'Requests', href: '/hr/leave/requests' },
// //             { name: 'Edit Leave Request', href: '#' },
// //           ]}
// //         />

// //         <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
// //           <h3 className="text-lg font-medium text-gray-900 dark:text-white">
// //             Leave Request Not Found
// //           </h3>
// //           <p className="text-gray-500 dark:text-gray-400 mt-2">
// //             The requested leave request could not be found.
// //           </p>
// //           <button
// //             onClick={() => router.push('/hr/leave/requests')}
// //             className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
// //           >
// //             Back to Leave Requests
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

//   return (
//     <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-6">
//       <Breadcrumb
//         pages={[
//           { name: 'HR', href: '/hr' },
//           { name: 'Leave', href: '/hr/leave' },
//           { name: 'Requests', href: '/hr/leave/requests' },
//           { name: 'Edit Leave Request', href: '#' },
//         ]}
//       />

//       <div className="mt-6">
//         <LeaveRequestForm 
//           isEditMode={true}
//           initialData={leaveRequest}
//           onSave={handleSave}
//           onCancel={handleCancel}
//         />
//       </div>
//     </div>
//   );
// }

// src/app/(dashboard)/hr/leave/requests/edit/[id]/page.js
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Breadcrumb from '@/components/common/Breadcrumb';
import LeaveRequestForm from '../../../components/LeaveRequestForm';
import { leaveRequestService } from '@/services/hr-services/leaveRequestService';
import { toast } from 'sonner';

export default function EditLeaveRequest() {
  const router = useRouter();
  const params = useParams();
  const [leaveRequest, setLeaveRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchLeaveRequest = async () => {
      try {
        const response = await leaveRequestService.getLeaveRequestById(params.id);
        setLeaveRequest(response.data);
      } catch (error) {
        console.error('Error fetching leave request:', error);
        toast.error(error.message || 'Failed to fetch leave request');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequest();
  }, [params.id]);

  const handleSave = () => {
    // The form handles the API call and redirect.
    // This callback is called after successful submission.
    // router.push('/hr/leave/requests');
    // router.refresh();
  };

  const handleCancel = () => {
    router.push('/hr/leave/requests');
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!leaveRequest) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <Breadcrumb
          pages={[
            { name: 'HR', href: '/hr' },
            { name: 'Leave', href: '/hr/leave' },
            { name: 'Requests', href: '/hr/leave/requests' },
            { name: 'Edit Leave Request', href: '#' },
          ]}
        />

        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Leave Request Not Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            The requested leave request could not be found.
          </p>
          <button
            onClick={() => router.push('/hr/leave/requests')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Leave Requests
          </button>
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
          { name: 'Requests', href: '/hr/leave/requests' },
          { name: 'Edit Leave Request', href: '#' },
        ]}
      />

      <div className="mt-6">
        <LeaveRequestForm
          isEditMode={true}
          initialData={leaveRequest}
          onSave={handleSave}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}