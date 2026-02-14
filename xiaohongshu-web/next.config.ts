import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.xiaohongshu.com',
      },
      {
        protocol: 'http',
        hostname: '**.xiaohongshu.com',
      },
      {
        protocol: 'https',
        hostname: 'sns-img-bd.xhscdn.com',
      },
      {
        protocol: 'https',
        hostname: 'sns-video-bd.xhscdn.com',
      },
    ],
  },
};

export default nextConfig;
