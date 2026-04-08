"use client";

import { useState } from "react";
import { encodeMailtoUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface OutreachLogEntry {
  id: string;
  sentAt: Date;
  template: { name: string } | null;
}

interface QuarterlyWorkflowViewProps {
  university: { id: string; slug: string; name: string };
  people: any[];
  templates: any[];
  outreachLogs?: Record<string, OutreachLogEntry[]>;
}

export function QuarterlyWorkflowView({
  university,
  people,
  templates,
  outreachLogs = {},
}: QuarterlyWorkflowViewProps) {
  const router = useRouter();
  const [selectedTemplates, setSelectedTemplates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  const handleEmailClick = async (person: any) => {
    if (!person.email) return;
    const templateId = selectedTemplates[person.id];
    const template = templates.find((t) => t.id === templateId);

    if (template) {
      const mailtoUrl = encodeMailtoUrl(
        person.email,
        template.subject,
        template.body
      );
      window.location.href = mailtoUrl;
    } else {
      window.location.href = `mailto:${person.email}`;
    }
  };

  const handleMarkContacted = async (personId: string) => {
    setLoading((prev) => ({ ...prev, [personId]: true }));
    try {
      const nextTouchAt = new Date();
      nextTouchAt.setDate(nextTouchAt.getDate() + 90);

      await fetch(`/api/people/${personId}/mark-contacted`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextTouchAt: nextTouchAt.toISOString(),
          templateId: selectedTemplates[personId] || null,
        }),
      });

      router.refresh();
    } catch (error) {
      console.error("Error marking as contacted:", error);
      alert("Failed to update. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, [personId]: false }));
    }
  };

  const toggleHistory = (personId: string) => {
    setExpandedHistory((prev) => ({ ...prev, [personId]: !prev[personId] }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {university.name} Quarterly Workflow
      </h1>
      <p className="text-gray-600 mb-6">
        {people.length} {people.length === 1 ? "person" : "people"} due for contact
      </p>

      <div className="space-y-4">
        {people.map((person) => {
          const templateId = selectedTemplates[person.id];
          const template = templates.find((t) => t.id === templateId);
          const personLogs = outreachLogs[person.id] ?? [];
          const isHistoryExpanded = expandedHistory[person.id];

          return (
            <div
              key={person.id}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {person.firstName} {person.lastName}
                  </h3>
                  {person.company && (
                    <p className="text-gray-600">{person.company.name}</p>
                  )}
                  {person.email && (
                    <p className="text-sm text-gray-600 mt-1">{person.email}</p>
                  )}
                  {person.nextTouchAt ? (
                    <p className="text-sm text-gray-500 mt-1">
                      Next touch: {new Date(person.nextTouchAt).toLocaleDateString()}
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600 mt-1 font-medium">
                      Never contacted
                    </p>
                  )}
                </div>
              </div>

              {templates.length > 0 && (
                <div className="mb-4">
                  <select
                    value={templateId || ""}
                    onChange={(e) =>
                      setSelectedTemplates((prev) => ({
                        ...prev,
                        [person.id]: e.target.value,
                      }))
                    }
                    className="w-full md:w-auto border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">No template</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {template && (
                <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                  <p className="font-medium">Subject: {template.subject}</p>
                  <p className="mt-1 text-gray-600 whitespace-pre-wrap">
                    {template.body}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                {person.email && (
                  <button
                    onClick={() => handleEmailClick(person)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Open Email
                  </button>
                )}
                <button
                  onClick={() => handleMarkContacted(person.id)}
                  disabled={loading[person.id]}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading[person.id] ? "Saving..." : "Mark Contacted"}
                </button>
              </div>

              {/* Outreach history */}
              {personLogs.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <button
                    onClick={() => toggleHistory(person.id)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <span>{isHistoryExpanded ? "▾" : "▸"}</span>
                    <span>Past contacts ({personLogs.length})</span>
                  </button>
                  {isHistoryExpanded && (
                    <ul className="mt-2 space-y-1.5 pl-4">
                      {personLogs.map((log) => (
                        <li key={log.id} className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="font-medium text-gray-600">
                            {new Date(log.sentAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          {log.template && (
                            <span className="text-gray-400">· via {log.template.name}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {people.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
            <p className="font-medium mb-1">No contacts due right now</p>
            <p className="text-sm text-gray-400">
              People appear here when their next touch date has passed or they have never been contacted.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
