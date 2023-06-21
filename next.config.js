/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.fontdue.com",
      },
      {
        protocol: "https",
        hostname: "*.fontdue.xyz",
      },
      {
        protocol: "https",
        hostname: "*.fontdue.local",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/graphql",
        destination: "https://api.fontdue.xyz/graphql",
      },
    ];
  },
};

module.exports = nextConfig;
