import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.usemuckly.com";
  
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing", "/sign-in", "/sign-up"],
      disallow: ["/dashboard", "/admin", "/settings", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
