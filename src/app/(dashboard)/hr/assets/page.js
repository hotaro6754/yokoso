// src/app/(dashboard)/hr/assets/page.js
"use client";
import { useState, useEffect, useMemo } from 'react';
import AssetTable from './components/AssetTable';
import AssetStats from './components/AssetStats';
import Breadcrumb from '@/components/common/Breadcrumb';
import { assetService } from '../../../../services/hr-services/asset.service';
import { itDeviceService } from '@/services/it-admin-services/itDevice.service';
import { Download } from 'lucide-react';
import * as XLSX from "xlsx";
import { toast } from "react-hot-toast";

export default function AssetInventory() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    condition: 'all',
    search: ''
  });

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      try {
        const response = await assetService.getAllAssets();
        const rawAssets =
          response?.data?.assets ||
          response?.assets ||
          response?.data ||
          response ||
          [];
        const assetList = Array.isArray(rawAssets) ? rawAssets : [];

        // backend → frontend mapping
        const formattedAssets = assetList.map(asset => ({
          id: asset.id,
          name: asset.name,
          category: asset.category?.name || asset.category,
          serialNumber: asset.serialNumber,
          model: asset.model,
          manufacturer: asset.manufacturer,
          purchaseDate: asset.purchaseDate,
          purchaseCost: asset.purchaseCost,
          currentValue: asset.currentValue,
          status: String(asset.status || 'available').toLowerCase(),
          condition: String(asset.condition || 'good').toLowerCase(),
          location: asset.location,
          warrantyExpiry: asset.warrantyExpiry,
          maintenanceSchedule: asset.maintenanceSchedule,
          notes: asset.notes,
          assignedTo: asset.assignedTo || asset.assignedEmployee,
          createdAt: asset.createdAt,
          updatedAt: asset.updatedAt
        }));
        
        // If HR assets are empty, fallback to IT devices
        let combinedAssets = formattedAssets;
        if (combinedAssets.length === 0) {
          try {
            const deviceRes = await itDeviceService.getDevices({ page: 1, limit: 200 });
            const devices = deviceRes?.data?.devices || [];
            const mappedDevices = devices.map((device) => ({
              id: `it-${device.id}`,
              name: device.deviceName || device.serialNumber || device.deviceType || "Device",
              category: device.deviceType || "Device",
              serialNumber: device.serialNumber || "",
              model: device.model || "",
              manufacturer: device.brand || "",
              purchaseDate: device.purchaseDate,
              purchaseCost: device.purchaseCost,
              currentValue: device.currentValue,
              status: String(device.lifecycleStatus || device.status || "available").toLowerCase(),
              condition: String(device.condition || "good").toLowerCase(),
              location: device.location || "",
              warrantyExpiry: device.warrantyExpiry,
              maintenanceSchedule: device.maintenanceSchedule,
              notes: device.notes,
              assignedTo: device.assignedTo,
              createdAt: device.createdAt,
              updatedAt: device.updatedAt
            }));
            combinedAssets = mappedDevices;
          } catch (err) {
            console.error("Fetch IT devices error:", err?.message || err);
          }
        }

        setAssets(combinedAssets);
      } catch (error) {
        console.error("Fetch assets error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  const stats = useMemo(() => {
    return {
      totalAssets: assets.length,
      byStatus: {
        available: assets.filter(a => a.status === 'available').length,
        assigned: assets.filter(a => a.status === 'assigned').length,
        maintenance: assets.filter(a => a.status === 'maintenance').length,
        retired: assets.filter(a => a.status === 'retired').length
      }
    };
  }, [assets]);

  const filteredAssets = assets.filter(asset => {
    if (filters.status !== 'all' && asset.status !== filters.status) return false;
    if (filters.category !== 'all' && asset.category !== filters.category) return false;
    if (filters.condition !== 'all' && asset.condition !== filters.condition) return false;
    if (filters.search && !asset.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleExportReport = () => {
    try {
      if (!filteredAssets.length) {
        toast.error("No assets to export");
        return;
      }

      const rows = filteredAssets.map((asset) => ({
        "Asset Name": asset.name || "",
        Category: asset.category || "",
        "Serial Number": asset.serialNumber || "",
        Model: asset.model || "",
        Manufacturer: asset.manufacturer || "",
        Status: asset.status || "",
        Condition: asset.condition || "",
        Location: asset.location || "",
        "Purchase Date": asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split("T")[0] : "",
        "Purchase Cost": asset.purchaseCost ?? "",
        "Current Value": asset.currentValue ?? "",
        "Warranty Expiry": asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split("T")[0] : "",
        "Assigned To": asset.assignedTo?.name || asset.assignedTo || ""
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Asset Inventory");
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStamp = new Date().toISOString().split("T")[0];
      link.href = url;
      link.setAttribute("download", `asset-inventory-${dateStamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Asset inventory exported");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-3 sm:p-6">
      <div className="mb-6 flex flex-col gap-4">
        <Breadcrumb
          items={[
            { label: "HR", href: "/hr" },
            { label: "Assets", href: "/hr/assets" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Asset Inventory
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track and manage company assets, assignments, and maintenance
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 rounded-sm border border-brand-600 text-brand-600 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-brand-50 transition-colors"
          >
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      <AssetStats stats={stats} />

      <div className="mt-6">
        <AssetTable
          assets={filteredAssets}
          loading={loading}
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>
    </div>
  );
}
