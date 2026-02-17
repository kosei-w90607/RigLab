'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('メールアドレスを入力してください')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/v1/auth/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('リクエストに失敗しました')
      }

      setIsSubmitted(true)
    } catch {
      setError('送信に失敗しました。しばらくしてからお試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card padding="lg" shadow="md" className="w-full max-w-md">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              メールを送信しました
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              メールアドレスが登録されている場合、パスワードリセットの手順をお送りしました。メールをご確認ください。
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              メールが届かない場合は、迷惑メールフォルダもご確認ください。
            </p>
            <Link
              href="/signin"
              className="mt-4 inline-block text-custom-blue hover:underline font-medium"
            >
              ログインページに戻る
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card padding="lg" shadow="md" className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
          パスワードをお忘れの方
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
          登録済みのメールアドレスを入力してください。パスワードリセットの手順をお送りします。
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div role="alert" className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? '送信中...' : 'リセットメールを送信'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <Link
            href="/signin"
            className="text-custom-blue hover:underline font-medium text-sm"
          >
            ログインページに戻る
          </Link>
        </div>
      </Card>
    </div>
  )
}
