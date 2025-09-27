import type { NextConfig } from "next";

import("./src/env.js");

const nextConfig: NextConfig = {
  // output: 'export',
  trailingSlash: false,
  images: {
    unoptimized: true
  },
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js']
  }
};

export default nextConfig;
