import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.google-analytics.com https://*.googletagmanager.com; font-src 'self'; connect-src 'self' https://integrate.api.nvidia.com https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com;",
          }
        ],
      },
    ];
  },
};

export default nextConfig;
