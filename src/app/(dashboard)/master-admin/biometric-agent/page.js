'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Breadcrumb from '@/components/common/Breadcrumb';
import TablePagination from '@/components/common/TablePagination';
import { biometricAgentService } from '@/services/master-admin/biometricAgent.service';
import { toast } from 'react-hot-toast';
import {
  Upload, Trash2, Star, Search, Loader2, Download,
  CheckCircle2, XCircle, Package, RefreshCw, FileDown, X, Settings
} from 'lucide-react';

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ version: '', releaseNotes: '', setAsLatest: true });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const fileRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select an .exe or .msi file');
    if (!form.version.trim()) return toast.error('Version is required');

    const fd = new FormData();
    fd.append('file', file);
    fd.append('version', form.version.trim());
    fd.append('releaseNotes', form.releaseNotes);
    fd.append('setAsLatest', form.setAsLatest ? 'true' : 'false');

    try {
      setLoading(true);
      setUploadProgress(0);
      await biometricAgentService.uploadRelease(fd, (percent, loaded, total) => {
        setUploadProgress(percent);
        setUploadedBytes(loaded);
        setTotalBytes(total);
      });
      toast.success('Release uploaded successfully');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const formatBytes = (b) => b > 1024 * 1024
    ? `${(b / 1024 / 1024).toFixed(1)} MB`
    : `${(b / 1024).toFixed(0)} KB`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload New Release</h2>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-40">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Version */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Version <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 1.2.0"
              value={form.version}
              onChange={(e) => setForm({ ...form, version: e.target.value })}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-60"
            />
          </div>

          {/* File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Agent File (.exe / .msi) <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => !loading && fileRef.current?.click()}
              className={`border-2 border-dashed rounded-md p-4 text-center transition-colors ${loading ? 'opacity-60 cursor-not-allowed border-gray-200' : 'cursor-pointer hover:border-blue-400 border-gray-300 dark:border-gray-600'}`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Package size={16} className="text-blue-500" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                  {!loading && (
                    <button
                      type="button"
                      onClick={(evt) => {
                        evt.preventDefault();
                        evt.stopPropagation();
                        setFile(null);
                        setUploadProgress(0);
                        setUploadedBytes(0);
                        setTotalBytes(0);
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="ml-1 p-1.5 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                      title="Remove selected file"
                      aria-label="Remove selected file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <Upload size={20} className="mx-auto mb-1 text-gray-400" />
                  Click to select .exe or .msi file
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".exe,.msi"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {/* Upload Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>
                  {uploadProgress < 100
                    ? `Uploading... ${formatBytes(uploadedBytes)} / ${formatBytes(totalBytes)}`
                    : '⚙️ Processing on server...'}
                </span>
                <span className="font-semibold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full transition-all duration-300 ${uploadProgress < 100 ? 'bg-blue-600' : 'bg-green-500 animate-pulse'}`}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              {uploadProgress === 100 && (
                <p className="text-xs text-gray-500 text-center">
                  File uploaded — saving to cloud storage, please wait...
                </p>
              )}
            </div>
          )}

          {/* Release Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Release Notes
            </label>
            <textarea
              rows={3}
              placeholder="What's new in this version..."
              value={form.releaseNotes}
              onChange={(e) => setForm({ ...form, releaseNotes: e.target.value })}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none disabled:opacity-60"
            />
          </div>

          {/* Set as Latest */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.setAsLatest}
              onChange={(e) => setForm({ ...form, setAsLatest: e.target.checked })}
              disabled={loading}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Mark as latest release</span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {loading ? (uploadProgress < 100 ? `Uploading ${uploadProgress}%` : 'Processing...') : 'Upload Release'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Notes Modal ─────────────────────────────────────────────────────────
function EditModal({ release, onClose, onSuccess }) {
  const [releaseNotes, setReleaseNotes] = useState(release.releaseNotes || '');
  const [isActive, setIsActive] = useState(release.isActive);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await biometricAgentService.updateRelease(release.publicId, { releaseNotes, isActive });
      toast.success('Release updated');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Release v{release.version}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Release Notes</label>
            <textarea
              rows={4}
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({ onClose, onSaved }) {
  const [downloadFileName, setDownloadFileName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    biometricAgentService.getSettings()
      .then(s => setDownloadFileName(s.downloadFileName || 'zodeck-bio-agent'))
      .catch(() => setDownloadFileName('zodeck-bio-agent'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!downloadFileName.trim()) return toast.error('Name is required');
    try {
      setSaving(true);
      await biometricAgentService.saveSettings({ downloadFileName: downloadFileName.trim() });
      toast.success('Settings saved');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // Live preview
  const preview = `${downloadFileName.trim().replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'zodeck-bio-agent'}-v1.2.0.exe`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings size={18} /> Agent Settings
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Download File Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={downloadFileName}
                onChange={(e) => setDownloadFileName(e.target.value)}
                placeholder="zodeck-bio-agent"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Only letters, numbers, hyphens and dots. Version and extension are added automatically.
              </p>
            </div>

            {/* Live preview */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md px-4 py-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview</p>
              <p className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400 break-all">
                {preview}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Settings size={14} />}
                Save Settings
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BiometricAgentPage() {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [editRelease, setEditRelease] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [settingLatestId, setSettingLatestId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const fetchReleases = useCallback(async () => {
    try {
      setLoading(true);
      const data = await biometricAgentService.listReleases({
        page: currentPage,
        limit: itemsPerPage,
        search: search || undefined,
      });
      setReleases(data?.releases || []);
      setTotal(data?.pagination?.total || 0);
    } catch {
      toast.error('Failed to load releases');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, search]);

  useEffect(() => {
    const t = setTimeout(fetchReleases, 350);
    return () => clearTimeout(t);
  }, [fetchReleases]);

  const handleSetLatest = async (id) => {
    try {
      setSettingLatestId(id);
      await biometricAgentService.setLatest(id);
      toast.success('Marked as latest release');
      fetchReleases();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setSettingLatestId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this release? This cannot be undone.')) return;
    try {
      setDeletingId(id);
      await biometricAgentService.deleteRelease(id);
      toast.success('Release deleted');
      fetchReleases();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  // Build tracked download URL — routes through backend to increment count
  const getDownloadUrl = (publicId) => {
    const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api')
      .replace(/\/api$/, '');
    return `${backendBase}/api/master-admin/biometric-agent/releases/${publicId}/download`;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Breadcrumb items={[
            { label: 'Master Admin', href: '/master-admin/dashboard' },
            { label: 'Biometric Agent', href: '/master-admin/biometric-agent' },
          ]} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              <Settings size={16} />
              Settings
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Upload size={16} />
              Upload Release
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Releases', value: total, icon: <Package size={20} className="text-blue-500" /> },
            { label: 'Active Releases', value: releases.filter(r => r.isActive).length, icon: <CheckCircle2 size={20} className="text-green-500" /> },
            { label: 'Latest Version', value: releases.find(r => r.isLatest)?.version || '—', icon: <Star size={20} className="text-yellow-500" /> },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-5 py-4 flex items-center gap-4">
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">{s.icon}</div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search version or notes..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500">Loading releases...</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {['Version', 'File', 'Size', 'Downloads', 'Release Notes', 'Status', 'Uploaded By', 'Date', 'Actions'].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {releases.length > 0 ? releases.map((r) => (
                    <tr key={r.publicId} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                      {/* Version */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-white">v{r.version}</span>
                          {r.isLatest && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                              <Star size={10} /> Latest
                            </span>
                          )}
                        </div>
                      </td>
                      {/* File */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[160px] block">{r.fileName}</span>
                      </td>
                      {/* Size */}
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {formatBytes(r.fileSize)}
                      </td>
                      {/* Downloads */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <Download size={13} className="text-blue-400" />
                          {(r.downloadCount ?? 0).toLocaleString()}
                        </span>
                      </td>
                      {/* Notes */}
                      <td className="px-5 py-4 max-w-[200px]">
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{r.releaseNotes || '—'}</p>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        {r.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                            <XCircle size={10} /> Inactive
                          </span>
                        )}
                      </td>
                      {/* Uploaded By */}
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {r.uploadedBy || '—'}
                      </td>
                      {/* Date */}
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(r.createdAt)}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {/* Download */}
                          <a
                            href={getDownloadUrl(r.publicId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Download"
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          >
                            <FileDown size={15} />
                          </a>
                          {/* Set Latest */}
                          {!r.isLatest && (
                            <button
                              onClick={() => handleSetLatest(r.publicId)}
                              disabled={settingLatestId === r.publicId}
                              title="Set as Latest"
                              className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors disabled:opacity-50"
                            >
                              {settingLatestId === r.publicId
                                ? <Loader2 size={15} className="animate-spin" />
                                : <Star size={15} />}
                            </button>
                          )}
                          {/* Edit */}
                          <button
                            onClick={() => setEditRelease(r)}
                            title="Edit"
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          >
                            <RefreshCw size={15} />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(r.publicId)}
                            disabled={deletingId === r.publicId}
                            title="Delete"
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                          >
                            {deletingId === r.publicId
                              ? <Loader2 size={15} className="animate-spin" />
                              : <Trash2 size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-16 text-center">
                        <Package size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No releases found</p>
                        <button
                          onClick={() => setShowUpload(true)}
                          className="mt-3 text-sm text-blue-600 hover:underline"
                        >
                          Upload your first release
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && releases.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}
          />
        )}
      </div>

      {/* Modals */}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={fetchReleases} />}
      {editRelease && <EditModal release={editRelease} onClose={() => setEditRelease(null)} onSuccess={fetchReleases} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} onSaved={fetchReleases} />}
    </div>
  );
}
