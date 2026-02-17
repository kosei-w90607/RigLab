'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'

export default function SignUpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawCallback = searchParams.get('callbackUrl') || '/dashboard'
  const callbackUrl = rawCallback.startsWith('/') && !rawCallback.startsWith('//')
    ? rawCallback
    : '/dashboard'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

      // 登録成功後、自動ログイン
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const code = result.code
        if (code === 'rate_limited') {
          setGeneralError('ログイン試行回数の上限です。しばらくしてからお試しください。')
        } else if (code === 'server_error') {
          setGeneralError('サーバーに接続できません。しばらくしてからお試しください。')
        } else {
          // 登録は成功したがログインに失敗した場合（callbackUrlも引き継ぐ）
          router.push(`/signin?registered=true&callbackUrl=${encodeURIComponent(callbackUrl)}`)
        }
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setGeneralError('登録に失敗しました。再度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card padding="lg" shadow="md" className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-8">
          新規登録
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {generalError && (
            <div role="alert" className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
              {generalError}
            </div>
          )}

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
