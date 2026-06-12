import { fetchGraphql } from "@/lib/graphql";
import { SiteUrlQuery } from "@graphql";
import { fallbackSiteUrl } from "fontdue-js/next";

// Served at /robots.txt via the host → /[domain] middleware rewrite. A route
// handler rather than the app/robots.ts convention because that convention
// only works at the app root, where the tenant isn't known.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ domain: string }> },
) {
  const { domain } = await params;
  const { viewer } = await fetchGraphql<SiteUrlQuery>(
    domain,
    "SiteUrl.graphql",
  );

  const sitemap = new URL(
    "/sitemap.xml",
    viewer.url ?? fallbackSiteUrl(domain),
  ).toString();

  const body = [
    "User-Agent: *",
    "Allow: /",
    "Disallow: /api/",
    `Sitemap: ${sitemap}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "content-type": "text/plain" },
  });
}
