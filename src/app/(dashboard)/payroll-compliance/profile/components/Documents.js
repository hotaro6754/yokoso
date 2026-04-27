"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Documents({ data, onUpdate }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleDownload = (document) => {
    toast.success(`Downloading ${document.name}...`);
  };

  const handleView = (document) => {
    toast.info(`Viewing ${document.name}...`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile({
        name: file.name,
        type: file.type.split('/')[1].toUpperCase(),
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'Pending'
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
      toast.success('Document uploaded successfully');
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-foreground">Documents</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsUploading(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-md"
        >
          <Upload size={16} />
          Upload Document
        </motion.button>
      </div>

      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-4 sm:p-6 rounded-xl border border-border mb-6 shadow-md"
        >
          <h3 className="text-md font-semibold text-foreground mb-4">Upload New Document</h3>

          {uploadedFile ? (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border mb-4"
            >
              <div className="flex items-center">
                <FileText className="text-primary mr-3" size={20} />
                <div>
                  <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{uploadedFile.type} • {uploadedFile.uploadDate}</p>
                </div>
              </div>
              <button
                onClick={removeUploadedFile}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </motion.div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-4">
              <input
                type="file"
                id="document-upload"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="document-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                <Upload size={16} />
                Select File
              </label>
              <p className="text-sm text-muted-foreground mt-2">PDF, DOC, DOCX up to 10MB</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsUploading(false);
                setUploadedFile(null);
              }}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpload}
              disabled={!uploadedFile}
              className="px-4 py-2 text-sm bg-success text-success-foreground rounded-lg hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              Upload Document
            </motion.button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {data.length > 0 ? (
          data.map((document, index) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-card rounded-xl border border-border shadow-sm"
            >
              <div className="flex items-center">
                <FileText className="text-primary mr-3" size={20} />
                <div>
                  <p className="text-sm font-medium text-foreground">{document.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{document.type} • {document.uploadDate}</p>
                    {document.status === 'Verified' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success/20 text-success text-xs rounded-full">
                        <CheckCircle2 size={12} />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleView(document)}
                  className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  title="View document"
                >
                  <Eye size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDownload(document)}
                  className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
                  title="Download document"
                >
                  <Download size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText className="mx-auto text-muted-foreground mb-3" size={40} />
            <p className="text-muted-foreground">No documents uploaded yet</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
