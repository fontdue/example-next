/** @type {import('next').NextConfig} */
const url = require("url");

const fontdueUrl = process.env.NEXT_PUBLIC_FONTDUE_URL;
const isMultiTenant = process.env.FONTDUE_MULTI_TENANT === "1";

if (!isMultiTenant && !fontdueUrl) {
  throw new Error(
    "Set NEXT_PUBLIC_FONTDUE_URL (single-tenant) or FONTDUE_MULTI_TENANT=1 (multi-tenant).",
  );
}

// Every page lives under the /[domain]/... route tree so Next renders and
// caches each tenant's pages independently. These rewrites turn the request's
// host into that leading path segment:
//
//   acme.fontdue.com/fonts/foo  →  /acme.fontdue.com/fonts/foo (internal)
//
// In single-tenant mode the domain is constant (from NEXT_PUBLIC_FONTDUE_URL)
// so the app behaves exactly like a plain single-site Next app.
//
// This is done with config rewrites rather than middleware on purpose:
// middleware rewrites bypass the ISR page cache on self-hosted next start,
// turning every request into a full render. beforeFiles rewrites go through
// the normal routing layer and keep per-tenant ISR working. (beforeFiles also
// runs before app routes are matched, so the internal /[domain] paths can't
// be reached directly with a mismatching Host — /evil.com on acme's domain
// becomes /acme.fontdue.com/evil.com, which 404s.)
//
// X-Forwarded-Host (set by the Fontdue proxy in front of this service) wins
// over Host. The hostname charset is constrained in the patterns; anything
// else falls through to a 404.
//
// beforeFiles rules CHAIN: each rule is evaluated in order against the
// already-rewritten path, so a rewrite must produce a path no later rule can
// match. Tenant domains always contain a dot, so the catch-all path rule
// refuses any path whose first segment contains a dot — that makes the
// rewritten /acme.fontdue.com/... inert. robots.txt and sitemap.xml (dotted
// first segments we DO want to serve) get their own explicit rules, which run
// first. Side effect: a tenant page slug containing a dot can't be routed at
// the top level.
const TENANT_HOST = "(?<tenant>[a-zA-Z0-9][a-zA-Z0-9.-]*)";
const DOTLESS_PATH =
  "/:path((?!api/|_next/|favicon\\.ico)(?![^/]*\\.[^/]*(?:/|$)).*)";

// One rule set rewriting onto `dest` (either a fixed /domain or the /:tenant
// capture from `has`). `conditions` is {has?, missing?}.
function rewriteRules(dest, conditions = {}) {
  return [
    { source: "/", destination: dest, ...conditions },
    { source: "/robots.txt", destination: `${dest}/robots.txt`, ...conditions },
    { source: "/sitemap.xml", destination: `${dest}/sitemap.xml`, ...conditions },
    { source: DOTLESS_PATH, destination: `${dest}/:path`, ...conditions },
  ];
}

function tenantRewrites() {
  if (!isMultiTenant) {
    return rewriteRules(`/${url.parse(fontdueUrl).host}`);
  }

  const forwardedHost = {
    type: "header",
    key: "x-forwarded-host",
    value: `${TENANT_HOST}(:.*)?`,
  };
  const noForwardedHost = { type: "header", key: "x-forwarded-host" };
  const host = { type: "host", value: TENANT_HOST };

  return [
    ...rewriteRules("/:tenant", { has: [forwardedHost] }),
    // Host-based rules only apply when X-Forwarded-Host is absent, so the
    // two sets can't both rewrite one request.
    ...rewriteRules("/:tenant", { has: [host], missing: [noForwardedHost] }),
  ];
}

const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: tenantRewrites(),
    };
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      ...(fontdueUrl
        ? [
            {
              protocol: "https",
              hostname: url.parse(fontdueUrl).hostname,
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "*.fontdue.com",
      },
      // Multi-tenant: logos and images can live on any tenant custom domain.
      // The URLs all come from the Fontdue CMS, not user input.
      ...(isMultiTenant ? [{ protocol: "https", hostname: "**" }] : []),
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  // Treat every user agent as HTML-limited so metadata rendering blocks the
  // response. Streamed metadata locks in a 200 status before
  // generateMetadata's notFound() can produce a real 404.
  htmlLimitedBots: /.*/,
};

module.exports = nextConfig;
