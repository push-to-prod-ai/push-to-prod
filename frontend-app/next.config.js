/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: [
        'github.com', 
        'avatars.githubusercontent.com',
        'avatar.githubusercontent.com',
        'avatars0.githubusercontent.com',
        'avatars1.githubusercontent.com',
        'avatars2.githubusercontent.com',
        'avatars3.githubusercontent.com'
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