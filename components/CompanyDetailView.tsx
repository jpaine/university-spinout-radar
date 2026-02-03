import Link from "next/link";

interface CompanyDetailViewProps {
  university: { id: string; slug: string; name: string };
  company: any;
  isPro: boolean;
}

export function CompanyDetailView({
  university,
  company,
  isPro,
}: CompanyDetailViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        href={`/u/${university.slug}/directory`}
        className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
      >
        ← Back to Directory
      </Link>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{company.name}</h1>

        {company.description && (
          <p className="text-gray-700 mb-4">{company.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {company.tags.map((tag: string) => (
            <span
              key={tag}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-2">
          {company.website && (
            <p>
              <span className="font-medium">Website:</span>{" "}
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {company.website}
              </a>
            </p>
          )}
          {company.linkedinUrl && (
            <p>
              <span className="font-medium">LinkedIn:</span>{" "}
              <a
                href={company.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {company.linkedinUrl}
              </a>
            </p>
          )}
          {company.segment && (
            <p>
              <span className="font-medium">Segment:</span> {company.segment}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">People</h2>
        <div className="space-y-4">
          {company.people.map((person: any) => (
            <Link
              key={person.id}
              href={`/u/${university.slug}/people/${person.slug}`}
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900">
                {person.firstName} {person.lastName}
              </h3>
              {isPro && person.email && (
                <p className="text-sm text-gray-600 mt-1">{person.email}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
