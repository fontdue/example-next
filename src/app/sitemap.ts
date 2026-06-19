import { MetadataRoute } from "next";
import { fetchGraphql } from "@/lib/graphql";
import { SitemapQuery } from "@graphql";
import { notEmpty } from "@/lib/utils";
import { requireSiteUrl } from "@/lib/site-url";

// The login page is intentionally left out — it's reachable from the nav
// but isn't search-relevant content.
const EXCLUDED_PAGE_SLUGS = new Set(["customer-login"]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { viewer } = await fetchGraphql<SitemapQuery>("Sitemap.graphql");

  const fonts =
    viewer.fontCollections?.edges
      ?.map((edge) => edge?.node?.slug?.name)
      .filter(notEmpty) ?? [];

  const articles =
    viewer.articles?.edges
      ?.map((edge) => edge?.node?.slug?.name)
      .filter(notEmpty) ?? [];

  const pages =
    viewer.pages?.edges
      ?.map((edge) => edge?.node?.slug?.name)
      .filter(notEmpty)
      .filter((slug) => !EXCLUDED_PAGE_SLUGS.has(slug)) ?? [];

  // Licenses with a PDF redirect /licenses/:slug to the PDF, so only the
  // HTML-backed ones belong in the sitemap.
  const licenses =
    viewer.licenses
      ?.filter((license) => !license.pdf?.url)
      .map((license) => license.slug?.name)
      .filter(notEmpty) ?? [];

  const paths = new Set([
    "/",
    ...fonts.map((slug) => `/fonts/${slug}`),
    ...(articles.length ? ["/articles"] : []),
    ...articles.map((slug) => `/article/${slug}`),
    ...pages.map((slug) => `/${slug}`),
    "/test-fonts",
    "/licenses",
    ...licenses.map((slug) => `/licenses/${slug}`),
  ]);

  const base = requireSiteUrl(viewer.url);
  return Array.from(paths).map((path) => ({
    url: new URL(path, base).toString(),
  }));
}
