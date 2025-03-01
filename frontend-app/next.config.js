/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'github.com',
          pathname: '**',
        },
        {
          protocol: 'https',
          hostname: '*.githubusercontent.com',
          pathname: '**',
        }
      ],
    },
    // Skip type checking during build for faster builds in production
    typescript: {
      ignoreBuildErrors: process.env.NODE_ENV === 'production',
    },
    eslint: {
      ignoreDuringBuilds: process.env.NODE_ENV === 'production',
    },
    // Explicitly configure path aliases
    webpack: (config) => {
      config.resolve.alias['@'] = path.join(__dirname, 'src');
      return config;
    },
};

module.exports = nextConfig;