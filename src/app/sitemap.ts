import type { MetadataRoute } from "next";

const siteUrl = "https://previx-sst.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/gestao-sst`, changeFrequency: "monthly", priority: 1 },
  ];
}
