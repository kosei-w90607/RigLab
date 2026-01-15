import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Strict Mode for development
  reactStrictMode: true,

  // API proxy to backend (Rails)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
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
}

export default nextConfig
