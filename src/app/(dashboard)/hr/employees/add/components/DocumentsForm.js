// src\app\(dashboard)\hr\employees\add\components\DocumentsForm.js
"use client";
import { Upload, FileText, X, Eye, CheckCircle, User, FileCheck } from 'lucide-react';
import { useState } from 'react';
import Label from '@/components/form/Label';
import { toast } from 'sonner';

export default function DocumentsForm({ formData, errors, onChange, employeeId }) {
  const [uploadedFiles, setUploadedFiles] = useState({
    aadhaar: null,
    pan: null,
    resume: null,
    education: []
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (field, file, documentType) => {
    if (!employeeId) {
      toast.error('Please create the employee first before uploading documents');
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
        [field]: {
          file,
          preview: reader.result,
          name: file.name,
          size: file.size,
          type: file.type,
          documentType
        }
      }));
    };
    reader.readAsDataURL(file);

    // Upload the file immediately
    await uploadDocument(file, documentType);
  };

  const uploadDocument = async (file, type) => {
    if (!employeeId) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', `${type} Document`);
      formData.append('type', type);
      formData.append('description', `Uploaded ${type} document for employee`);

      // This would call your employeeService.uploadDocument method
      // For now, we'll simulate the upload
      console.log('Uploading document:', { type, fileName: file.name });

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`${type} document uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error(`Failed to upload ${type} document`);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (field) => {
    setUploadedFiles(prev => ({
      ...prev,
      [field]: null
    }));
    // Note: In a real app, you might want to call an API to delete the document
  };

  const handleEducationUpload = (files) => {
    if (!employeeId) {
      toast.error('Please create the employee first before uploading documents');
      return;
    }

    const newFiles = Array.from(files).slice(0, 5 - uploadedFiles.education.length); // Max 5 files
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const educationFile = {
          file,
          preview: reader.result,
          name: file.name,
          size: file.size,
          type: file.type,
          documentType: 'EDUCATION'
        };

        setUploadedFiles(prev => ({
          ...prev,
          education: [...prev.education, educationFile]
        }));

        uploadDocument(file, 'EDUCATION');
      };
      reader.readAsDataURL(file);
    });
  };

  const removeEducationFile = (index) => {
    const updatedFiles = uploadedFiles.education.filter((_, i) => i !== index);
    setUploadedFiles(prev => ({
      ...prev,
      education: updatedFiles
    }));
  };

  const FileUploadField = ({ label, field, accept, description, documentType }) => (
    <div className="space-y-3">
      <Label htmlFor={field}>
        {label}
      </Label>

      {uploadedFiles[field] ? (
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                {uploadedFiles[field].name}
              </p>
              <p className="text-xs text-green-700 dark:text-green-300">
                {(uploadedFiles[field].size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.open(uploadedFiles[field].preview, '_blank')}
              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => removeFile(field)}
              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
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
            onChange={(e) => e.target.files[0] && handleFileUpload(field, e.target.files[0], documentType)}
            disabled={!employeeId || isUploading}
          />
        </label>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Documents & Verification
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Upload required documents for employee verification
            </p>
          </div>
        </div>
      </div>

      {!employeeId && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                Employee must be created first
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Documents can be uploaded after the employee profile is created. Click "Create Employee" to proceed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Document Uploads */}
      <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-6">
          <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Required Documents
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Aadhaar Card */}
          <FileUploadField
            label="Aadhaar Card"
            field="aadhaar"
            accept=".pdf,.jpg,.jpeg,.png"
            description="Front or back side of Aadhaar card"
            documentType="AADHAAR"
          />

          {/* PAN Card */}
          <FileUploadField
            label="PAN Card"
            field="pan"
            accept=".pdf,.jpg,.jpeg,.png"
            documentType="PAN"
          />

          {/* Resume/CV */}
          <FileUploadField
            label="Resume/CV"
            field="resume"
            accept=".pdf,.doc,.docx"
            description="PDF or Word document"
            documentType="RESUME"
          />

          
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-orange-600 rounded-md flex-shrink-0 mt-0.5">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
              Document Upload Guidelines
            </p>
            <ul className="text-xs text-orange-700 dark:text-orange-300 mt-1 space-y-1">
              <li>• Documents are uploaded after employee creation</li>
              <li>• Maximum file size: 10MB per document</li>
              <li>• Accepted formats: PDF, JPG, JPEG, PNG, DOC, DOCX</li>
              <li>• Ensure documents are clear and readable</li>
              <li>• Documents are automatically saved when uploaded</li>
            </ul>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-gray-700 dark:text-gray-300">Uploading document...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}