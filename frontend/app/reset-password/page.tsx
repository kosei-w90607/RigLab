'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}

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
      const response = await fetch('/api/v1/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          password_confirmation: passwordConfirmation,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setGeneralError(data.error || data.errors?.join(', ') || 'パスワードの再設定に失敗しました')
        return
      }

      setIsSuccess(true)
    } catch {
      setGeneralError('送信に失敗しました。しばらくしてからお試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card padding="lg" shadow="md" className="w-full max-w-md">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              無効なリンク
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              パスワードリセットのリンクが無効です。もう一度リセットをお試しください。
            </p>
            <Link
              href="/forgot-password"
              className="mt-4 inline-block text-custom-blue hover:underline font-medium"
            >
              パスワードリセットを再申請
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card padding="lg" shadow="md" className="w-full max-w-md">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              パスワードを再設定しました
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              新しいパスワードでログインしてください。
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full mt-4"
              onClick={() => router.push('/signin')}
            >
              ログインページへ
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card padding="lg" shadow="md" className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
          パスワード再設定
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
          新しいパスワードを入力してください。
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {generalError && (
            <div role="alert" className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
              {generalError}
            </div>
          )}

          <Input
            label="新しいパスワード"
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
            {isLoading ? '再設定中...' : 'パスワードを再設定'}
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
