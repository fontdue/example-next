// Tenant/mode resolution. The template runs in one of two modes:
//
// - Single-tenant (default, customer forks): NEXT_PUBLIC_FONTDUE_URL points at
//   one Fontdue site and every request renders that site. This is the original
//   behavior of this repo.
//
// - Multi-tenant (FONTDUE_MULTI_TENANT=1, the hosted white-label template):
//   the tenant is derived per request from the forwarded Host header, and one
//   deployment serves every tenant. Rewrites in next.config.js turn each
//   request into the /[domain]/... route tree so pages are rendered and
//   cached per domain.
//
// In multi-tenant mode, GraphQL is fetched from FONTDUE_ORIGIN (the internal
// Fontdue server, e.g. http://localhost:4000 when running next to it) with the
// tenant's domain forwarded via X-Forwarded-Host, authenticated by the
// FONTDUE_PROXY_SECRET shared secret (the Fontdue server refuses to trust
// X-Forwarded-Host without it). Without FONTDUE_ORIGIN it falls back to
// fetching the tenant's public URL directly, which is useful for local
// development against live sites.
//
// The fontdue-js components embedded in pages fetch the same way: their
// server-side preloads read the per-render config set in fetchGraphql (see
// fontdueServerConfig below), and in the browser they fetch the relative
// /graphql on the page's own origin — so multi-tenant mode needs no
// NEXT_PUBLIC_FONTDUE_URL at all.

import type { FontdueServerConfig } from "fontdue-js/server";

export const isMultiTenant = process.env.FONTDUE_MULTI_TENANT === "1";

const singleTenantUrl = process.env.NEXT_PUBLIC_FONTDUE_URL;
const internalOrigin = process.env.FONTDUE_ORIGIN;
const proxySecret = process.env.FONTDUE_PROXY_SECRET;

if (!isMultiTenant && !singleTenantUrl) {
  throw new Error(
    "Set NEXT_PUBLIC_FONTDUE_URL (single-tenant) or FONTDUE_MULTI_TENANT=1 (multi-tenant).",
  );
}

// Hostnames only: letters/digits/hyphens/dots, no path or port. Anything else
// is rejected before it can reach the GraphQL fetch or the filesystem cache.
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/;

export function isValidDomain(domain: string): boolean {
  return domain.length <= 253 && DOMAIN_RE.test(domain);
}

// Where to fetch GraphQL for a given tenant domain, plus any headers needed
// for the Fontdue server to resolve that tenant.
export function fontdueEndpoint(domain: string): {
  origin: string;
  headers: Record<string, string>;
} {
  if (!isMultiTenant) {
    return { origin: singleTenantUrl!, headers: {} };
  }
  if (internalOrigin) {
    return {
      origin: internalOrigin,
      headers: {
        "x-forwarded-host": domain,
        ...(proxySecret ? { "x-fontdue-proxy-secret": proxySecret } : {}),
      },
    };
  }
  return { origin: `https://${domain}`, headers: {} };
}

// metadataBase / sitemap fallback when the site URL setting is empty.
export function fallbackSiteUrl(domain: string): string {
  return isMultiTenant ? `https://${domain}` : "http://localhost:3000";
}

// Per-render config for fontdue-js's own server-side fetches: same endpoint
// and headers as fetchGraphql, plus the per-domain cache tag so
// /api/revalidate purges embed data (theme config, type testers, store)
// along with the pages.
export function fontdueServerConfig(domain: string): FontdueServerConfig {
  const { origin, headers } = fontdueEndpoint(domain);
  return { url: origin, headers, cacheTags: [`graphql:${domain}`] };
}
