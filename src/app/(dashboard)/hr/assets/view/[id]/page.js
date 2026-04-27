"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Breadcrumb from "@/components/common/Breadcrumb";
import Link from "next/link";
import { assetService } from "../../../../../../services/hr-services/asset.service";

export default function ViewAssetPage() {
  const { id } = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const response = await assetService.getAssetById(id);
        setAsset(response.data);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-gray-600 dark:text-gray-400">
        Loading asset details...
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-6 text-red-600">
        Asset not found
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen dark:bg-gray-900 p-4 sm:p-6">
      <Breadcrumb
        rightContent={
          <Link
            href="/hr/assets"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-600"
          >
            <ArrowLeft size={18} />
            Back to Assets
          </Link>
        }
      />

      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Asset Details
        </h1>

        {/* BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Info label="Asset Name" value={asset.name} />
          <Info label="Category" value={asset.category.name} />
          <Info label="Serial Number" value={asset.serialNumber} />
          <Info label="Model" value={asset.model} />
          <Info label="Manufacturer" value={asset.manufacturer} />
          <Info label="Location" value={asset.location} />
          <Info label="Status" value={asset.status} />
          <Info label="Condition" value={asset.condition} />
        </div>

        {/* FINANCIAL INFO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Info label="Purchase Cost" value={`₹${asset.purchaseCost}`} />
          <Info label="Current Value" value={`₹${asset.currentValue}`} />
          <Info label="Maintenance Schedule" value={asset.maintenanceSchedule} />
        </div>

        {/* DATES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Info label="Purchase Date" value={formatDate(asset.purchaseDate)} />
          <Info label="Warranty Expiry" value={formatDate(asset.warrantyExpiry)} />
          <Info label="Created At" value={formatDate(asset.createdAt)} />
        </div>

        {/* NOTES */}
        {asset.notes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Notes
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              {asset.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-base font-medium text-gray-900 dark:text-white">
        {value || "-"}
      </p>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
}
