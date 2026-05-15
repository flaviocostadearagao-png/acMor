import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  env: {
    GOOGLE_MAPS_PLATFORM_KEY: process.env.GOOGLE_MAPS_PLATFORM_KEY || '',
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
