'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { api } from '@/lib/api'
import { PartPriceChart } from '@/app/components/price-trends/PartPriceChart'

const CATEGORY_LABELS: Record<string, string> = {
  cpu: 'CPU', gpu: 'GPU', memory: 'メモリ', ssd: 'SSD', hdd: 'HDD', storage: 'ストレージ',
  motherboard: 'マザーボード', psu: '電源', case: 'ケース',
}

const CONFIGURATOR_PARAM_MAP: Record<string, string> = {
  cpu: 'cpu', gpu: 'gpu', memory: 'memory',
  ssd: 'storage1', hdd: 'storage1', storage: 'storage1',
  motherboard: 'motherboard', psu: 'psu', case: 'case',
}

interface PriceHistoryData {
  partType: string
  partId: number
  partName: string
  currentPrice: number
  initialPrice: number | null
  priceSinceLaunch: number | null
  rakutenUrl: string | null
  rakutenImageUrl: string | null
  priceDiff7d?: number | null
  priceDiff30d?: number | null
  histories: { price: number; source: string; fetchedAt: string }[]
  trend: {
    direction: string
    changePercent: number
    minPrice: number
    maxPrice: number
    avgPrice: number
  } | null
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`
}

function formatDiff(diff: number | undefined | null): string {
  if (diff == null) return '-'
  const sign = diff < 0 ? '' : '+'
  return `${sign}¥${diff.toLocaleString()}`
}

export default function PartDetailPage() {
  const params = useParams()
  const category = params.category as string
  const partId = params.partId as string
  const categoryLabel = CATEGORY_LABELS[category] || category

  const [data, setData] = useState<PriceHistoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await api.get<{ data: PriceHistoryData }>(
          `/parts/${category}/${partId}/price_histories?days=${days}`
        )
        setData(res.data)
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [category, partId, days])

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 dark:bg-none dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/price-trends" className="hover:text-blue-600 dark:hover:text-blue-400">価格動向</Link>
          <span className="mx-2">/</span>
          <Link href={`/price-trends/${category}`} className="hover:text-blue-600 dark:hover:text-blue-400">{categoryLabel}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">{data?.partName || 'パーツ詳細'}</span>
        </nav>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2 rounded" />
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        ) : !data ? (
          <Card padding="lg" shadow="sm" className="text-center py-12">
            <p className="text-gray-500">価格データが見つかりません</p>
            <Link href={`/price-trends/${category}`} className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 inline-block">
              ← {categoryLabel}一覧に戻る
            </Link>
          </Card>
        ) : (
          <>
            {/* Part Header */}
            <div className="flex items-start gap-6 mb-8">
              {data.rakutenImageUrl && (
                <div className="flex-shrink-0 w-24 h-24 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2">
                  <img
                    src={data.rakutenImageUrl}
                    alt={data.partName}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <span className="text-xs font-medium text-gray-400">{categoryLabel}</span>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{data.partName}</h1>
                <p className="text-3xl font-bold text-custom-blue mt-2">{formatPrice(data.currentPrice)}</p>
              </div>
            </div>

            {/* Period Toggle */}
            <div className="flex gap-2 mb-4">
              {[30, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                    days === d
                      ? 'bg-custom-blue text-white font-bold'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {d}日間
                </button>
              ))}
            </div>

            {/* Price Chart */}
            {data.histories.length > 1 && (
              <Card padding="md" shadow="sm" className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">価格推移グラフ</h2>
                <div className="h-72">
                  <PartPriceChart histories={data.histories} />
                </div>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              <Card padding="sm" shadow="sm">
                <p className="text-xs text-gray-400">現在価格</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatPrice(data.currentPrice)}</p>
              </Card>
              {data.trend && (
                <>
                  <Card padding="sm" shadow="sm">
                    <p className="text-xs text-gray-400">最安値</p>
                    <p className="text-lg font-bold text-green-600">{formatPrice(data.trend.minPrice)}</p>
                  </Card>
                  <Card padding="sm" shadow="sm">
                    <p className="text-xs text-gray-400">最高値</p>
                    <p className="text-lg font-bold text-red-600">{formatPrice(data.trend.maxPrice)}</p>
                  </Card>
                  <Card padding="sm" shadow="sm">
                    <p className="text-xs text-gray-400">平均価格</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{formatPrice(data.trend.avgPrice)}</p>
                  </Card>
                </>
              )}
              <Card padding="sm" shadow="sm">
                <p className="text-xs text-gray-400">先週比</p>
                <p className={`text-lg font-bold ${
                  (data.priceDiff7d ?? 0) < 0 ? 'text-green-600' :
                  (data.priceDiff7d ?? 0) > 0 ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {formatDiff(data.priceDiff7d)}
                </p>
              </Card>
              <Card padding="sm" shadow="sm">
                <p className="text-xs text-gray-400">先月比</p>
                <p className={`text-lg font-bold ${
                  (data.priceDiff30d ?? 0) < 0 ? 'text-green-600' :
                  (data.priceDiff30d ?? 0) > 0 ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {formatDiff(data.priceDiff30d)}
                </p>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link href={`/configurator?${CONFIGURATOR_PARAM_MAP[category] || category}=${partId}`}>
                <Button variant="primary" size="lg">
                  このパーツで構成を組む →
                </Button>
              </Link>
              {data.rakutenUrl && (
                <a href={data.rakutenUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="lg">
                    楽天で見る →
                  </Button>
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
