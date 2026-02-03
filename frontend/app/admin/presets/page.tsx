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

// 予算帯
const BUDGET_OPTIONS = [
  { value: '', label: 'すべての予算帯' },
  { value: 'entry', label: 'エントリー (~15万円)' },
  { value: 'middle', label: 'ミドル (15~30万円)' },
  { value: 'high', label: 'ハイエンド (30万円~)' },
]

// 用途
const USE_CASE_OPTIONS = [
  { value: '', label: 'すべての用途' },
  { value: 'gaming', label: 'ゲーミング' },
  { value: 'creative', label: 'クリエイティブ' },
  { value: 'business', label: 'ビジネス' },
]

interface Preset {
  id: number
  name: string
  budget_range: string
  use_case: string
  total_price: number
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price)
}

function getBudgetLabel(budget: string): string {
  const found = BUDGET_OPTIONS.find((b) => b.value === budget)
  return found?.label || budget
}

function getUseCaseLabel(useCase: string): string {
  const found = USE_CASE_OPTIONS.find((u) => u.value === useCase)
  return found?.label || useCase
}

export default function AdminPresetsPage() {
  const { data: session } = useSession()
  const [presets, setPresets] = useState<Preset[]>([])
  const [loading, setLoading] = useState(true)
  const [budget, setBudget] = useState('')
  const [useCase, setUseCase] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Preset | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchPresets = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      })
      if (budget) params.append('budget', budget)
      if (useCase) params.append('use_case', useCase)

      const data = await api.get<ApiResponse<Preset[]>>(`/presets?${params}`)

      setPresets(data.data || [])
      setTotalPages(Math.ceil((data.meta?.total || 0) / (data.meta?.per_page || 20)))
    } catch (error) {
      console.error('プリセットの取得に失敗:', error)
    } finally {
      setLoading(false)
    }
  }, [page, budget, useCase])

  useEffect(() => {
    fetchPresets()
  }, [fetchPresets])

  const handleDelete = async () => {
    if (!deleteTarget || !session?.accessToken) return

    setDeleting(true)
    try {
      await api.delete(`/admin/presets/${deleteTarget.id}`, session.accessToken)
      setDeleteTarget(null)
      fetchPresets()
    } catch (error) {
      console.error('プリセットの削除に失敗:', error)
      alert('削除に失敗しました')
    } finally {
      setDeleting(false)
    }
  }

  if (loading && presets.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
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
        <h1 className="text-2xl font-bold text-gray-900">プリセット管理</h1>
        <Link href="/admin/presets/new">
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
            value={budget}
            onChange={(e) => {
              setBudget(e.target.value)
              setPage(1)
            }}
            options={BUDGET_OPTIONS}
          />
        </div>
        <div className="w-48">
          <Select
            value={useCase}
            onChange={(e) => {
              setUseCase(e.target.value)
              setPage(1)
            }}
            options={USE_CASE_OPTIONS}
          />
        </div>
      </div>

      {/* プリセット一覧 */}
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
                  予算帯
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用途
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  合計金額
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {presets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    プリセットが登録されていません
                  </td>
                </tr>
              ) : (
                presets.map((preset) => (
                  <tr key={preset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {preset.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{preset.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {getBudgetLabel(preset.budget_range)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {getUseCaseLabel(preset.use_case)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(preset.total_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/presets/${preset.id}`}>
                          <Button variant="secondary" size="sm">
                            編集
                          </Button>
                        </Link>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setDeleteTarget(preset)}
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
        title="プリセットを削除"
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
