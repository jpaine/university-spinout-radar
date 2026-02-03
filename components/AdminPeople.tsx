"use client";

import { useState, useEffect } from "react";
import { slugify } from "@/lib/utils";

interface AdminPeopleProps {
  universityId: string;
}

export function AdminPeople({ universityId }: AdminPeopleProps) {
  const [people, setPeople] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    slug: "",
    email: "",
    linkedinUrl: "",
    profileUrl: "",
    otherUrls: "",
    tags: "",
    segment: "",
    companyId: "",
    newThisWeek: false,
  });

  useEffect(() => {
    fetchData();
  }, [universityId]);

  const fetchData = async () => {
    try {
      const [peopleRes, companiesRes] = await Promise.all([
        fetch(`/api/admin/people?universityId=${universityId}`),
        fetch(`/api/admin/companies?universityId=${universityId}`),
      ]);
      const [peopleData, companiesData] = await Promise.all([
        peopleRes.json(),
        companiesRes.json(),
      ]);
      setPeople(peopleData);
      setCompanies(companiesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing
        ? `/api/admin/people/${editing}`
        : "/api/admin/people";
      const method = editing ? "PUT" : "POST";

      const payload = {
        ...formData,
        universityId,
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        otherUrls: formData.otherUrls.split(",").map((u) => u.trim()).filter(Boolean),
        companyId: formData.companyId || null,
      };

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setEditing(null);
      setFormData({
        firstName: "",
        lastName: "",
        slug: "",
        email: "",
        linkedinUrl: "",
        profileUrl: "",
        otherUrls: "",
        tags: "",
        segment: "",
        companyId: "",
        newThisWeek: false,
      });
      fetchData();
    } catch (error) {
      console.error("Error saving person:", error);
      alert("Failed to save. Please try again.");
    }
  };

  const handleEdit = (person: any) => {
    setEditing(person.id);
    setFormData({
      firstName: person.firstName,
      lastName: person.lastName,
      slug: person.slug,
      email: person.email || "",
      linkedinUrl: person.linkedinUrl || "",
      profileUrl: person.profileUrl || "",
      otherUrls: person.otherUrls?.join(", ") || "",
      tags: person.tags.join(", "),
      segment: person.segment || "",
      companyId: person.companyId || "",
      newThisWeek: person.newThisWeek || false,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this person?")) return;

    try {
      await fetch(`/api/admin/people/${id}`, { method: "DELETE" });
      fetchData();
    } catch (error) {
      console.error("Error deleting person:", error);
      alert("Failed to delete. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">People</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => {
                const fullName = `${e.target.value} ${formData.lastName}`.trim();
                setFormData({
                  ...formData,
                  firstName: e.target.value,
                  slug: slugify(fullName),
                });
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => {
                const fullName = `${formData.firstName} ${e.target.value}`.trim();
                setFormData({
                  ...formData,
                  lastName: e.target.value,
                  slug: slugify(fullName),
                });
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
        </div>
        <div className="mb-4">
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
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company
            </label>
            <select
              value={formData.companyId}
              onChange={(e) =>
                setFormData({ ...formData, companyId: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">None</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile URL
            </label>
            <input
              type="url"
              value={formData.profileUrl}
              onChange={(e) =>
                setFormData({ ...formData, profileUrl: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Other URLs (comma-separated)
          </label>
          <input
            type="text"
            value={formData.otherUrls}
            onChange={(e) =>
              setFormData({ ...formData, otherUrls: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
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
          {editing ? "Update" : "Create"} Person
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setFormData({
                firstName: "",
                lastName: "",
                slug: "",
                email: "",
                linkedinUrl: "",
                profileUrl: "",
                otherUrls: "",
                tags: "",
                segment: "",
                companyId: "",
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
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {people.map((person) => (
              <tr key={person.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {person.firstName} {person.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {person.email || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(person)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(person.id)}
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
