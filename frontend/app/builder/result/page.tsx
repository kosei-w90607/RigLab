'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { api, ApiClientError } from '@/lib/api'
import { shareConfiguration } from '@/lib/share'
import { ScrollToTopButton } from '@/app/components/ui/ScrollToTopButton'
import { useToast } from '@/app/components/ui/Toast'

// APIレスポンス型（camelCase - api.tsで変換済み）
interface ApiPreset {
  id: number
  name: string
  budgetRange: string
  useCase: string
  totalPrice: number
  cpu: { id: number; name: string; maker: string; price: number } | null
  gpu: { id: number; name: string; maker: string; price: number } | null
  memory: { id: number; name: string; maker: string; price: number } | null
  storage1: { id: number; name: string; maker: string; price: number } | null
  os: { id: number; name: string; maker: string; price: number } | null
  motherboard: { id: number; name: string; maker: string; price: number } | null
  psu: { id: number; name: string; maker: string; price: number } | null
  case: { id: number; name: string; maker: string; price: number } | null
}

const budgetLabels: Record<string, string> = {
  under100k: '〜15万円',
  '100k-300k': '15〜30万円',
  over300k: '30万円〜',
  any: '指定なし',
}

const usageLabels: Record<string, string> = {
  gaming: 'ゲーム',
  creative: 'クリエイティブ',
  office: '事務・普段使い',
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

function PartRow({ label, part }: { label: string; part: { name: string; price: number } | null }) {
  if (!part) {
    return (
      <tr className="border-b border-gray-100">
        <td className="py-2 text-gray-500 dark:text-gray-400 w-24">{label}</td>
        <td className="py-2 text-gray-400">未設定</td>
        <td className="py-2 text-right text-gray-400">-</td>
      </tr>
    )
  }
  return (
    <tr className="border-b border-gray-100 dark:border-gray-700">
      <td className="py-2 text-gray-500 dark:text-gray-400 w-24">{label}</td>
      <td className="py-2 text-gray-900 dark:text-gray-100">{part.name}</td>
      <td className="py-2 text-right text-gray-600 dark:text-gray-400">{formatPrice(part.price)}</td>
    </tr>
  )
}

function PresetCard({ preset, index }: { preset: ApiPreset; index: number }) {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const router = useRouter()
  const { addToast } = useToast()
  const [isSharing, setIsSharing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleShare = async () => {
    setIsSharing(true)
    try {
      await shareConfiguration(
        {
          cpu_id: preset.cpu?.id,
          gpu_id: preset.gpu?.id,
          memory_id: preset.memory?.id,
          storage1_id: preset.storage1?.id,
          os_id: preset.os?.id,
          motherboard_id: preset.motherboard?.id,
          psu_id: preset.psu?.id,
          case_id: preset.case?.id,
        },
        preset.name,
        `${preset.name} - ${formatPrice(preset.totalPrice)}`
      )
      // Web Share APIがない環境ではクリップボードにコピー済み
      if (!navigator.share) {
        addToast({ type: 'success', message: 'URLをコピーしました' })
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        addToast({ type: 'error', message: `共有に失敗しました: ${err.message}` })
      }
    } finally {
      setIsSharing(false)
    }
  }

  const handleSave = async () => {
    if (!session?.accessToken) {
      // 未ログイン → ログインページへ
      window.location.href = `/signin?callbackUrl=${encodeURIComponent(window.location.href)}`
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        name: `${preset.name}（カスタム）`,
        parts: {
          cpu_id: preset.cpu?.id || null,
          gpu_id: preset.gpu?.id || null,
          memory_id: preset.memory?.id || null,
          storage1_id: preset.storage1?.id || null,
          os_id: preset.os?.id || null,
          motherboard_id: preset.motherboard?.id || null,
          psu_id: preset.psu?.id || null,
          case_id: preset.case?.id || null,
        },
      }
      await api.post('/builds', payload, session.accessToken)
      sessionStorage.setItem('flash', JSON.stringify({ type: 'success', message: '構成を保存しました' }))
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiClientError) {
        addToast({ type: 'error', message: `保存に失敗しました: ${err.message}` })
      } else {
        addToast({ type: 'error', message: '保存に失敗しました。ネットワーク接続を確認してください。' })
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card padding="lg" shadow="md" className="mb-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div>
          <Link href={`/builds/${preset.id}?type=preset`}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 cursor-pointer">
              {preset.name}
            </h2>
          </Link>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
            {usageLabels[preset.useCase] || preset.useCase}
          </span>
        </div>
        <div className="text-xl font-bold text-custom-blue">
          合計: {formatPrice(preset.totalPrice)}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
        <table className="w-full text-sm">
          <tbody>
            <PartRow label="CPU" part={preset.cpu} />
            <PartRow label="GPU" part={preset.gpu} />
            <PartRow label="Memory" part={preset.memory} />
            <PartRow label="Storage" part={preset.storage1} />
            <PartRow label="OS" part={preset.os} />
            <PartRow label="MB" part={preset.motherboard} />
            <PartRow label="電源" part={preset.psu} />
            <PartRow label="ケース" part={preset.case} />
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2 justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          isLoading={isSharing}
        >
          共有
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          isLoading={isSaving}
        >
          保存
        </Button>
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

  const [presets, setPresets] = useState<ApiPreset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPresets = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (budget && budget !== 'any') {
          // フロントエンドの予算キーをバックエンド形式（entry/middle/high）に変換
          const budgetMap: Record<string, string> = {
            under100k: 'entry',
            '100k-300k': 'middle',
            over300k: 'high',
          }
          params.set('budget', budgetMap[budget] || budget)
        }
        if (usages.length > 0) {
          params.set('use_case', usages[0]) // APIは現在単一のuse_caseのみ受付
        }

        const endpoint = `/presets?${params.toString()}`
        const response = await api.get<{ data: ApiPreset[] }>(endpoint)
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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          検索結果
        </h1>
        {conditionText && (
          <p className="text-gray-600 dark:text-gray-400 mb-8">{conditionText}</p>
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
            <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
              条件に合う構成が見つかりませんでした
            </p>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
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
      <ScrollToTopButton />
    </div>
  )
}
