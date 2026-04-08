/**
 * The default university slug for this deployment.
 * Configure via NEXT_PUBLIC_DEFAULT_UNIVERSITY_SLUG environment variable.
 * Uses NEXT_PUBLIC_ prefix so it's available in both server and client bundles.
 */
export const DEFAULT_UNIVERSITY_SLUG =
  process.env.NEXT_PUBLIC_DEFAULT_UNIVERSITY_SLUG ?? "oxford";
