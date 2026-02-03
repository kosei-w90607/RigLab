'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Select } from '@/app/components/ui/Select'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog'
import { ScrollToTopButton } from '@/app/components/ui/ScrollToTopButton'
import { api, ApiResponse } from '@/lib/api'

// パーツカテゴリ
const CATEGORIES = [
  { value: '', label: 'すべてのカテゴリ' },
  { value: 'cpu', label: 'CPU' },
  { value: 'gpu', label: 'GPU' },
  { value: 'memory', label: 'メモリ' },
  { value: 'storage', label: 'ストレージ' },
  { value: 'motherboard', label: 'マザーボード' },
  { value: 'psu', label: '電源' },
  { value: 'case', label: 'ケース' },
  { value: 'os', label: 'OS' },
]

interface Part {
  id: number
  name: string
  category: string
  maker: string
  price: number
  specs: Record<string, unknown>
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price)
}

function getCategoryLabel(category: string): string {
  const found = CATEGORIES.find((c) => c.value === category)
  return found?.label || category
}

export default function AdminPartsPage() {
  const { data: session } = useSession()
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Part | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchParts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      })
      if (category) {
        params.append('category', category)
      }

      const data = await api.get<ApiResponse<Part[]>>(`/parts?${params}`)

      setParts(data.data || [])
      setTotalPages(Math.ceil((data.meta?.total || 0) / (data.meta?.per_page || 20)))
    } catch (error) {
      console.error('パーツの取得に失敗:', error)
    } finally {
      setLoading(false)
    }
  }, [page, category])

  useEffect(() => {
    fetchParts()
  }, [fetchParts])

  const handleDelete = async () => {
    if (!deleteTarget || !session?.accessToken) return

    setDeleting(true)
    try {
      await api.delete(`/admin/parts/${deleteTarget.id}?category=${deleteTarget.category}`, session.accessToken)
      setDeleteTarget(null)
      fetchParts()
    } catch (error) {
      console.error('パーツの削除に失敗:', error)
      alert('削除に失敗しました')
    } finally {
      setDeleting(false)
    }
  }

  if (loading && parts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-12 w-48" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">パーツ管理</h1>
        <Link href="/admin/parts/new">
          <Button>
            <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新規登録
          </Button>
        </Link>
      </div>

      {/* フィルター */}
      <div className="flex gap-4">
        <div className="w-48">
          <Select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              setPage(1)
            }}
            options={CATEGORIES}
          />
        </div>
      </div>

      {/* パーツ一覧 */}
      <Card padding="none" shadow="sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名前
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メーカー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  価格
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    パーツが登録されていません
                  </td>
                </tr>
              ) : (
                parts.map((part) => (
                  <tr key={`${part.category}-${part.id}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {part.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{part.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getCategoryLabel(part.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {part.maker}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(part.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/parts/${part.id}?category=${part.category}`}>
                          <Button variant="secondary" size="sm">
                            編集
                          </Button>
                        </Link>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setDeleteTarget(part)}
                          className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                        >
                          削除
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            前へ
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            次へ
          </Button>
        </div>
      )}

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="パーツを削除"
        message={`「${deleteTarget?.name}」を削除してもよろしいですか？この操作は取り消せません。`}
        confirmLabel="削除する"
        cancelLabel="キャンセル"
        isLoading={deleting}
        variant="danger"
      />

      {/* トップへ戻るボタン */}
      <ScrollToTopButton />
    </div>
  )
}
