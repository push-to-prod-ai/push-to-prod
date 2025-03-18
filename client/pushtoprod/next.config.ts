import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui.convertfa.st',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
