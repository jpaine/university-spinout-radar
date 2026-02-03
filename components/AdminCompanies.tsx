"use client";

import { useState, useEffect } from "react";
import { slugify } from "@/lib/utils";

interface AdminCompaniesProps {
  universityId: string;
}

export function AdminCompanies({ universityId }: AdminCompaniesProps) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    website: "",
    linkedinUrl: "",
    tags: "",
    segment: "",
    newThisWeek: false,
  });

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
      const url = editing
        ? `/api/admin/companies/${editing}`
        : "/api/admin/companies";
      const method = editing ? "PUT" : "POST";

      const payload = {
        ...formData,
        universityId,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setEditing(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        website: "",
        linkedinUrl: "",
        tags: "",
        segment: "",
        newThisWeek: false,
      });
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
    });
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

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Companies</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  name: e.target.value,
                  slug: slugify(e.target.value),
                });
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: slugify(e.target.value) })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            rows={3}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) =>
                setFormData({ ...formData, linkedinUrl: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="AI, Robotics, AI-enabled robotics"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Segment
            </label>
            <input
              type="text"
              value={formData.segment}
              onChange={(e) =>
                setFormData({ ...formData, segment: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.newThisWeek}
              onChange={(e) =>
                setFormData({ ...formData, newThisWeek: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              New this week
            </span>
          </label>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {editing ? "Update" : "Create"} Company
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormData({
                name: "",
                slug: "",
                description: "",
                website: "",
                linkedinUrl: "",
                tags: "",
                segment: "",
                newThisWeek: false,
              });
            }}
            className="ml-2 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {company.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {company.tags.join(", ")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(company)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
