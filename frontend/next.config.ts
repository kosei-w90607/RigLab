import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

// Backend API URL for server-side rewrites (use Docker service name in container)
// INTERNAL_API_URL is for server-side, NEXT_PUBLIC_API_URL is for client-side
const BACKEND_URL = process.env.INTERNAL_API_URL?.replace('/api/v1', '') || 'http://localhost:3001'

const nextConfig: NextConfig = {
  // Strict Mode for development
  reactStrictMode: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https: data:",
              "font-src 'self'",
              "connect-src 'self' https://*.sentry.io",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },

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

export default withSentryConfig(nextConfig, {
  silent: true,
})
