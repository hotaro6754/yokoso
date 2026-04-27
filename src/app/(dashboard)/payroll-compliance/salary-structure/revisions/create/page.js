import React from "react";
import SalaryRevisionForm from "../../components/SalaryRevisionForm";

export const metadata = {
  title: "Create Salary Revision | HRMS",
  description: "Create or draft a new salary revision",
};

export default function CreateRevisionPage() {
  return (
    <div className="p-6">
      <SalaryRevisionForm />
    </div>
  );
}
