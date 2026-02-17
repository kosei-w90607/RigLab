'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'

type Status = 'loading' | 'success' | 'error' | 'no_token'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<Status>(token ? 'loading' : 'no_token')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token) return

    const verify = async () => {
      try {
        const response = await fetch('/api/v1/auth/email/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        if (response.ok) {
          setStatus('success')
        } else {
          const data = await response.json()
          setErrorMessage(data.error || '確認に失敗しました')
          setStatus('error')
        }
      } catch {
        setErrorMessage('サーバーに接続できませんでした')
        setStatus('error')
      }
    }

    verify()
  }, [token])

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <Card padding="lg" shadow="md" className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">メールアドレスを確認中...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">&#10003;</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              メールアドレスを確認しました
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              ログインしてRigLabをご利用ください。
            </p>
            <Link href="/signin">
              <Button variant="primary" size="lg" className="w-full">
                ログインページへ
              </Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">&#10007;</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              確認に失敗しました
            </h1>
            <p className="text-red-600 dark:text-red-400 mb-6">{errorMessage}</p>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              トークンが無効または期限切れの可能性があります。
            </p>
            <Link href="/signin">
              <Button variant="primary" size="lg" className="w-full">
                ログインページへ
              </Button>
            </Link>
          </>
        )}

        {status === 'no_token' && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              無効なリンクです
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              確認用のトークンが含まれていません。メール内のリンクを再度ご確認ください。
            </p>
            <Link href="/signin">
              <Button variant="primary" size="lg" className="w-full">
                ログインページへ
              </Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  )
}
