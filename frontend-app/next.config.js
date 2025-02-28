/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: ['github.com'], 
    },
    // Skip type checking during build for faster builds in production
    typescript: {
      ignoreBuildErrors: process.env.NODE_ENV === 'production',
    },
    eslint: {
      ignoreDuringBuilds: process.env.NODE_ENV === 'production',
    },
  };
  
  module.exports = nextConfig;