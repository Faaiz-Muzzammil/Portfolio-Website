import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  experimental: {
    // Only packages that are actually installed — the previous list named
    // date-fns, clsx and tailwind-merge, none of which are dependencies.
    //
    // @phosphor-icons/react was the omission that mattered. It is the icon
    // set this site actually uses, and every client component that reaches
    // for it — the nav, the contact form, the voice assistant — imports from
    // the package root, which is a barrel re-exporting well over a thousand
    // components. Without this the whole barrel is walked at build time and,
    // in dev, shipped. Server components already dodge it by importing from
    // `/dist/ssr` directly; the client ones could not.
    optimizePackageImports: [
      '@phosphor-icons/react',
      '@number-flow/react',
      'lucide-react',
      'framer-motion',
      '@icons-pack/react-simple-icons',
    ],
  },

  // Allowed Dev Origins (Root Level)
  // This enables network access (e.g. 10.5.0.2) without CORS errors
  allowedDevOrigins: [
    "localhost:3000",
    "10.5.0.2:3000",
    "10.5.0.2",
    "192.168.1.1:3000",
    "192.168.0.1:3000"
  ],
};

export default nextConfig;
