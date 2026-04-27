"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { toast } from "react-hot-toast";
import {
  Award,
  Plus,
  Search,
  Edit,
  Trash2,
  Save,
  X,
  Star,
  Play,
  Pause
} from "lucide-react";
import ActionDropdown from "../../../master-admin/components/ActionDropdown";

export default function AchievementBandsPage() {
  const [loading, setLoading] = useState(true);
  const [bands, setBands] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBands();
  }, []);

  const fetchBands = async () => {
    try {
      setLoading(true);

      // Mock data - in real app, this would come from API
      const mockBands = [
        {
          id: 1,
          name: "Outstanding",
          description: "Exceptional performance exceeding all expectations",
          minScore: 4.5,
          maxScore: 5.0,
          color: "#10b981",
          bgColor: "#d1fae5",
          textColor: "#065f46",
          isActive: true,
          implications: "Top performer, eligible for fast-track promotion",
          developmentNeeds: "Leadership development, advanced training",
          recommendations: "Consider for leadership roles, mentorship programs"
        },
        {
          id: 2,
          name: "Exceeds Expectations",
          description: "Performance consistently above expectations",
          minScore: 4.0,
          maxScore: 4.49,
          color: "#3b82f6",
          bgColor: "#dbeafe",
          textColor: "#1e3a8a",
          isActive: true,
          implications: "High performer, ready for increased responsibility",
          developmentNeeds: "Advanced skills training, cross-functional exposure",
          recommendations: "Consider for senior roles, special projects"
        },
        {
          id: 3,
          name: "Meets Expectations",
          description: "Performance meets job requirements consistently",
          minScore: 3.5,
          maxScore: 3.99,
          color: "#6366f1",
          bgColor: "#e0e7ff",
          textColor: "#312e81",
          isActive: true,
          implications: "Solid performer, meeting all requirements",
          developmentNeeds: "Skill enhancement, career planning",
          recommendations: "Continue current role with growth opportunities"
        },
        {
          id: 4,
          name: "Needs Improvement",
          description: "Performance below expectations but improving",
          minScore: 3.0,
          maxScore: 3.49,
          color: "#f59e0b",
          bgColor: "#fef3c7",
          textColor: "#92400e",
          isActive: true,
          implications: "Requires improvement plan and close monitoring",
          developmentNeeds: "Basic skills training, performance coaching",
          recommendations: "Performance improvement plan, regular check-ins"
        },
        {
          id: 5,
          name: "Unsatisfactory",
          description: "Performance significantly below expectations",
          minScore: 0.0,
          maxScore: 2.99,
          color: "#ef4444",
          bgColor: "#fee2e2",
          textColor: "#991b1b",
          isActive: true,
          implications: "Serious performance concerns, action required",
          developmentNeeds: "Intensive training, performance management",
          recommendations: "Formal performance improvement plan, possible role change"
        }
      ];

      setBands(mockBands);
    } catch (error) {
      console.error("Error fetching achievement bands:", error);
      toast.error("Failed to load achievement bands");
      setBands([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (band) => {
    setEditingId(band.id);
    setFormData({
      name: band.name,
      description: band.description,
      minScore: band.minScore,
      maxScore: band.maxScore,
      color: band.color,
      bgColor: band.bgColor,
      textColor: band.textColor,
      isActive: band.isActive,
      implications: band.implications,
      developmentNeeds: band.developmentNeeds,
      recommendations: band.recommendations
    });
  };

  const handleSave = async () => {
    try {
      // Validate score ranges
      if (formData.minScore >= formData.maxScore) {
        toast.error("Minimum score must be less than maximum score");
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingId === 'new') {
        const newBand = {
          id: Date.now(),
          ...formData
        };
        setBands(prev => [...prev, newBand]);
      } else {
        setBands(prev => prev.map(band =>
          band.id === editingId ? { ...band, ...formData } : band
        ));
      }

      setEditingId(null);
      setFormData({});
      toast.success("Achievement band saved successfully");
    } catch (error) {
      toast.error("Failed to save achievement band");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleToggleActive = async (bandId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setBands(prev => prev.map(band =>
        band.id === bandId ? { ...band, isActive: !band.isActive } : band
      ));

      toast.success("Band status updated successfully");
    } catch (error) {
      toast.error("Failed to update band status");
    }
  };

  const handleDelete = async (bandId) => {
    if (!confirm("Are you sure you want to delete this achievement band?")) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setBands(prev => prev.filter(band => band.id !== bandId));
      toast.success("Achievement band deleted successfully");
    } catch (error) {
      toast.error("Failed to delete achievement band");
    }
  };

  const getBandPreview = (color, bgColor, textColor) => {
    return (
      <div
        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <Star size={14} className="mr-1" fill={color} />
        Preview
      </div>
    );
  };

  const openBandPreview = (band) => {
    toast(`${band.name}: ${band.description}`, { icon: "⭐" });
  };

  const filteredBands = bands.filter(band =>
    band.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    band.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        items={[
          { label: "HR", href: "/hr" },
          { label: "Performance", href: "/hr/performance" },
          { label: "Achievement Bands", href: "/hr/performance/achievement-bands" },
        ]}
      />

      <div className="my-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-brand-50 p-3 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Achievement Bands
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure performance achievement bands and ratings
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingId('new');
              setFormData({
                name: "",
                description: "",
                minScore: 0,
                maxScore: 0,
                color: "#6366f1",
                bgColor: "#e0e7ff",
                textColor: "#312e81",
                isActive: true,
                implications: "",
                developmentNeeds: "",
                recommendations: ""
              });
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Band
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search achievement bands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Achievement Bands Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
        {filteredBands.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No achievement bands found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Band Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Score Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBands.map((band) => (
                  <tr key={band.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-6 py-4">
                      {editingId === band.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                          />
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                            rows={2}
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {band.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {band.description}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === band.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={formData.minScore}
                            onChange={(e) => setFormData(prev => ({ ...prev, minScore: parseFloat(e.target.value) }))}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                            step="0.1"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">to</span>
                          <input
                            type="number"
                            value={formData.maxScore}
                            onChange={(e) => setFormData(prev => ({ ...prev, maxScore: parseFloat(e.target.value) }))}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                            step="0.1"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {band.minScore} - {band.maxScore}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === band.id ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-600 dark:text-gray-400">Color:</label>
                            <input
                              type="color"
                              value={formData.color}
                              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                              className="w-16 h-8 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                              type="text"
                              value={formData.color}
                              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                              className="w-24 px-2 py-1 text-xs border border-gray-300 rounded"
                            />
                          </div>
                          {getBandPreview(formData.color, formData.bgColor, formData.textColor)}
                        </div>
                      ) : (
                        getBandPreview(band.color, band.bgColor, band.textColor)
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === band.id ? (
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                            className="rounded border-gray-300"
                          />
                          Active
                        </label>
                      ) : (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${band.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}>
                          {band.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {editingId === band.id ? (
                          <>
                            <button
                              onClick={handleSave}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                            >
                              <Save size={12} />
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
                            >
                              <X size={12} />
                              Cancel
                            </button>
                          </>
                        ) : (
                          <ActionDropdown
                            customActions={[
                              {
                                label: "Preview",
                                icon: Star,
                                onClick: () => openBandPreview(band),
                                iconClassName: "text-brand-600 dark:text-brand-400",
                              },
                              {
                                label: "Edit",
                                icon: Edit,
                                onClick: () => handleEdit(band),
                                iconClassName: "text-brand-600 dark:text-brand-400",
                              },
                              {
                                label: band.isActive ? "Deactivate" : "Activate",
                                icon: band.isActive ? Pause : Play,
                                onClick: () => handleToggleActive(band.id),
                                className: band.isActive ? "text-amber-700 dark:text-amber-300" : "text-green-700 dark:text-green-300",
                                iconClassName: band.isActive ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400",
                                hoverClassName: band.isActive ? "hover:bg-amber-50 dark:hover:bg-amber-900/20" : "hover:bg-green-50 dark:hover:bg-green-900/20",
                              },
                              {
                                label: "Delete",
                                icon: Trash2,
                                onClick: () => handleDelete(band.id),
                                className: "text-red-700 dark:text-red-300",
                                iconClassName: "text-red-600 dark:text-red-400",
                                hoverClassName: "hover:bg-red-50 dark:hover:bg-red-900/20",
                              },
                            ]}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Additional Details for editing */}
      {editingId && (editingId === 'new' || formData.implications) && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Band Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Implications
              </label>
              <textarea
                value={formData.implications}
                onChange={(e) => setFormData(prev => ({ ...prev, implications: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
                placeholder="Performance implications for this band"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Development Needs
              </label>
              <textarea
                value={formData.developmentNeeds}
                onChange={(e) => setFormData(prev => ({ ...prev, developmentNeeds: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
                placeholder="Development needs for employees in this band"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recommendations
              </label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
                placeholder="Recommendations for employees in this band"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
