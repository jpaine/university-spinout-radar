"use client";

import { useState, useRef } from "react";

interface AdminCsvImportProps {
  type: "companies" | "people";
  universityId: string;
  onComplete: () => void;
}

interface ImportResult {
  created: number;
  updated: number;
  errors: { row: number; message: string }[];
}

// Handles quoted commas properly
function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = splitCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = splitCSVLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });

  return { headers, rows };
}

const COMPANY_COLUMNS = [
  "name",
  "slug",
  "description",
  "website",
  "linkedin",
  "tags",
  "sector",
  "fundingStage",
  "foundedDate",
  "fundingRaised",
  "investmentStatus",
];

const PEOPLE_COLUMNS = [
  "firstName",
  "lastName",
  "email",
  "companySlug",
  "linkedin",
  "tags",
  "segment",
];

export function AdminCsvImport({ type, universityId, onComplete }: AdminCsvImportProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const expectedColumns = type === "companies" ? COMPANY_COLUMNS : PEOPLE_COLUMNS;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/admin/${type}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universityId, rows }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Import failed");
      }

      const data: ImportResult = await res.json();
      setResult(data);

      if (data.errors.length === 0) {
        onComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setHeaders([]);
    setRows([]);
    setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mt-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Import {type === "companies" ? "Companies" : "People"} from CSV
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Expected columns:{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">
              {expectedColumns.join(", ")}
            </code>
          </p>
        </div>
      </div>

      {/* File picker */}
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-gray-300 file:text-sm file:bg-white file:text-gray-700 file:cursor-pointer hover:file:bg-gray-50 mb-4"
      />

      {/* Preview */}
      {rows.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2">
            Preview — {rows.length} rows detected (showing first 5)
          </p>
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="text-xs w-full">
              <thead className="bg-gray-100">
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="px-2 py-1.5 text-left font-medium text-gray-600 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="bg-white">
                    {headers.map((h) => (
                      <td
                        key={h}
                        className="px-2 py-1.5 text-gray-700 max-w-[150px] truncate"
                        title={row[h]}
                      >
                        {row[h] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleImport}
              disabled={importing}
              className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {importing
                ? "Importing..."
                : `Import ${rows.length} row${rows.length !== 1 ? "s" : ""}`}
            </button>
            <button
              onClick={reset}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className={`rounded p-3 text-sm ${
            result.errors.length === 0
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-yellow-50 border border-yellow-200 text-yellow-800"
          }`}
        >
          <p className="font-medium">
            ✓ {result.created} created · {result.updated} updated
            {result.errors.length > 0 && ` · ${result.errors.length} errors`}
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-0.5 text-xs">
              {result.errors.map((e) => (
                <li key={e.row}>
                  Row {e.row}: {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
