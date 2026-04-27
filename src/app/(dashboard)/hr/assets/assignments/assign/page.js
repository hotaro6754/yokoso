"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Calendar, User, Package } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";

import { assetService } from "../../../../../../services/hr-services/asset.service";
import { employeeService } from "../../../../../../services/hr-services/employeeService";

export default function AssignAsset() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    assetId: "",
    employeeId: "",
    assignedDate: new Date().toISOString().split("T")[0],
    expectedReturnDate: "",
    conditionAssigned: "new",
    notes: "",
  });

  /* ===============================
     Fetch Assets & Employees
  =============================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available assets
        const assetRes = await assetService.getAllAssets({
          status: "available",
        });
        setAssets(assetRes.data?.assets || []);

        // Fetch employees
        const empRes = await employeeService.getAllEmployees(
          {
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
          }
        );
        setEmployees(empRes.data || []);
      } catch (error) {
        alert(error.message);
      } finally {
        setAssetsLoading(false);
        setEmployeesLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ===============================
     Auto calculate return date (+1 year)
  =============================== */
  useEffect(() => {
    if (!formData.assignedDate) return;

    const assigned = new Date(formData.assignedDate);
    const returnDate = new Date(assigned);
    returnDate.setFullYear(returnDate.getFullYear() + 1);

    setFormData((prev) => ({
      ...prev,
      expectedReturnDate: returnDate.toISOString().split("T")[0],
    }));
  }, [formData.assignedDate]);

  /* ===============================
     Form handlers
  =============================== */
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        assetId: formData.assetId,
        employeeId: formData.employeeId,
        assignedDate: formData.assignedDate,
        expectedReturnDate: formData.expectedReturnDate,
        conditionAssigned: formData.conditionAssigned,
        notes: formData.notes || null,
      };

      await assetService.createAssignment(payload);

      alert("Asset assigned successfully");
      router.push("/hr/assets/assignments");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedAsset = assets.find(
    (a) => a.publicId === formData.assetId
  );
  const selectedEmployee = employees.find(
    (e) => e.publicId === formData.employeeId
  );


  /* ===============================
     UI
  =============================== */
  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        rightContent={
          <Link
            href="/hr/assets/assignments"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <ArrowLeft size={18} /> Back to Assignments
          </Link>
        }
      />

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-4 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Assign Asset to Employee
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Asset */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Asset *
                </label>
                <select
                  name="assetId"
                  value={formData.assetId}
                  onChange={handleChange}
                  required
                  disabled={assetsLoading}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="">
                    {assetsLoading ? "Loading assets..." : "Select Asset"}
                  </option>
                  {assets.map((asset) => (
                    <option
                      key={asset.publicId ?? asset.id}
                      value={asset.publicId ?? asset.id}
                    >
                      {asset.name} ({asset.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Employee *
                </label>
                <select
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                  disabled={employeesLoading}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="">
                    {employeesLoading
                      ? "Loading employees..."
                      : "Select Employee"}
                  </option>
                  {employees.map((emp) => (
                    <option
                      key={emp.publicId ?? emp.id}
                      value={emp.publicId ?? emp.id}
                    >
                      {emp.firstName} {emp.lastName} ({emp.department?.name || "N/A"})
                    </option>
                  ))}

                </select>
              </div>

              {/* Assigned Date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Assigned Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    name="assignedDate"
                    value={formData.assignedDate}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Return Date */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Expected Return Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    name="expectedReturnDate"
                    value={formData.expectedReturnDate}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Condition at Issue *
                </label>
                <select
                  name="conditionAssigned"
                  value={formData.conditionAssigned}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700"
                >
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
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

            {/* Preview */}
            {(selectedAsset || selectedEmployee) && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-3">
                  Assignment Preview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAsset && (
                    <div className="flex items-center">
                      <Package className="w-5 h-5 mr-2 text-blue-600" />
                      <div>
                        <p className="font-medium">{selectedAsset.name}</p>
                        <p className="text-xs text-gray-500">
                          {selectedAsset.category}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedEmployee && (
                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-green-600" />
                      <div>
                        <p className="font-medium">{selectedEmployee.name}</p>
                        <p className="text-xs text-gray-500">
                          {selectedEmployee.department?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Link
                href="/hr/assets/assignments"
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
                {loading ? "Assigning..." : "Assign Asset"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
