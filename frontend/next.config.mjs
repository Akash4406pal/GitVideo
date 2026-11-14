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
  // Proxy all backend and database endpoints to the standalone Node.js backend server
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:5001";
    return [
      {
        source: "/api/pipeline/:path*",
        destination: `${backendUrl}/api/pipeline/:path*`,
      },
      {
        source: "/api/user/:path*",
        destination: `${backendUrl}/api/user/:path*`,
      },
      {
        source: "/api/video",
        destination: `${backendUrl}/api/video`,
      },
      {
        source: "/api/video/:path*",
        destination: `${backendUrl}/api/video/:path*`,
      },
      {
        source: "/api/repo/:path*",
        destination: `${backendUrl}/api/repo/:path*`,
      },
    ];
  },
};

export default nextConfig;
