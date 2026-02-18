'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { sanitizeCallbackUrl } from '@/lib/url'
import { useGoogleEnabled } from '@/hooks/useGoogleEnabled'

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const callbackUrl = sanitizeCallbackUrl(searchParams.get('callbackUrl'))

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const googleEnabled = useGoogleEnabled()

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'ユーザー名を入力してください'
    }

    if (!email.trim()) {
      newErrors.email = 'メールアドレスを入力してください'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'メールアドレスの形式が正しくありません'
    }

    if (!password) {
      newErrors.password = 'パスワードを入力してください'
    } else if (password.length < 8) {
      newErrors.password = '8文字以上で入力してください'
    } else if (!/^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      newErrors.password = '英字と数字を両方含めてください'
    }

    if (!passwordConfirmation) {
      newErrors.passwordConfirmation = 'パスワード（確認）を入力してください'
    } else if (password !== passwordConfirmation) {
      newErrors.passwordConfirmation = 'パスワードが一致しません'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')

    if (!validate()) {
      return
    }

    setIsLoading(true)

    try {
      // Register user via new JWT API (uses Next.js rewrite proxy)
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            name,
            email,
            password,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.errors) {
          setGeneralError(Array.isArray(data.errors) ? data.errors.join(', ') : data.errors)
        } else {
          setGeneralError('登録に失敗しました。入力内容を確認してください。')
        }
        return
      }

      // 登録成功 → 確認メール送信済み画面を表示
      setRegisteredEmail(email)
    } catch {
      setGeneralError('登録に失敗しました。再度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  if (registeredEmail) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card padding="lg" shadow="md" className="w-full max-w-md text-center">
          <div className="text-custom-blue text-5xl mb-4">&#9993;</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            確認メールを送信しました
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            <span className="font-medium">{registeredEmail}</span> に確認メールを送信しました。
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
            メール内のリンクをクリックして、メールアドレスの確認を完了してください。
          </p>
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm mb-6">
            メールが届かない場合は、迷惑メールフォルダをご確認ください。
          </div>
          <Link
            href={`/signin${callbackUrl !== '/dashboard' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            className="text-custom-blue hover:underline font-medium"
          >
            ログインページへ
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card padding="lg" shadow="md" className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
          新規登録
        </h1>

        {generalError && (
          <div role="alert" className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
            {generalError}
          </div>
        )}

        {googleEnabled && (
          <>
            {/* Google 登録ボタン */}
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Googleで登録
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
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="ユーザー名"
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ユーザー名を入力"
            autoComplete="username"
            error={errors.name}
            disabled={isLoading}
          />

          <Input
            label="メールアドレス"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            autoComplete="email"
            error={errors.email}
            disabled={isLoading}
          />

          <Input
            label="パスワード"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="英数字8文字以上"
            autoComplete="new-password"
            error={errors.password}
            disabled={isLoading}
          />

          <Input
            label="パスワード（確認）"
            type="password"
            name="passwordConfirmation"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="パスワードを再入力"
            autoComplete="new-password"
            error={errors.passwordConfirmation}
            disabled={isLoading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? '登録中...' : '登録する'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            すでにアカウントをお持ちの方は
          </p>
          <Link
            href={`/signin${callbackUrl !== '/dashboard' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            className="mt-2 inline-block text-custom-blue hover:underline font-medium"
          >
            ログイン
          </Link>
        </div>
      </Card>
    </div>
  )
}
