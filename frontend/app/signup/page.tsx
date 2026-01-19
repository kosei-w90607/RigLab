'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export default function SignUpPage() {
  const router = useRouter()

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
      const response = await fetch(`${API_BASE_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.errors?.full_messages) {
          setGeneralError(data.errors.full_messages.join(', '))
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
        // 登録は成功したがログインに失敗した場合
        router.push('/signin?registered=true')
      } else {
        router.push('/')
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
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
          新規登録
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {generalError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
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
            placeholder="8文字以上"
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

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            すでにアカウントをお持ちの方は
          </p>
          <Link
            href="/signin"
            className="mt-2 inline-block text-custom-blue hover:underline font-medium"
          >
            ログイン
          </Link>
        </div>
      </Card>
    </div>
  )
}
