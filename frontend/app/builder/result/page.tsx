'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Skeleton } from '@/app/components/ui/Skeleton'
import type { PcEntrustSet } from '@/types'
import { api, ApiClientError } from '@/lib/api'

const budgetLabels: Record<string, string> = {
  under100k: '〜10万円',
  '100k-300k': '10〜30万円',
  over300k: '30万円〜',
  any: '指定なし',
}

const usageLabels: Record<string, string> = {
  gaming: 'ゲーム',
  creative: 'クリエイティブ',
  office: '事務・普段使い',
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price)
}

function PresetCard({ preset, index }: { preset: PcEntrustSet; index: number }) {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const [isSharing, setIsSharing] = useState(false)

  const handleShare = async () => {
    setIsSharing(true)
    try {
      if (navigator.share) {
        await navigator.share({
          title: preset.name,
          text: `${preset.name} - ${formatPrice(preset.totalPrice)}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('URLをコピーしました')
      }
    } catch {
      // User cancelled share
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <Card padding="lg" shadow="md" className="mb-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          おすすめ構成 #{index + 1}
        </h3>
        <div className="text-xl font-bold text-custom-blue">
          合計: {formatPrice(preset.totalPrice)}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-4">
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-2 text-gray-500 w-24">CPU</td>
              <td className="py-2 text-gray-900">{preset.cpu.name}</td>
              <td className="py-2 text-right text-gray-600">{formatPrice(preset.cpu.price)}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 text-gray-500">GPU</td>
              <td className="py-2 text-gray-900">{preset.gpu.name}</td>
              <td className="py-2 text-right text-gray-600">{formatPrice(preset.gpu.price)}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 text-gray-500">Memory</td>
              <td className="py-2 text-gray-900">{preset.memory.name}</td>
              <td className="py-2 text-right text-gray-600">{formatPrice(preset.memory.price)}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 text-gray-500">Storage</td>
              <td className="py-2 text-gray-900">{preset.storage1.name}</td>
              <td className="py-2 text-right text-gray-600">{formatPrice(preset.storage1.price)}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-400 text-xs" colSpan={3}>
                + 自動推奨3点（MB/電源/ケース）
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href={`/builds/${preset.id}?type=preset`}>
          <Button variant="secondary" size="sm">
            詳細を見る
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          isLoading={isSharing}
        >
          共有
        </Button>
        {session && (
          <Button variant="ghost" size="sm">
            保存
          </Button>
        )}
      </div>
    </Card>
  )
}

function SkeletonCard() {
  return (
    <Card padding="lg" shadow="md" className="mb-4">
      <div className="flex justify-between mb-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-28" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </Card>
  )
}

export default function BuilderResultPage() {
  const searchParams = useSearchParams()
  const budget = searchParams.get('budget')
  const usagesParam = searchParams.get('usages')
  const usages = usagesParam ? usagesParam.split(',') : []

  const [presets, setPresets] = useState<PcEntrustSet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPresets = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (budget && budget !== 'any') {
          // Convert frontend budget key to backend format
          const budgetMap: Record<string, string> = {
            under100k: 'under_100k',
            '100k-300k': '100k_300k',
            over300k: 'over_300k',
          }
          params.set('budget_range', budgetMap[budget] || budget)
        }
        if (usages.length > 0) {
          params.set('use_case', usages[0]) // API accepts single use_case for now
        }

        const endpoint = `/presets?${params.toString()}`
        const response = await api.get<{ data: PcEntrustSet[] }>(endpoint)
        setPresets(response.data)
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

    fetchPresets()
  }, [budget, usagesParam])

  const conditionText = [
    usages.map((u) => usageLabels[u] || u).join('・'),
    budget && budget !== 'any' ? budgetLabels[budget] : null,
  ]
    .filter(Boolean)
    .join(' / ')

  return (
    <div className="flex-1 px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          検索結果
        </h1>
        {conditionText && (
          <p className="text-gray-600 mb-8">{conditionText}</p>
        )}

        {isLoading && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {error && (
          <Card padding="lg" shadow="sm" className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link href="/builder">
              <Button variant="secondary">条件を変更する</Button>
            </Link>
          </Card>
        )}

        {!isLoading && !error && presets.length === 0 && (
          <Card padding="lg" shadow="sm" className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-900 font-medium mb-2">
              条件に合う構成が見つかりませんでした
            </p>
            <p className="text-gray-500 mb-6">
              条件を変更して再度お試しください
            </p>
            <Link href="/builder">
              <Button variant="primary">条件を変更する</Button>
            </Link>
          </Card>
        )}

        {!isLoading && !error && presets.length > 0 && (
          <>
            {presets.map((preset, index) => (
              <PresetCard key={preset.id} preset={preset} index={index} />
            ))}

            <div className="text-center mt-8">
              <Link href="/builder">
                <Button variant="secondary">条件を変更する</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
