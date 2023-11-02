/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    API_URL: process.env.API_URL,
    DEBUG: process.env.DEBUG,
    GA_ANALYTICS_ID: process.env.GA_ANALYTICS_ID,
  },
  images: {
    domains: ["localhost", "0.0.0.0", "127.0.0.1"],
  },
  experimental: {
    scrollRestoration: true,
  },
};

module.exports = nextConfig;
