import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
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
    ...(process.env.NEXT_PUBLIC_APP_URL && { url: process.env.NEXT_PUBLIC_APP_URL }),
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <Providers session={session}>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}
