"use client";
import { Upload, FileText, X, Eye, CheckCircle, User, FileCheck, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import Label from '@/components/form/Label';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import employeeService from '@/services/hr-services/employeeService';
import Button from '@/components/ui/button/Button';

export default function EmployeeDocumentsPage() {
  const [uploadedFiles, setUploadedFiles] = useState({
    aadhaar: null,
    pan: null,
    resume: null,
    education: []
  });
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id;
  const basePath = typeof window !== 'undefined' && window.location.pathname.startsWith('/payroll')
    ? '/payroll'
    : typeof window !== 'undefined' && window.location.pathname.startsWith('/it-admin')
      ? '/it-admin'
      : '/hr';

  // Load existing documents on page load
  useEffect(() => {
    if (employeeId) {
      loadExistingDocuments();
    }
  }, [employeeId]);

  const loadExistingDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await employeeService.getEmployeeDocuments(employeeId);
      setExistingDocuments(response.data);

      // Pre-populate uploaded files from existing documents
      const filesState = { aadhaar: null, pan: null, resume: null, education: [] };

      response.data.forEach(doc => {
        if (doc.type === 'AADHAAR') filesState.aadhaar = { ...doc, isExisting: true };
        else if (doc.type === 'PAN') filesState.pan = { ...doc, isExisting: true };
        else if (doc.type === 'RESUME') filesState.resume = { ...doc, isExisting: true };
        else if (doc.type === 'EDUCATION') filesState.education.push({ ...doc, isExisting: true });
      });

      setUploadedFiles(filesState);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load existing documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (field, file, documentType) => {
    if (!employeeId) {
      toast.error('Employee ID is required');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedFiles(prev => ({
        ...prev,
        [field]: field === 'education'
          ? [...prev[field], { file, preview: reader.result, name: file.name, size: file.size, type: file.type, documentType }]
          : { file, preview: reader.result, name: file.name, size: file.size, type: file.type, documentType }
      }));
    };
    reader.readAsDataURL(file);
  };

  const uploadDocument = async (fileData, type) => {
    if (!employeeId) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileData.file);
      formData.append('name', `${type} Document - ${fileData.name}`);
      formData.append('type', type);
      formData.append('description', `Uploaded ${type} document for employee`);

      const response = await employeeService.uploadDocument(employeeId, formData);

      toast.success(`${type} document uploaded successfully!`);
      await loadExistingDocuments(); // Reload documents after upload

      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(`Failed to upload ${type} document: ${error.message}`);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadAll = async () => {
    if (!employeeId) {
      toast.error('Employee ID is required');
      return;
    }

    // Check if there are any new files to upload
    const hasNewFiles =
      (uploadedFiles.aadhaar && !uploadedFiles.aadhaar.isExisting) ||
      (uploadedFiles.pan && !uploadedFiles.pan.isExisting) ||
      (uploadedFiles.resume && !uploadedFiles.resume.isExisting);

    if (!hasNewFiles) {
      toast.info('No new documents to upload');
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = [];

      // Add Aadhaar files
      if (uploadedFiles.aadhaar && !uploadedFiles.aadhaar.isExisting) {
        const formData = new FormData();
        formData.append('aadhaar', uploadedFiles.aadhaar.file);
        formData.append('aadhaarDescription', 'Aadhaar Card - Front and Back');
        uploadPromises.push(employeeService.uploadEmployeeDocuments(employeeId, formData));
      }

      // Add PAN file
      if (uploadedFiles.pan && !uploadedFiles.pan.isExisting) {
        const formData = new FormData();
        formData.append('pan', uploadedFiles.pan.file);
        formData.append('panDescription', 'PAN Card');
        uploadPromises.push(employeeService.uploadEmployeeDocuments(employeeId, formData));
      }

      // Add Resume file
      if (uploadedFiles.resume && !uploadedFiles.resume.isExisting) {
        const formData = new FormData();
        formData.append('resume', uploadedFiles.resume.file);
        formData.append('resumeDescription', 'Professional Resume');
        uploadPromises.push(employeeService.uploadEmployeeDocuments(employeeId, formData));
      }

      await Promise.all(uploadPromises);

      toast.success('All documents uploaded successfully!');

      // Reload existing documents
      await loadExistingDocuments();

      // Clear newly uploaded files (keep existing ones)
      setUploadedFiles(prev => ({
        aadhaar: prev.aadhaar?.isExisting ? prev.aadhaar : null,
        pan: prev.pan?.isExisting ? prev.pan : null,
        resume: prev.resume?.isExisting ? prev.resume : null,
        education: prev.education.filter(edu => edu.isExisting)
      }));

      setTimeout(() => {
        router.push(`${basePath}/employees`);
      }, 800);

    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error(error.message || 'Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (field, index = null) => {
    if (index !== null) {
      // Remove education file by index
      setUploadedFiles(prev => ({
        ...prev,
        education: prev.education.filter((_, i) => i !== index)
      }));
    } else {
      // Remove single file
      setUploadedFiles(prev => ({ ...prev, [field]: null }));
    }
  };

  const downloadDocument = async (documentId, fileName, url) => {
    try {
      // Use the dedicated download route to get a URL with attachment headers
      const response = await employeeService.downloadDocument(employeeId, documentId);
      
      if (response.success && response.data?.url) {
        // Direct download using the signed URL with attachment headers
        const link = document.createElement('a');
        link.href = response.data.url;
        link.setAttribute('download', response.data.fileName || fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }
      
      // Fallback if needed
      toast.error('Could not generate download link');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const deleteDocument = async (documentId, documentType) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await employeeService.deleteDocument(employeeId, documentId);
      toast.success('Document deleted successfully');
      await loadExistingDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const FileUploadField = ({ label, field, accept, description, documentType, multiple = false }) => (
    <div className="space-y-3">
      <Label htmlFor={field}>
        {label}
        <span className="text-red-500 ml-1">*</span>
      </Label>

      {/* Existing Document */}
      {uploadedFiles[field]?.isExisting ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FileText className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-green-900 dark:text-green-100 truncate">
                {uploadedFiles[field].name}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                {uploadedFiles[field].uploadedAt && !isNaN(new Date(uploadedFiles[field].uploadedAt).getTime())
                  ? `Uploaded on ${new Date(uploadedFiles[field].uploadedAt).toLocaleDateString()}`
                  : 'Document uploaded'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {uploadedFiles[field]?.url && (
              <a
                href={uploadedFiles[field].url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                title="View"
              >
                <Eye className="w-4 h-4" />
              </a>
            )}
            <button
              type="button"
              onClick={() => downloadDocument(uploadedFiles[field].id, uploadedFiles[field].name, uploadedFiles[field].url)}
              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => deleteDocument(uploadedFiles[field].id, documentType)}
              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              title="Delete"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : uploadedFiles[field] ? (
        /* Newly selected file */
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate">
                {uploadedFiles[field].name}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {(uploadedFiles[field].size / 1024 / 1024).toFixed(2)} MB - Ready to upload
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeFile(field)}
            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 self-end sm:self-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Upload field */
        <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {description || 'PDF, JPG, PNG up to 10MB'}
          </p>
          <input
            type="file"
            id={field}
            className="hidden"
            accept={accept}
            onChange={(e) => e.target.files[0] && handleFileSelect(field, e.target.files[0], documentType)}
            disabled={isUploading}
            multiple={multiple}
          />
        </label>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasFilesToUpload = uploadedFiles.aadhaar && !uploadedFiles.aadhaar.isExisting ||
    uploadedFiles.pan && !uploadedFiles.pan.isExisting ||
    uploadedFiles.resume && !uploadedFiles.resume.isExisting ||
    uploadedFiles.education.some(edu => !edu.isExisting);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Employee Documents
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Upload and manage required documents for employee #{employeeId}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`${basePath}/employees`)}
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
        </div>
      </div>

      {/* Document Uploads */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Required Documents
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <FileUploadField
            label="Aadhaar Card"
            field="aadhaar"
            accept=".pdf,.jpg,.jpeg,.png"
            description="Front and back sides of Aadhaar card"
            documentType="AADHAAR"
          />

          <FileUploadField
            label="PAN Card"
            field="pan"
            accept=".pdf,.jpg,.jpeg,.png"
            documentType="PAN"
          />

          <FileUploadField
            label="Resume/CV"
            field="resume"
            accept=".pdf,.doc,.docx"
            description="PDF or Word document"
            documentType="RESUME"
          />


        </div>

        {/* Upload Button */}
        {hasFilesToUpload && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleUploadAll}
              disabled={isUploading}
              loading={isUploading}
              className="w-full sm:w-auto"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload All Documents
            </Button>
          </div>
        )}
      </div>

      {/* Compliance Status */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-white mb-4">
          Document Compliance Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['AADHAAR', 'PAN', 'RESUME'].map((type) => (
            <div key={type} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`p-1 rounded-full ${existingDocuments.some(doc => doc.type === type)
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                {existingDocuments.some(doc => doc.type === type) ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <FileCheck className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {type}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {existingDocuments.some(doc => doc.type === type) ? 'Uploaded' : 'Pending'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-gray-700 dark:text-gray-300">Uploading documents...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
