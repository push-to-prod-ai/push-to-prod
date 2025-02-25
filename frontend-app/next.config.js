/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'standalone', // Optimizes for containerized deployments
    images: {
      domains: ['github.com'], // Add any domains you'll load images from
    },
    // Enable experimental features if needed
    experimental: {
      // serverActions: true,
    },
    // Environment variables to expose to the browser
    env: {
      // NODE_ENV is managed by Next.js automatically
    },
  };
  
  module.exports = nextConfig;