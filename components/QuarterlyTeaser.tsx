import Link from "next/link";

interface QuarterlyTeaserProps {
  university: { slug: string; name: string };
}

// Placeholder rows to simulate the real quarterly workflow UI
const PLACEHOLDER_PEOPLE = [
  { name: "Dr. Sarah Mitchell", company: "Quantum Biosystems Ltd", date: "Due today" },
  { name: "James Thornton", company: "NanoMed Technologies", date: "Due 2 days ago" },
  { name: "Prof. Oliver Chen", company: "Oxford ML Solutions", date: "Due 5 days ago" },
  { name: "Emma Hargreaves", company: "CarbonX Ventures", date: "Due 1 week ago" },
];

export function QuarterlyTeaser({ university }: QuarterlyTeaserProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quarterly Workflow</h1>
        <p className="text-gray-500 mt-1">
          {university.name} · Outreach pipeline
        </p>
      </div>

      {/* Locked content */}
      <div className="relative">
        {/* Placeholder rows (blurred) */}
        <div className="space-y-4 blur-sm select-none opacity-50 pointer-events-none">
          {PLACEHOLDER_PEOPLE.map((person, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{person.name}</span>
                    <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded font-medium">
                      {person.date}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{person.company}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <div className="h-8 w-28 bg-gray-100 rounded-lg" />
                  <div className="h-8 w-32 bg-gray-900 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75 backdrop-blur-[2px] rounded-xl">
          <div className="text-center max-w-sm px-6">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Quarterly Workflow is a Pro feature
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Manage your outreach pipeline with email templates, contact
              history, and 90-day follow-up scheduling.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
            >
              Upgrade to Pro →
            </Link>
            <p className="text-xs text-gray-400 mt-3">
              From £99/month · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
