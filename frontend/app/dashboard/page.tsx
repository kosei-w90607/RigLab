'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { Modal } from '@/app/components/ui/Modal'
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog'
import type { PcCustomSet } from '@/types'
import { api, ApiClientError } from '@/lib/api'
import { createShareUrl } from '@/lib/share'
import { ScrollToTopButton } from '@/app/components/ui/ScrollToTopButton'
import { useToast } from '@/app/components/ui/Toast'

// API response type (camelCase - api.tsで変換済み)
interface ApiBuildSummary {
  id: number
  name: string
  totalPrice: number
  shareToken: string | null
  createdAt: string
  updatedAt: string
}

// Transform API response to frontend type
function transformBuild(apiBuild: ApiBuildSummary): PcCustomSet {
  return {
    id: apiBuild.id,
    name: apiBuild.name,
    totalPrice: apiBuild.totalPrice,
    shareToken: apiBuild.shareToken,
    createdAt: apiBuild.createdAt,
    updatedAt: apiBuild.updatedAt,
  } as PcCustomSet
}

function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) {
    return '¥0'
  }
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price)
}

function formatDate(dateString: string | undefined | null): string {
  if (!dateString) {
    return '-'
  }
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    return '-'
  }
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function BuildCard({
  build,
  onDelete,
  onShare,
}: {
  build: PcCustomSet
  onDelete: (id: number) => void
  onShare: (build: PcCustomSet) => void
}) {
  return (
    <Card padding="lg" shadow="sm" className="mb-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <Link href={`/builds/${build.id}`}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 truncate" title={build.name}>
              {build.name}
            </h2>
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">作成日: {formatDate(build.createdAt)}</p>
        </div>
        <div className="text-xl font-bold text-custom-blue whitespace-nowrap">
          {formatPrice(build.totalPrice)}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        <Link href={`/configurator?edit=${build.id}`}>
          <button aria-label={`${build.name}を編集する`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            編集
          </button>
        </Link>
        <button
          onClick={() => onShare(build)}
          aria-label={`${build.name}を共有する`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          共有
        </button>
        <button
          onClick={() => onDelete(build.id)}
          aria-label={`${build.name}を削除する`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <svg className="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          削除
        </button>
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

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <Card padding="lg" shadow="sm" className="text-center py-12">
      <div className="text-4xl mb-4">📦</div>
      <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
        保存した構成がありません
      </p>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        PC構成を作成して保存しましょう
      </p>
      <Button variant="primary" onClick={onCreateClick}>
        構成を作成する
      </Button>
    </Card>
  )
}

function CreateBuildModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const router = useRouter()

  const handleSelect = (path: string) => {
    onClose()
    router.push(path)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="構成方法を選択">
      <div className="space-y-4">
        <button
          onClick={() => handleSelect('/builder')}
          className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-custom-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl">🎯</div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-1">おまかせ構成</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                用途と予算を入力するだけで、AIが最適なパーツ構成を提案します。初心者におすすめ。
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleSelect('/configurator')}
          className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-custom-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl">🔧</div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-1">カスタム構成</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                パーツを1つずつ自分で選びます。こだわりの構成を作りたい方向け。
              </p>
            </div>
          </div>
        </button>
      </div>
    </Modal>
  )
}

export default function DashboardPage() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const status = sessionResult?.status
  const router = useRouter()
  const { addToast } = useToast()

  const [builds, setBuilds] = useState<PcCustomSet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // フラッシュメッセージの表示（ページ遷移後のトースト）
  useEffect(() => {
    const flash = sessionStorage.getItem('flash')
    if (flash) {
      sessionStorage.removeItem('flash')
      try {
        const { type, message } = JSON.parse(flash)
        addToast({ type, message })
      } catch {
        // パースエラー時は無視
      }
    }
  }, [addToast])

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
        const response = await api.get<{ data: ApiBuildSummary[] }>(
          '/builds',
          session.accessToken
        )
        setBuilds(response.data.map(transformBuild))
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
        addToast({ type: 'error', message: `削除に失敗しました: ${err.message}` })
      } else {
        addToast({ type: 'error', message: '削除に失敗しました。ネットワーク接続を確認してください。' })
      }
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  const handleShare = async (build: PcCustomSet) => {
    try {
      // ビルド詳細を取得してパーツIDを取得
      const response = await api.get<{ data: { parts: { category: string; part: { id: number } }[] } }>(
        `/builds/${build.id}`,
        session?.accessToken
      )
      const parts = response.data.parts
      const partIds: Record<string, number | null> = {}
      let storageIndex = 1
      for (const p of parts) {
        if (p.category === 'storage') {
          partIds[`storage${storageIndex}_id`] = p.part.id
          storageIndex++
        } else {
          partIds[`${p.category}_id`] = p.part.id
        }
      }

      // share_tokensでトークン生成してURL取得
      const shareUrl = await createShareUrl(partIds)

      if (navigator.share) {
        await navigator.share({
          title: build.name,
          text: `${build.name} - ${formatPrice(build.totalPrice)}`,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        addToast({ type: 'success', message: 'URLをコピーしました' })
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      addToast({ type: 'error', message: '共有URLの生成に失敗しました' })
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
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              ダッシュボード
            </h1>
            {session?.user?.name && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                こんにちは、{session.user.name}さん
              </p>
            )}
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            新しい構成を作る
          </Button>
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
            <p className="text-gray-600 dark:text-gray-400 mb-4">保存した構成</p>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* Builds List */}
        {!isLoading && !error && (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              保存した構成 ({builds.length}件)
            </p>

            {builds.length === 0 ? (
              <EmptyState onCreateClick={() => setShowCreateModal(true)} />
            ) : (
              builds.map((build) => (
                <BuildCard
                  key={build.id}
                  build={build}
                  onDelete={setDeleteTarget}
                  onShare={handleShare}
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

      {/* Create Build Modal */}
      <CreateBuildModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <ScrollToTopButton />
    </div>
  )
}
