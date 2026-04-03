"use client";

import { useState, useEffect } from "react";

interface Prefs {
  email: string | null;
  weeklyDigest: boolean;
  newSpinoutAlert: boolean;
}

export function NotificationPreferencesForm() {
  const [prefs, setPrefs] = useState<Prefs>({ email: null, weeklyDigest: true, newSpinoutAlert: false });
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications/preferences")
      .then((r) => r.json())
      .then((data: Prefs) => {
        setPrefs(data);
        setEmail(data.email ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...prefs, email: email || null }),
      });
      const data = await res.json();
      setPrefs(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-400">Loading preferences...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email address for notifications
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full max-w-sm border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={prefs.weeklyDigest}
            onChange={(e) => setPrefs((p) => ({ ...p, weeklyDigest: e.target.checked }))}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">Weekly digest</div>
            <div className="text-xs text-gray-500">Every Monday: new spinouts, funding rounds, and news from Oxford</div>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={prefs.newSpinoutAlert}
            onChange={(e) => setPrefs((p) => ({ ...p, newSpinoutAlert: e.target.checked }))}
            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">New spinout alerts</div>
            <div className="text-xs text-gray-500">Instant notification when a new Oxford spinout is detected</div>
          </div>
        </label>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save preferences"}
      </button>
    </div>
  );
}
