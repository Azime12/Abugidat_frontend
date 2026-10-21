import type { NextConfig } from "next";
// Trigger reload for translation keys config v3
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["framer-motion"],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  crossOrigin: process.env.NODE_ENV === 'production' ? 'anonymous' : undefined,
  experimental: {},
  async rewrites() {
    const targetBackend =
      process.env.BACKEND_INTERNAL_URL ||
      (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.startsWith("/")
        ? process.env.NEXT_PUBLIC_API_URL
        : "http://127.0.0.1:5000/api");
    return [
      {
        source: "/api/:path*",
        destination: `${targetBackend}/:path*`,
      },
    ];
  },
  async headers() {
    if (process.env.NODE_ENV !== 'production') {
      return [];
    }
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            // value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://images.unsplash.com https://lh3.googleusercontent.com https://*.tile.openstreetmap.org; media-src 'self' blob: data: https://csm.gov.et https://backend.csm.gov.et https://transportback.ilul-tech.com http://localhost:5000 http://localhost:3000 http://localhost:5001; connect-src 'self' https://csm.gov.et https://backend.csm.gov.et https://transportback.ilul-tech.com wss://transportback.ilul-tech.com ws: wss: http://localhost:5000 ws://localhost:5000 http://localhost:3000 ws://localhost:3000 http://localhost:5001 ws://localhost:5001 https://nominatim.openstreetmap.org; frame-ancestors 'none';",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https://images.unsplash.com https://lh3.googleusercontent.com https://*.tile.openstreetmap.org https://cleaningbackend.ilul-tech.com https://*.ilul-tech.com; media-src 'self' blob: data: https://csm.gov.et https://backend.csm.gov.et https://transportback.ilul-tech.com https://cleaningbackend.ilul-tech.com https://*.ilul-tech.com http://localhost:5000 http://localhost:3000 http://localhost:5001; connect-src 'self' https://csm.gov.et https://backend.csm.gov.et https://transportback.ilul-tech.com wss://transportback.ilul-tech.com https://cleaningbackend.ilul-tech.com wss://cleaningbackend.ilul-tech.com https://*.ilul-tech.com wss://*.ilul-tech.com ws: wss: http://localhost:5000 ws://localhost:5000 http://localhost:3000 ws://localhost:3000 http://localhost:5001 ws://localhost:5001 https://nominatim.openstreetmap.org; frame-ancestors 'none';",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
