/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.fontdue.com",
      },
    ],
  },
};

module.exports = nextConfig;
