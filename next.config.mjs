/** Dish photos uploaded from /admin live in Supabase Storage, whose hostname
 * is project-specific (<ref>.supabase.co). Derive it from the env var so the
 * config works across the dev/preview/prod projects without editing. */
const supabaseHostname = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    console.warn(`[next.config] NEXT_PUBLIC_SUPABASE_URL is not a valid URL: ${url}`);
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Legacy photos from the original menu provider, still referenced by
      // some dishes that have not been re-shot yet.
      {
        protocol: "https",
        hostname: "quiikly.com",
        pathname: "/storage/**",
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https",
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
