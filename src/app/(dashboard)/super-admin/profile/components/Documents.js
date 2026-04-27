// src/app/(dashboard)/hr/profile/components/Documents.js
"use client";
import { useState } from 'react';
import { Download, Eye, Upload, FileText, X } from 'lucide-react';

export default function Documents({ data, onUpdate }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleDownload = (document) => {
    console.log('Downloading document:', document);
    // In a real app, this would download the document
    alert(`Downloading ${document.name}`);
  };

  const handleView = (document) => {
    console.log('Viewing document:', document);
    // In a real app, this would open the document in a viewer
    alert(`Viewing ${document.name}`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        type: file.type.split('/')[1].toUpperCase(),
        uploadDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleUpload = () => {
    if (uploadedFile) {
      const newDocument = {
        id: Date.now(),
        ...uploadedFile
      };
      onUpdate([...data, newDocument]);
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
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">{uploadedFile.type} • {uploadedFile.uploadDate}</p>
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
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
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
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload Document
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {data.length > 0 ? (
          data.map((document) => (
            <div key={document.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <FileText className="text-gray-500 mr-3" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{document.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{document.type} • {document.uploadDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleView(document)}
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                  title="View document"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleDownload(document)}
                  className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all duration-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
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