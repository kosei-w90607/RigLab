import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

// サーバーサイドリライト用のバックエンドAPI URL（コンテナ内ではDockerサービス名を使用）
// INTERNAL_API_URL はサーバーサイド用、NEXT_PUBLIC_API_URL はクライアントサイド用
const BACKEND_URL = (() => {
  const url = process.env.INTERNAL_API_URL
  if (!url && process.env.NODE_ENV === 'production') {
    throw new Error('INTERNAL_API_URL must be set in production')
  }
  return url?.replace('/api/v1', '') || 'http://localhost:3001'
})()

// NEXT_PUBLIC_API_URL はビルド時にバンドルへインライン化される
// 本番ビルドで未設定の場合、全 API 呼び出しが localhost にフォールバックするため即停止
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL must be set in production')
}

const nextConfig: NextConfig = {
  // 開発用の Strict Mode
  reactStrictMode: true,

  // セキュリティヘッダー（CSP は nonce 対応のため middleware で処理）
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
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },

  // バックエンド（Rails）へのAPIプロキシ
  // 注意: /api/auth/* ルートは NextAuth が処理し、プロキシしない
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${BACKEND_URL}/api/v1/:path*`,
      },
    ]
  },

  // 画像最適化設定
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'thumbnail.image.rakuten.co.jp' },
      { protocol: 'https', hostname: 'image.rakuten.co.jp' },
    ],
  },

  // Docker ファイル監視用の Webpack 設定（HMR の問題を修正）
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,        // 毎秒変更をチェック
        aggregateTimeout: 300,  // リビルド前の遅延
      }
    }
    return config
  },
}

export default withSentryConfig(nextConfig, {
  silent: true,
})
