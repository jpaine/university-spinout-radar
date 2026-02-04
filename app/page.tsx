import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  try {
    const user = await currentUser();

    if (user) {
      // Redirect to first university or create a default
      redirect("/u/oxford/directory");
    }
  } catch (error) {
    console.error("Error checking user:", error);
    // Continue to show landing page if there's an error
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        University Spinout Radar
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Track and manage university spinout companies and contacts
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/pricing"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          View Pricing
        </Link>
        <Link
          href="/sign-in"
          className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-300"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
