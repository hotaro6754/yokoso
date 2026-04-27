"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/common/Breadcrumb";
import { UserCircle, Mail, Phone, Briefcase, Building2, MapPin } from "lucide-react";
import { managerTeamService } from "@/services/manager-services/team.service";

export default function TeamProfilePage() {
  const params = useParams();
  const [member, setMember] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        const data = await managerTeamService.getTeamMemberProfile(params?.id);
        if (!active) return;
        setMember(data);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Unable to load team member profile");
      }
    };

    if (params?.id) fetchProfile();

    return () => {
      active = false;
    };
  }, [params?.id]);

  const breadcrumbItems = [
    { label: "Manager", href: "/manager" },
    { label: "My Team", href: "/manager/my-team" },
    { label: "Profile", href: `/manager/team/profile/${params?.id}` },
  ];

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <Breadcrumb items={breadcrumbItems} />
        <div className="mt-6 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-gray-600 dark:text-gray-400">
          {error || "Employee not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
              <UserCircle className="text-primary-600 dark:text-primary-400" size={28} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{member.designation}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4 flex items-start gap-3">
              <Mail size={16} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{member.email}</p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4 flex items-start gap-3">
              <Phone size={16} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {member.phone || "Not available"}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4 flex items-start gap-3">
              <Briefcase size={16} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{member.status}</p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4 flex items-start gap-3">
              <Building2 size={16} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{member.department}</p>
              </div>
            </div>
            <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/60 p-4 flex items-start gap-3">
              <MapPin size={16} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Work Location</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{member.workLocation}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Link
              href="/manager/my-team"
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              Back to My Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
