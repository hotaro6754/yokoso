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
        <h2 className="text-lg font-semibold text-gray-800 dark:text-[#E0E2FE]">Documents</h2>
        <button
          onClick={() => setIsUploading(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition shadow-sm hover:shadow-md font-semibold dark:bg-[#E0E2FE] dark:text-[#0B0F19] dark:hover:bg-[#BBBDEC]"
        >
          <Upload size={16} />
          Upload Document
        </button>
      </div>

      {isUploading ? (
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 sm:p-6 rounded-lg mb-6">
          <h3 className="text-md font-medium text-gray-800 dark:text-[#E0E2FE] mb-4">Upload New Document</h3>

          {uploadedFile ? (
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
              <div className="flex items-center">
                <FileText className="text-gray-500 dark:text-[#BBBDEC] mr-3" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-[#E0E2FE]">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-[#BBBDEC]">{uploadedFile.type} • {uploadedFile.uploadDate}</p>
                </div>
              </div>
              <button
                onClick={removeUploadedFile}
                className="text-gray-500 hover:text-gray-700 dark:text-[#BBBDEC] dark:hover:text-[#E0E2FE]"
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
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-[#E0E2FE] rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <Upload size={16} />
                Select File
              </label>
              <p className="text-sm text-gray-500 dark:text-[#BBBDEC] mt-2">PDF, DOC, DOCX up to 10MB</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsUploading(false);
                setUploadedFile(null);
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-[#BBBDEC] dark:hover:text-[#E0E2FE]"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!uploadedFile}
              className="px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm hover:shadow-md font-semibold dark:bg-[#E0E2FE] dark:text-[#0B0F19] dark:hover:bg-[#BBBDEC]"
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
                <FileText className="text-gray-500 dark:text-[#BBBDEC] mr-3" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-[#E0E2FE]">{document.name}</p>
                  <p className="text-xs text-gray-500 dark:text-[#BBBDEC]">{document.type} • {document.uploadDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleView(document)}
                  className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-all duration-200 dark:bg-[#E0E2FE]/10 dark:text-[#E0E2FE] dark:hover:bg-[#E0E2FE]/20"
                  title="View document"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleDownload(document)}
                  className="p-2 rounded-lg bg-brand-50 text-brand-600 hover:bg-brand-100 transition-all duration-200 dark:bg-[#E0E2FE]/10 dark:text-[#E0E2FE] dark:hover:bg-[#E0E2FE]/20"
                  title="Download document"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <FileText className="mx-auto text-gray-400 dark:text-[#BBBDEC] mb-3" size={40} />
            <p className="text-gray-500 dark:text-[#BBBDEC]">No documents uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
