import type { NextConfig } from 'next'

// Backend API URL for server-side rewrites (use Docker service name in container)
// INTERNAL_API_URL is for server-side, NEXT_PUBLIC_API_URL is for client-side
const BACKEND_URL = process.env.INTERNAL_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'

const nextConfig: NextConfig = {
  // Strict Mode for development
  reactStrictMode: true,

  // API proxy to backend (Rails)
  // Note: /api/auth/* routes are handled by NextAuth, not proxied
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ]
  },

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Webpack config for Docker file watching (fixes HMR issues)
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,        // Check for changes every second
        aggregateTimeout: 300,  // Delay before rebuilding
      }
    }
    return config
  },
}

export default nextConfig
