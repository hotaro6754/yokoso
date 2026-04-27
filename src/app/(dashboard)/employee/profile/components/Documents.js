"use client";
import { useState } from 'react';
import { Download, Upload, FileText, X } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function Documents({ data, onUpdate }) {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const documents = Array.isArray(data) ? data : [];

    const handleDownload = async (doc) => {
        if (!doc?.id) return;
        const response = await apiClient.get(`/documents/download/${doc.id}`, {
            responseType: 'blob'
        });
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.name || `document-${doc.id}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFile(file);
        }
    };

    const handleUpload = async () => {
        if (uploadedFile) {
            await onUpdate(uploadedFile);
            setUploadedFile(null);
            setIsUploading(false);
        }
    };

    const removeUploadedFile = () => {
        setUploadedFile(null);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Documents</h2>
                <button
                    onClick={() => setIsUploading(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                    <Upload size={16} />
                    Upload Document
                </button>
            </div>

            {isUploading ? (
                <div className="bg-gray-50 dark:bg-gray-700/30 p-4 sm:p-6 rounded-lg mb-6">
                    <h3 className="text-md font-medium text-gray-800 dark:text-white mb-4">Upload New Document</h3>

                    {uploadedFile ? (
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                            <div className="flex items-center">
                                <FileText className="text-gray-500 mr-3" size={20} />
                                <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white">{uploadedFile.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {(uploadedFile.type || '').split('/')[1]?.toUpperCase() || 'FILE'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={removeUploadedFile}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center mb-4">
                            <input
                                type="file"
                                id="document-upload"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <label
                                htmlFor="document-upload"
                                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-300 dark:hover:bg-primary-500/20"
                            >
                                <Upload size={16} />
                                Select File
                            </label>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">PDF, DOC, DOCX up to 10MB</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setIsUploading(false);
                                setUploadedFile(null);
                            }}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!uploadedFile}
                            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Upload Document
                        </button>
                    </div>
                </div>
            ) : null}

            <div className="space-y-4">
                {documents.length > 0 ? (
                    documents.map((document) => (
                        <div key={document.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center">
                                <FileText className="text-gray-500 mr-3" size={20} />
                                <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-white">{document.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {document.type} • {document.uploadDate || '-'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDownload(document)}
                                    className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all duration-200 dark:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-500/20"
                                    title="Download document"
                                >
                                    <Download size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <FileText className="mx-auto text-gray-400 mb-3" size={40} />
                        <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
