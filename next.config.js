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
};

module.exports = nextConfig;
