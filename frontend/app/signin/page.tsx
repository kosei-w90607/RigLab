'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { sanitizeCallbackUrl } from '@/lib/url'

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: 'このメールアドレスは別の方法で登録されています。',
  OAuthCallbackError: 'Googleログインに失敗しました。再度お試しください。',
}

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = sanitizeCallbackUrl(searchParams.get('callbackUrl'))
  const oauthError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  useEffect(() => {
    if (oauthError && OAUTH_ERROR_MESSAGES[oauthError]) {
      setError(OAUTH_ERROR_MESSAGES[oauthError])
    }
  }, [oauthError])

  const handleResendConfirmation = async () => {
    if (!email || resendStatus === 'sending') return
    setResendStatus('sending')

    try {
      await fetch('/api/v1/auth/email/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setResendStatus('sent')
    } catch {
      setResendStatus('idle')
    }
  }

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setShowResendConfirmation(false)
    setResendStatus('idle')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const code = result.code
        if (code === 'email_not_confirmed') {
          setError('メールアドレスが未確認です。確認メールのリンクをクリックしてください。')
          setShowResendConfirmation(true)
        } else if (code === 'password_not_set') {
          setError('パスワードが設定されていません。Googleでログインするか、パスワードリセットからパスワードを設定してください。')
        } else if (code === 'rate_limited') {
          setError('ログイン試行回数の上限です。しばらくしてからお試しください。')
        } else if (code === 'server_error') {
          setError('サーバーに接続できません。しばらくしてからお試しください。')
        } else {
          setError('メールアドレスまたはパスワードが正しくありません')
        }
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('ログインに失敗しました。再度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card padding="lg" shadow="md" className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
          ログイン
        </h1>

        {error && (
          <div role="alert" className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
            {error}
            {showResendConfirmation && (
              <div className="mt-2">
                {resendStatus === 'sent' ? (
                  <p className="text-green-600 dark:text-green-400">確認メールを再送しました。</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resendStatus === 'sending'}
                    className="text-custom-blue hover:underline font-medium disabled:opacity-50"
                  >
                    {resendStatus === 'sending' ? '送信中...' : '確認メールを再送する'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Google ログインボタン */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Googleでログイン
        </button>

        {/* 区切り線 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              または
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="メールアドレス"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            autoComplete="email"
            required
            disabled={isLoading}
          />

          <Input
            label="パスワード"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワードを入力"
            autoComplete="current-password"
            required
            disabled={isLoading}
          />

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-custom-blue hover:underline"
            >
              パスワードを忘れた方
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            アカウントをお持ちでない方は
          </p>
          <Link
            href={`/signup${callbackUrl !== '/dashboard' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            className="mt-2 inline-block text-custom-blue hover:underline font-medium"
          >
            新規登録
          </Link>
        </div>
      </Card>
    </div>
  )
}
