/** @type {import('next').NextConfig} */
const url = require("url");

const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: url.parse(process.env.NEXT_PUBLIC_FONTDUE_URL).hostname,
      },
      {
        protocol: "https",
        hostname: "*.fontdue.com",
      },
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
