'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog'
import type { PcCustomSet } from '@/types'
import { api, ApiClientError } from '@/lib/api'

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function BuildCard({
  build,
  onDelete,
}: {
  build: PcCustomSet
  onDelete: (id: number) => void
}) {
  return (
    <Card padding="lg" shadow="sm" className="mb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 truncate" title={build.name}>
            {build.name}
          </h3>
          <p className="text-sm text-gray-500">作成日: {formatDate(build.createdAt)}</p>
        </div>
        <div className="text-xl font-bold text-custom-blue whitespace-nowrap">
          {formatPrice(build.totalPrice)}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/builds/${build.id}`}>
          <Button variant="secondary" size="sm">詳細</Button>
        </Link>
        <Link href={`/configurator?edit=${build.id}`}>
          <Button variant="ghost" size="sm">編集</Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(build.id)}
          className="text-red-600 hover:bg-red-50"
        >
          削除
        </Button>
      </div>
    </Card>
  )
}

function SkeletonCard() {
  return (
    <Card padding="lg" shadow="sm" className="mb-4">
      <div className="flex justify-between mb-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </Card>
  )
}

function EmptyState() {
  return (
    <Card padding="lg" shadow="sm" className="text-center py-12">
      <div className="text-4xl mb-4">📦</div>
      <p className="text-gray-900 font-medium mb-2">
        保存した構成がありません
      </p>
      <p className="text-gray-500 mb-6">
        PC構成を作成して保存しましょう
      </p>
      <Link href="/configurator">
        <Button variant="primary">構成を作成する</Button>
      </Link>
    </Card>
  )
}

export default function DashboardPage() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const status = sessionResult?.status
  const router = useRouter()

  const [builds, setBuilds] = useState<PcCustomSet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/dashboard')
    }
  }, [status, router])

  // Fetch user's builds
  useEffect(() => {
    const fetchBuilds = async () => {
      if (!session?.accessToken) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await api.get<{ data: PcCustomSet[] }>(
          '/builds',
          session.accessToken
        )
        setBuilds(response.data)
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message)
        } else {
          setError('構成の取得に失敗しました')
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchBuilds()
    }
  }, [session?.accessToken, status])

  const handleDelete = async () => {
    if (deleteTarget === null || !session?.accessToken) return

    setIsDeleting(true)
    try {
      await api.delete(`/builds/${deleteTarget}`, session.accessToken)
      setBuilds((prev) => prev.filter((b) => b.id !== deleteTarget))
    } catch (err) {
      if (err instanceof ApiClientError) {
        alert(err.message)
      } else {
        alert('削除に失敗しました')
      }
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="flex-1 px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  // Don't render anything while redirecting
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="flex-1 px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            ダッシュボード
          </h1>
          <Link href="/configurator">
            <Button variant="primary">新しい構成を作る</Button>
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <Card padding="lg" shadow="sm" className="text-center mb-6">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="secondary" onClick={() => window.location.reload()}>
              再読み込み
            </Button>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <>
            <p className="text-gray-600 mb-4">保存した構成</p>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* Builds List */}
        {!isLoading && !error && (
          <>
            <p className="text-gray-600 mb-4">
              保存した構成 ({builds.length}件)
            </p>

            {builds.length === 0 ? (
              <EmptyState />
            ) : (
              builds.map((build) => (
                <BuildCard
                  key={build.id}
                  build={build}
                  onDelete={setDeleteTarget}
                />
              ))
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="構成を削除"
        message="この構成を削除しますか？この操作は取り消せません。"
        confirmLabel="削除する"
        cancelLabel="キャンセル"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
