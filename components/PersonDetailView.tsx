"use client";

import Link from "next/link";
import { useState } from "react";
import { encodeMailtoUrl } from "@/lib/utils";

interface PersonDetailViewProps {
  university: { id: string; slug: string; name: string };
  person: any;
  templates: any[];
  isPro: boolean;
}

export function PersonDetailView({
  university,
  person,
  templates,
  isPro,
}: PersonDetailViewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const template = templates.find((t) => t.id === selectedTemplate);

  const handleEmailClick = () => {
    if (!person.email) return;
    if (!template) {
      window.location.href = `mailto:${person.email}`;
      return;
    }
    const mailtoUrl = encodeMailtoUrl(
      person.email,
      template.subject,
      template.body
    );
    window.location.href = mailtoUrl;
  };

  const handleCopyDraft = () => {
    if (!template) return;
    const draft = `Subject: ${template.subject}\n\n${template.body}`;
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fallbackEmail = person.segment
    ? `${person.segment.toLowerCase()}@${university.slug}.ac.uk`
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href={`/u/${university.slug}/directory`}
        className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
      >
        ← Back to Directory
      </Link>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {person.firstName} {person.lastName}
        </h1>

        {person.company && (
          <p className="text-lg text-gray-700 mb-4">
            <span className="font-medium">Company:</span>{" "}
            <Link
              href={`/u/${university.slug}/companies/${person.company.slug}`}
              className="text-blue-600 hover:underline"
            >
              {person.company.name}
            </Link>
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {person.tags.map((tag: string) => (
            <span
              key={tag}
              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-2 mb-4">
          {isPro && person.email && (
            <p>
              <span className="font-medium">Email:</span>{" "}
              <a
                href={`mailto:${person.email}`}
                className="text-blue-600 hover:underline"
              >
                {person.email}
              </a>
            </p>
          )}
          {!isPro && person.email && (
            <p className="text-gray-500">
              Email available with Pro subscription
            </p>
          )}
          {person.linkedinUrl && (
            <p>
              <span className="font-medium">LinkedIn:</span>{" "}
              <a
                href={person.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {person.linkedinUrl}
              </a>
            </p>
          )}
          {person.profileUrl && (
            <p>
              <span className="font-medium">Profile:</span>{" "}
              <a
                href={person.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {person.profileUrl}
              </a>
            </p>
          )}
          {person.otherUrls && person.otherUrls.length > 0 && (
            <div>
              <span className="font-medium">Other URLs:</span>
              <ul className="list-disc list-inside ml-4">
                {person.otherUrls.map((url: string, idx: number) => (
                  <li key={idx}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {person.segment && (
            <p>
              <span className="font-medium">Segment:</span> {person.segment}
            </p>
          )}
        </div>

        {isPro && templates.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Email Template</h3>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2"
            >
              <option value="">Select a template...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {template && (
              <div className="mt-2">
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700">Subject:</p>
                  <p className="text-sm text-gray-600">{template.subject}</p>
                </div>
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700">Body:</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {template.body}
                  </p>
                </div>
                {person.email ? (
                  <button
                    onClick={handleEmailClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Open Email
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={handleCopyDraft}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      {copied ? "Copied!" : "Copy Draft"}
                    </button>
                    {fallbackEmail && (
                      <p className="text-sm text-gray-600">
                        Fallback: {fallbackEmail}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
