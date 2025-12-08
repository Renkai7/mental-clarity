import type { NextConfig } from "next";

// Static export configuration for Electron offline packaging.
// assetPrefix: './' creates relative paths that work with file:// protocol.
// We duplicate _next assets into each route folder to support this.
const nextConfig: NextConfig = {
  output: 'export',
  distDir: '.next',
  images: { unoptimized: true },
  assetPrefix: './',
  trailingSlash: true,
};

export default nextConfig;
