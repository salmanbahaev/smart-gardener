import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Позволяем сборке проходить, даже если есть ESLint-ошибки в проекте
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
