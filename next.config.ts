import type { NextConfig } from "next";

function normalizeOrigin(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

const BACKEND_BASE_URL = normalizeOrigin(
  process.env.BACKEND_BASE_URL || "http://localhost:8000"
);

const BACKEND_API_PREFIX = "/api";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_BASE_URL}${BACKEND_API_PREFIX}/:path*`,
      },
    ];
  },
};

export default nextConfig;
