"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit, Download } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import { assetService } from "@/services/hr-services/asset.service";

export default function AssetCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState("");

  /* =========================
     Fetch Categories
  ========================= */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await assetService.getCategories({
        search: searchTerm || undefined,
        page: 1,
        limit: 100
      });

      setCategories(res.data.categories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* =========================
     Filters
  ========================= */
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* =========================
     Selection
  ========================= */
  const toggleSelectCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id)
        ? prev.filter((catId) => catId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCategories.length === filteredCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(filteredCategories.map((cat) => cat.id));
    }
  };

  /* =========================
     Delete (UI only for now)
  ========================= */
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    }
    assetService.deleteCategory(id);
    fetchCategories();
    
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedCategories.length} categories?`
      )
    ) {
      setCategories((prev) =>
        prev.filter((cat) => !selectedCategories.includes(cat.id))
      );
      setSelectedCategories([]);
    }
  };

  /* =========================
     Loading State
  ========================= */
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
        <Breadcrumb />
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        rightContent={
          <div className="flex gap-2">
            {selectedCategories.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                <Trash2 size={18} /> Delete Selected
              </button>
            )}
            <Link
              href="/hr/assets/categories/add"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 transition shadow-sm hover:shadow-md font-semibold"
            >
              <Plus size={18} /> Add Category
            </Link>
            <button className="inline-flex items-center gap-2 rounded-lg border px-4 py-2">
              <Download size={18} /> Export
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow dark:bg-gray-800">
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-500/10 dark:to-brand-500/5">
              <tr>
                <th className="px-6 py-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedCategories.length === filteredCategories.length &&
                      filteredCategories.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-left">Code</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-left">Depreciation</th>
                <th className="px-6 py-3 text-left">Depreciation Years</th>
                <th className="px-6 py-3 text-left">Assets</th>
                <th className="px-6 py-3 text-left">Created</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => toggleSelectCategory(category.id)}
                    />
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {category.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded text-xs font-mono">
                      {category.code || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4">{category.description || "-"}</td>
                  <td className="px-6 py-4">{category.depreciationRate || 0}%</td>
                  <td className="px-6 py-4">
                    {category.usefulLife || 0} {category.usefulLife === 1 ? "year" : "years"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-400 rounded-full text-xs">
                      {category.assetCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/hr/assets/categories/edit/${category.id}`}
                        className="text-green-600"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No categories found
          </div>
        )}
      </div>
    </div>
  );
}
