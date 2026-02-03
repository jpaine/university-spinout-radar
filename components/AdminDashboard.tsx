"use client";

import { useState } from "react";
import { AdminUniversities } from "./AdminUniversities";
import { AdminCompanies } from "./AdminCompanies";
import { AdminPeople } from "./AdminPeople";
import { AdminTemplates } from "./AdminTemplates";

interface AdminDashboardProps {
  universities: any[];
}

export function AdminDashboard({ universities }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"universities" | "companies" | "people" | "templates">("universities");
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(
    universities[0]?.id || null
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select University
        </label>
        <select
          value={selectedUniversity || ""}
          onChange={(e) => setSelectedUniversity(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Select a university...</option>
          {universities.map((uni) => (
            <option key={uni.id} value={uni.id}>
              {uni.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {(["universities", "companies", "people", "templates"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "universities" && <AdminUniversities />}
      {activeTab === "companies" && selectedUniversity && (
        <AdminCompanies universityId={selectedUniversity} />
      )}
      {activeTab === "people" && selectedUniversity && (
        <AdminPeople universityId={selectedUniversity} />
      )}
      {activeTab === "templates" && selectedUniversity && (
        <AdminTemplates universityId={selectedUniversity} />
      )}
    </div>
  );
}
