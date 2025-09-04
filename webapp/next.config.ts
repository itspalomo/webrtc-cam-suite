import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for mobile and performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Image optimization settings
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // PWA and mobile optimization
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
      ],
    },
  ],

  // Webpack optimizations for WebRTC
  webpack: (config, { dev }) => {
    if (!dev) {
      // Optimize WebRTC-related chunks
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        webrtc: {
          test: /[\\/]node_modules[\\/](simple-peer|webrtc-adapter|sdp-transform)[\\/]/,
          name: 'webrtc',
          chunks: 'all',
          priority: 10,
        },
      };
    }

    return config;
  },
};

export default nextConfig;
