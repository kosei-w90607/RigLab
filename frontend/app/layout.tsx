import type { Metadata } from 'next'
import { Providers } from './providers'
import { LayoutWrapper } from './components/LayoutWrapper'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | RigLab',
    default: 'RigLab - あなただけのPC構成を見つけよう',
  },
  description:
    'RigLabは予算と用途から最適なPC構成を提案するサービスです。おまかせで選ぶ、自分で選ぶ、2つの方法であなただけの理想のPCを見つけましょう。',
  keywords: ['PC構成', '自作PC', 'パーツ選び', 'ゲーミングPC', '予算'],
  authors: [{ name: 'RigLab' }],
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://riglab.example.com',
    siteName: 'RigLab',
    title: 'RigLab - あなただけのPC構成を見つけよう',
    description:
      'RigLabは予算と用途から最適なPC構成を提案するサービスです。',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RigLab - あなただけのPC構成を見つけよう',
    description:
      'RigLabは予算と用途から最適なPC構成を提案するサービスです。',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" data-theme="light">
      <body>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}
