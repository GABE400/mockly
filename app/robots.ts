import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://usemuckly.com";
  
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing", "/sign-in", "/sign-up", "/support"],
      disallow: ["/dashboard", "/admin", "/settings", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
