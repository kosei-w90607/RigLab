import type { NextConfig } from 'next'

// Backend API URL (use Docker service name in container, localhost for local dev)
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'

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
