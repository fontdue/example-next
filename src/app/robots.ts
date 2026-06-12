import { MetadataRoute } from "next";
import { fetchGraphql } from "@/lib/graphql";
import { SiteUrlQuery } from "@graphql";
import { requireSiteUrl } from "@/lib/site-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { viewer } = await fetchGraphql<SiteUrlQuery>("SiteUrl.graphql");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: new URL("/sitemap.xml", requireSiteUrl(viewer.url)).toString(),
  };
}
