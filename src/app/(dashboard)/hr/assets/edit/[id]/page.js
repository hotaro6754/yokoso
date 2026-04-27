"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Barcode } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import { assetService } from "../../../../../../services/hr-services/asset.service";

export default function EditAsset() {
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    serialNumber: "",
    model: "",
    manufacturer: "",
    purchaseDate: "",
    purchaseCost: "",

    status: "available",
    condition: "excellent",
    location: "",
    warrantyExpiry: "",
    maintenanceSchedule: "quarterly",
    notes: "",
  });

  // ===============================
  // FETCH ASSET + CATEGORIES
  // ===============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setCategoryLoading(true);

        const [assetRes, categoryRes] = await Promise.all([
          assetService.getAssetById(id),
          assetService.getCategories(),
        ]);

        const asset = assetRes.data;

        setCategories(categoryRes.data?.categories || []);

        setFormData({
          name: asset.name || "",
          categoryId: asset.categoryId || "",
          serialNumber: asset.serialNumber || "",
          model: asset.model || "",
          manufacturer: asset.manufacturer || "",
          purchaseDate: asset.purchaseDate
            ? asset.purchaseDate.split("T")[0]
            : "",
          purchaseCost: asset.purchaseCost || "",
          status: asset.status || "available",
          condition: asset.condition || "excellent",
          location: asset.location || "",
          warrantyExpiry: asset.warrantyExpiry
            ? asset.warrantyExpiry.split("T")[0]
            : "",
          maintenanceSchedule: asset.maintenanceSchedule || "quarterly",
          notes: asset.notes || "",
        });
      } catch (error) {
        console.error("Edit Asset Load Error:", error.message);
        alert("Failed to load asset");
      } finally {
        setCategoryLoading(false);
        setPageLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ===============================
  // HANDLE CHANGE
  // ===============================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ===============================
  // UPDATE ASSET
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        categoryId: Number(formData.categoryId),
        serialNumber: formData.serialNumber,
        model: formData.model || null,
        manufacturer: formData.manufacturer || null,
        purchaseDate: formData.purchaseDate,
        purchaseCost: Number(formData.purchaseCost) || null,
        status: formData.status,
        condition: formData.condition,
        location: formData.location || null,
        warrantyExpiry: formData.warrantyExpiry || null,
        maintenanceSchedule: formData.maintenanceSchedule,
        notes: formData.notes || null,
      };

      await assetService.updateAsset(id, payload);

      alert("Asset updated successfully");
      router.push("/hr/assets");
    } catch (error) {
      console.error("Update Asset Error:", error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOADING UI
  // ===============================
  if (pageLoading) {
    return (
      <div className="p-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse" />
        <div className="h-48 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        rightContent={
          <Link
            href="/hr/assets"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 transition"
          >
            <ArrowLeft size={18} /> Back to Assets
          </Link>
        }
      />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-4 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Edit Asset
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 🔁 SAME FORM AS ADD PAGE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

              {/* Asset Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Asset Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  disabled={categoryLoading}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="">
                    {categoryLoading ? "Loading..." : "Select Category"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-sm font-medium mb-2">Serial Number *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleChange}
                    required
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700"
                  />
                  <button type="button" className="px-3 py-2 border rounded-lg">
                    <Barcode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium mb-2">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>

              {/* Manufacturer */}
              <div>
                <label className="block text-sm font-medium mb-2">Manufacturer</label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Purchase Date *</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>

              {/* Purchase Cost */}
              <div>
                <label className="block text-sm font-medium mb-2">Purchase Cost</label>
                <input
                  type="number"
                  name="purchaseCost"
                  value={formData.purchaseCost}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium mb-2">Condition *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>

              {/* Warranty */}
              <div>
                <label className="block text-sm font-medium mb-2">Warranty Expiry</label>
                <input
                  type="date"
                  name="warrantyExpiry"
                  value={formData.warrantyExpiry}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                />
              </div>

              {/* Maintenance */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Maintenance Schedule
                </label>
                <select
                  name="maintenanceSchedule"
                  value={formData.maintenanceSchedule}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Link
                href="/hr/assets"
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Updating..." : "Update Asset"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
