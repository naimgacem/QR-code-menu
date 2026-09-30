import type { MetadataRoute } from "next";

/**
 * The dashboard already sends `noindex` headers via its layout metadata;
 * this stops well-behaved crawlers from requesting /admin at all, so the
 * login page never shows up in a search result for the restaurant's name.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/"],
    },
  };
}
