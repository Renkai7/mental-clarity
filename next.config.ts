import type { NextConfig } from "next";

// Static export configuration for Electron offline packaging.
// We force assetPrefix to './' so relative paths work under file:// protocol.
// Images must be unoptimized for static export.
const nextConfig: NextConfig = {
  output: 'export',
  assetPrefix: './',
  images: { unoptimized: true },
};

export default nextConfig;
