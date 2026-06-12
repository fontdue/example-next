import { fetchGraphql } from "@/lib/graphql";
import { SitemapQuery } from "@graphql";
import { notEmpty } from "@/lib/utils";
import { fallbackSiteUrl } from "fontdue-js/next";

// Utility pages (login, font trials) are intentionally left out — they're
// reachable from the nav but aren't search-relevant content.
const EXCLUDED_PAGE_SLUGS = new Set(["customer-login", "test-fonts"]);

// Served at /sitemap.xml via the host → /[domain] middleware rewrite. A route
// handler rather than the app/sitemap.ts convention because that convention
// only works at the app root, where the tenant isn't known.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ domain: string }> },
) {
  const { domain } = await params;
  const { viewer } = await fetchGraphql<SitemapQuery>(
    domain,
    "Sitemap.graphql",
  );

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
    "/licenses",
    ...licenses.map((slug) => `/licenses/${slug}`),
  ]);

  const base = viewer.url ?? fallbackSiteUrl(domain);
  const urls = Array.from(paths)
    .map((path) => `  <url><loc>${escapeXml(new URL(path, base).toString())}</loc></url>`)
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: { "content-type": "application/xml" },
  });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
