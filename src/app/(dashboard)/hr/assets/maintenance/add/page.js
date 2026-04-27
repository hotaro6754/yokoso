// src/app/(dashboard)/hr/assets/maintenance/add/page.js
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Calendar, DollarSign, User, AlertCircle } from 'lucide-react';
import Breadcrumb from '@/components/common/Breadcrumb';
import Link from 'next/link';
import { assetService } from '../../../../../../services/hr-services/asset.service';

export default function AddMaintenanceRecord() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingAssets, setFetchingAssets] = useState(true);
  const [assets, setAssets] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    assetId: '',
    maintenanceDate: new Date().toISOString().split('T')[0],
    maintenanceType: 'preventive',
    cost: '',
    technician: '',
    description: '',
    nextMaintenanceDate: '',
    status: 'completed'
  });

  // Fetch assets from API
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setFetchingAssets(true);
        const response = await assetService.getAllAssets();
        
        if (response.success && response.data) {
          setAssets(response.data.assets || response.data || []);
        } else {
          setAssets(response.assets || response || []);
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch assets. Please try again.');
        console.error('Error fetching assets:', err);
      } finally {
        setFetchingAssets(false);
      }
    };

    fetchAssets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.assetId) {
      setError('Please select an asset');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare data for API
      const maintenanceData = {
        assetId: formData.assetId,
        maintenanceDate: formData.maintenanceDate,
        maintenanceType: formData.maintenanceType,
        technician: formData.technician,
        description: formData.description,
        status: formData.status,
        ...(formData.cost && { cost: parseFloat(formData.cost) }),
        ...(formData.nextMaintenanceDate && { nextMaintenanceDate: formData.nextMaintenanceDate })
      };

      const response = await assetService.createMaintenance(maintenanceData);
      
      if (response.success) {
        // Show success message and redirect
        alert('Maintenance record created successfully!');
        router.push('/hr/assets/maintenance');
      } else {
        setError(response.message || 'Failed to create maintenance record');
      }
    } catch (err) {
      setError(err.message || 'Failed to create maintenance record. Please try again.');
      console.error('Error creating maintenance record:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  // Calculate next maintenance date based on type
  const calculateNextMaintenanceDate = (date, type) => {
    if (!date) return '';
    const maintenanceDate = new Date(date);
    const nextDate = new Date(maintenanceDate);

    switch (type) {
      case 'preventive':
        nextDate.setMonth(nextDate.getMonth() + 3); // 3 months for preventive
        break;
      case 'corrective':
        nextDate.setMonth(nextDate.getMonth() + 6); // 6 months for corrective
        break;
      case 'emergency':
        nextDate.setMonth(nextDate.getMonth() + 1); // 1 month for emergency
        break;
      case 'routine':
        nextDate.setMonth(nextDate.getMonth() + 2); // 2 months for routine
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 3);
    }

    return nextDate.toISOString().split('T')[0];
  };

  // Auto-calculate next maintenance date when date or type changes
  useEffect(() => {
    if (formData.maintenanceDate && formData.maintenanceType) {
      const nextDate = calculateNextMaintenanceDate(formData.maintenanceDate, formData.maintenanceType);
      setFormData(prev => ({
        ...prev,
        nextMaintenanceDate: nextDate
      }));
    }
  }, [formData.maintenanceDate, formData.maintenanceType]);

  const selectedAsset = assets.find(asset => asset.id === formData.assetId || asset.publicId === formData.assetId);

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        rightContent={
          <Link
            href="/hr/assets/maintenance"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft size={18} /> Back to Maintenance
          </Link>
        }
      />

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-4 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add Maintenance Record</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:border-red-800">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-red-700 dark:text-red-400">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Asset *
              </label>
              <select
                name="assetId"
                value={formData.assetId}
                onChange={handleChange}
                required
                disabled={fetchingAssets}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  fetchingAssets ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="">{fetchingAssets ? 'Loading assets...' : 'Select Asset'}</option>
                {assets.map(asset => (
                  <option 
                    key={asset.id || asset.publicId} 
                    value={asset.publicId || asset.id}
                  >
                    {asset.name} {asset.serialNumber ? `(${asset.serialNumber})` : ''} {asset.categoryName ? `- ${asset.categoryName}` : ''}
                  </option>
                ))}
              </select>
              {fetchingAssets && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Loading assets...</p>
              )}
            </div>

            {/* Selected Asset Info */}
            {selectedAsset && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Selected Asset Info</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>{' '}
                    <span className="font-medium text-gray-900 dark:text-white">{selectedAsset.name}</span>
                  </div>
                  {selectedAsset.serialNumber && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Serial:</span>{' '}
                      <span className="font-medium text-gray-900 dark:text-white">{selectedAsset.serialNumber}</span>
                    </div>
                  )}
                  {selectedAsset.model && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Model:</span>{' '}
                      <span className="font-medium text-gray-900 dark:text-white">{selectedAsset.model}</span>
                    </div>
                  )}
                  {selectedAsset.condition && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Condition:</span>{' '}
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{selectedAsset.condition}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maintenance Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="maintenanceDate"
                    value={formData.maintenanceDate}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maintenance Type *
                </label>
                <select
                  name="maintenanceType"
                  value={formData.maintenanceType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="preventive">Preventive</option>
                  <option value="corrective">Corrective</option>
                  <option value="emergency">Emergency</option>
                  <option value="routine">Routine</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cost ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Leave empty if no cost involved</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Technician/Service *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="technician"
                    value={formData.technician}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Technician or service company name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Next Maintenance Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="nextMaintenanceDate"
                    value={formData.nextMaintenanceDate}
                    onChange={handleChange}
                    required
                    min={formData.maintenanceDate}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Auto-calculated based on maintenance type
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="completed">Completed</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Describe the maintenance performed or scheduled. Include any issues found and actions taken."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Be specific about the work done, parts replaced, and recommendations
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/hr/assets/maintenance"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || fetchingAssets}
                className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
                  loading || fetchingAssets ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Adding...' : 'Add Record'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}