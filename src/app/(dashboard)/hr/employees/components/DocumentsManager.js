"use client";
import { Upload, FileText, X, Eye, CheckCircle, FileCheck, Download, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Label from '@/components/form/Label';
import { toast } from 'sonner';
import employeeService from '@/services/hr-services/employeeService';
import Button from '@/components/ui/button/Button';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function DocumentsManager({ employeeId }) {
    const [uploadedFiles, setUploadedFiles] = useState({
        aadhaar: null,
        pan: null,
        resume: null,
        photo: null,
        education: []
    });
    const [existingDocuments, setExistingDocuments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        documentId: null,
        documentType: null
    });

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
            // Ensure we handle the response correctly whether it's an array or object wrapping an array
            const docs = Array.isArray(response.data) ? response.data : (response.data?.documents || []);
            setExistingDocuments(docs);

            // Pre-populate uploaded files from existing documents
            const filesState = { aadhaar: null, pan: null, resume: null, photo: null, education: [] };

            docs.forEach(doc => {
                const docWithExisting = { ...doc, isExisting: true };
                if (doc.type === 'AADHAAR') filesState.aadhaar = docWithExisting;
                else if (doc.type === 'PAN') filesState.pan = docWithExisting;
                else if (doc.type === 'RESUME') filesState.resume = docWithExisting;
                else if (doc.type === 'PHOTO') filesState.photo = docWithExisting;
                else if (doc.type === 'EDUCATION') filesState.education.push(docWithExisting);
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

    const handleUploadAll = async () => {
        if (!employeeId) {
            toast.error('Employee ID is required');
            return;
        }

        // Check if there are any new files to upload
        const hasNewFiles =
            (uploadedFiles.aadhaar && !uploadedFiles.aadhaar.isExisting) ||
            (uploadedFiles.pan && !uploadedFiles.pan.isExisting) ||
            (uploadedFiles.resume && !uploadedFiles.resume.isExisting) ||
            (uploadedFiles.photo && !uploadedFiles.photo.isExisting);

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

            // Employee photo (sets profile image)
            if (uploadedFiles.photo && !uploadedFiles.photo.isExisting) {
                uploadPromises.push(employeeService.updateEmployee(employeeId, { profileImage: uploadedFiles.photo.file }));
            }

            await Promise.all(uploadPromises);

            toast.success('All documents uploaded successfully!');

            // Reload existing documents
            await loadExistingDocuments();

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

    const downloadDocument = async (documentId, fileName) => {
        try {
            const response = await employeeService.downloadDocument(employeeId, documentId);
            const url = response?.data?.url;
            if (!url) {
                toast.error('Could not generate download link');
                return;
            }

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', response?.data?.fileName || fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download document');
        }
    };

    const deleteDocument = (documentId, documentType) => {
        setDeleteConfirmation({
            isOpen: true,
            documentId,
            documentType
        });
    };

    const handleConfirmDelete = async () => {
        const { documentId } = deleteConfirmation;
        if (!documentId) return;

        try {
            await employeeService.deleteDocument(employeeId, documentId);
            toast.success('Document deleted successfully');
            await loadExistingDocuments();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete document');
        } finally {
            setDeleteConfirmation({ isOpen: false, documentId: null, documentType: null });
        }
    };

    const FileUploadField = ({ label, field, accept, description, documentType, multiple = false }) => (
        <div className="space-y-3">
            <Label htmlFor={field}>
                {label}
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
                                Uploaded on {uploadedFiles[field].uploadedAt ? new Date(uploadedFiles[field].uploadedAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                            type="button"
                            onClick={() => downloadDocument(uploadedFiles[field].id, uploadedFiles[field].name)}
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
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    const hasFilesToUpload = uploadedFiles.aadhaar && !uploadedFiles.aadhaar.isExisting ||
        uploadedFiles.pan && !uploadedFiles.pan.isExisting ||
        uploadedFiles.resume && !uploadedFiles.resume.isExisting ||
        uploadedFiles.photo && !uploadedFiles.photo.isExisting;

    return (
        <div className="space-y-8">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 dark:border-gray-700 dark:bg-gray-900/20">
                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-lg bg-primary-100/70 p-2 dark:bg-primary-500/20">
                        <FileText size={18} className="text-primary-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Employee Documents</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Upload and manage verification documents</p>
                    </div>
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

                    <FileUploadField
                        label="Employee Photo (Profile)"
                        field="photo"
                        accept=".jpg,.jpeg,.png"
                        description="JPG/PNG up to 10MB (updates employee profile photo)"
                        documentType="PHOTO"
                    />
                </div>

                {hasFilesToUpload && (
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            onClick={handleUploadAll}
                            disabled={isUploading}
                            loading={isUploading}
                            className="w-full sm:w-auto mt-6"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload All Documents
                        </Button>
                    </div>
                )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 dark:border-gray-700 dark:bg-gray-900/20">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                    Compliance Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['AADHAAR', 'PAN', 'RESUME', 'PHOTO'].map((type) => (
                        <div key={type} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
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

            {isUploading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
                        <div className="flex items-center gap-3">
                            <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                            <p className="text-gray-700 dark:text-gray-300">Uploading documents...</p>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteConfirmation.isOpen}
                title="Delete Document"
                description="Are you sure you want to delete this document? This action cannot be undone."
                confirmText="Yes, Delete"
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteConfirmation({ isOpen: false, documentId: null, documentType: null })}
                confirmButtonClassName="bg-red-600 hover:bg-red-700"
            />
        </div>
    );
}
