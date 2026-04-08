"use client";

import { useState, useEffect } from "react";
import { slugify } from "@/lib/utils";
import { AdminCsvImport } from "@/components/AdminCsvImport";

interface AdminCompaniesProps {
  universityId: string;
}

const FUNDING_STAGES = ["Pre-Seed", "Seed", "Early Stage", "Series A", "Series B", "Series C", "Growth", "Acquired", "Listed"];
const INVESTMENT_STATUSES = ["Raising", "Funded", "Bootstrapped"];
const SECTORS = ["AI", "HealthTech", "DeepTech", "CleanTech", "FinTech", "BioTech", "MedTech", "Quantum", "Robotics", "Materials", "SpaceTech", "EdTech", "AgriTech", "CyberSecurity", "SaaS", "Other"];

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  website: "",
  linkedinUrl: "",
  tags: "",
  segment: "",
  newThisWeek: false,
  sector: "",
  fundingStage: "",
  fundingRaised: "",
  investmentStatus: "",
  foundedYear: "",
  technologySummary: "",
  isEcosystemOrg: false,
};

export function AdminCompanies({ universityId }: AdminCompaniesProps) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [universityId]);

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`/api/admin/companies?universityId=${universityId}`);
      const data = await res.json();
      setCompanies(data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing ? `/api/admin/companies/${editing}` : "/api/admin/companies";
      const method = editing ? "PUT" : "POST";

      const payload: any = {
        ...formData,
        universityId,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        foundedDate: formData.foundedYear
          ? new Date(`${formData.foundedYear}-01-01`).toISOString()
          : null,
        sector: formData.sector || null,
        fundingStage: formData.fundingStage || null,
        fundingRaised: formData.fundingRaised || null,
        investmentStatus: formData.investmentStatus || null,
        technologySummary: formData.technologySummary || null,
      };
      delete payload.foundedYear;

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setEditing(null);
      setFormData(EMPTY_FORM);
      fetchCompanies();
    } catch (error) {
      console.error("Error saving company:", error);
      alert("Failed to save. Please try again.");
    }
  };

  const handleEdit = (company: any) => {
    setEditing(company.id);
    setFormData({
      name: company.name,
      slug: company.slug,
      description: company.description || "",
      website: company.website || "",
      linkedinUrl: company.linkedinUrl || "",
      tags: company.tags.join(", "),
      segment: company.segment || "",
      newThisWeek: company.newThisWeek || false,
      sector: company.sector || "",
      fundingStage: company.fundingStage || "",
      fundingRaised: company.fundingRaised || "",
      investmentStatus: company.investmentStatus || "",
      foundedYear: company.foundedDate
        ? String(new Date(company.foundedDate).getFullYear())
        : "",
      technologySummary: company.technologySummary || "",
      isEcosystemOrg: company.isEcosystemOrg || false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;
    try {
      await fetch(`/api/admin/companies/${id}`, { method: "DELETE" });
      fetchCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
      alert("Failed to delete. Please try again.");
    }
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const set = (field: string, value: any) =>
    setFormData((f) => ({ ...f, [field]: value }));

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">
          Companies {editing && <span className="text-blue-600 text-lg font-normal">— Editing</span>}
        </h2>
        <button
          onClick={() => setShowImport(!showImport)}
          className="text-sm border border-gray-300 bg-white text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors font-medium"
        >
          {showImport ? "Hide Import" : "Import CSV"}
        </button>
      </div>
      {showImport && (
        <AdminCsvImport
          type="companies"
          universityId={universityId}
          onComplete={() => {
            fetchCompanies();
            setShowImport(false);
          }}
        />
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
        {/* Basic info */}
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Basic Info</div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: slugify(e.target.value) })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => set("slug", slugify(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input type="url" value={formData.website} onChange={(e) => set("website", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
            <input type="url" value={formData.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input type="text" value={formData.tags} onChange={(e) => set("tags", e.target.value)}
              placeholder="AI, Robotics, Deep Learning"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Segment</label>
            <input type="text" value={formData.segment} onChange={(e) => set("segment", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        {/* Investor fields */}
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 border-t pt-4">Investor Fields</div>
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Founded Year</label>
            <input
              type="number"
              value={formData.foundedYear}
              onChange={(e) => set("foundedYear", e.target.value)}
              placeholder="2019"
              min="1990"
              max={new Date().getFullYear()}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Funding Stage</label>
            <select value={formData.fundingStage} onChange={(e) => set("fundingStage", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">— None —</option>
              {FUNDING_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Investment Status</label>
            <select value={formData.investmentStatus} onChange={(e) => set("investmentStatus", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">— None —</option>
              {INVESTMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Funding Raised</label>
            <input
              type="text"
              value={formData.fundingRaised}
              onChange={(e) => set("fundingRaised", e.target.value)}
              placeholder="£2M"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
            <select value={formData.sector} onChange={(e) => set("sector", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
              <option value="">— None —</option>
              {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-6 pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.newThisWeek}
                onChange={(e) => set("newThisWeek", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300" />
              <span className="text-sm font-medium text-gray-700">New this week</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isEcosystemOrg}
                onChange={(e) => set("isEcosystemOrg", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300" />
              <span className="text-sm font-medium text-gray-700">Ecosystem org (not investable)</span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Technology Summary</label>
          <textarea
            value={formData.technologySummary}
            onChange={(e) => set("technologySummary", e.target.value)}
            placeholder="Brief description of the core IP or technology..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            rows={2}
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            {editing ? "Update Company" : "Create Company"}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setFormData(EMPTY_FORM); }}
              className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-medium">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Company table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm border border-gray-300 rounded-md px-3 py-1.5 text-sm"
          />
          <span className="ml-3 text-sm text-gray-500">{filtered.length} of {companies.length}</span>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sector</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Founded</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((company) => (
              <tr key={company.id} className={company.isEcosystemOrg ? "bg-gray-50" : ""}>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {company.name}
                  {company.isEcosystemOrg && (
                    <span className="ml-1.5 text-xs text-gray-400">(ecosystem)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{company.sector || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{company.fundingStage || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{company.investmentStatus || <span className="text-gray-300">—</span>}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {company.foundedDate ? new Date(company.foundedDate).getFullYear() : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                  <button onClick={() => handleEdit(company)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button onClick={() => handleDelete(company.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
