import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — this is a client-only SPA that talks to skezzod-api
  // and Firebase directly; there's no Next.js server in production.
  output: "export",
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
