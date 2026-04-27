// src/app/(dashboard)/hr/assets/maintenance/view/[id]/page.js
"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, User, Clock, FileText, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import { assetService } from '../../../../../../../services/hr-services/asset.service';
import { format } from 'date-fns';

export default function ViewMaintenanceRecord() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [record, setRecord] = useState(null);

  const statusConfig = {
    completed: {
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      text: 'Completed'
    },
    scheduled: {
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'Scheduled'
    },
    cancelled: {
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      text: 'Cancelled'
    },
    in_progress: {
      icon: RefreshCw,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'In Progress'
    }
  };

  const typeConfig = {
    preventive: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    corrective: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    emergency: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    routine: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
  };

  useEffect(() => {
    const fetchMaintenanceRecord = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await assetService.getMaintenanceById(id);
        
        if (response.success && response.data) {
          setRecord(response.data);
        } else {
          setError(response.message || 'Failed to fetch maintenance record');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch maintenance record');
        console.error('Error fetching maintenance record:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMaintenanceRecord();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <Breadcrumb />
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        rightContent={
          <div className="flex gap-2">
            <Link
              href="/hr/assets/maintenance"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition"
            >
              <ArrowLeft size={18} /> Back to Maintenance
            </Link>
          </div>
        }
      />

      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {record ? (
          <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Maintenance Record Details
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Record ID: <span className="font-mono">{record.id}</span>
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Link
                  href={`/hr/assets/maintenance/edit/${record.id}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Edit Record
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Information</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Asset Name
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {record.assetName || record.asset?.name || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Serial Number
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {record.assetSerialNumber || record.asset?.serialNumber || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Asset Category
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {record.assetCategory || record.asset?.category || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Maintenance Details</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Maintenance Date
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {formatDate(record.maintenanceDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Next Maintenance Date
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {formatDate(record.nextMaintenanceDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Maintenance Type
                      </label>
                      <p className="mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeConfig[record.maintenanceType] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                          {record.maintenanceType?.charAt(0).toUpperCase() + record.maintenanceType?.slice(1)}
                        </span>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Cost
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {record.cost ? `$${parseFloat(record.cost).toFixed(2)}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Information</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Technician/Service Provider
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-white">
                          {record.technician || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status</h2>
                  <div className="space-y-3">
                    <div>
                      {record.status && statusConfig[record.status] ? (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = statusConfig[record.status].icon;
                            return <Icon className={`w-5 h-5 ${statusConfig[record.status].color}`} />;
                          })()}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[record.status].bgColor} ${statusConfig[record.status].color}`}>
                            {statusConfig[record.status].text}
                          </span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {record.status || 'Unknown'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Description
                  </div>
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {record.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>Created: {formatDate(record.createdAt)}</p>
                  <p>Last Updated: {formatDate(record.updatedAt)}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/hr/assets/maintenance/edit/${record.id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit Record
                  </button>
                  <button
                    onClick={() => router.push('/hr/assets/maintenance')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Back to List
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Maintenance record not found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The maintenance record you're looking for doesn't exist or has been deleted.
            </p>
            <Link
              href="/hr/assets/maintenance"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
            >
              <ArrowLeft size={18} /> Back to Maintenance
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}