/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable blocking network font fetching during next build / dev startup
  optimizeFonts: false,
  // Fast compilation with Rust SWC
  swcMinify: true,
  poweredByHeader: false,
  // Automatically optimize heavy third-party packages to prevent compilation bloat
  experimental: {
    optimizePackageImports: ["mermaid", "react-markdown", "remark-gfm"],
  },
};

export default nextConfig;
