'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { api } from '@/lib/api'
import type { BuyAdviceSummary } from '@/types'

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`
}

interface CategoryTrend {
  category: string
  label: string
  avgChangePercent: number
  direction: 'up' | 'down' | 'stable'
  partCount: number
}

interface PriceChange {
  partType: string
  partId: number
  partName: string
  currentPrice: number
  changePercent: number
}

const CATEGORY_LABELS: Record<string, string> = {
  cpu: 'CPU', gpu: 'GPU', memory: 'メモリ', storage: 'ストレージ',
  os: 'OS', motherboard: 'マザーボード', psu: '電源', case: 'ケース',
}

function TrendBadge({ direction, percent }: { direction: string; percent: number }) {
  const color = direction === 'down' ? 'text-green-600' : direction === 'up' ? 'text-red-600' : 'text-gray-500'
  const arrow = direction === 'down' ? '↓' : direction === 'up' ? '↑' : '→'
  return (
    <span className={`text-sm font-bold ${color}`}>
      {percent > 0 ? '+' : ''}{percent}% {arrow}
    </span>
  )
}

export function PriceTrendsSection() {
  const [trends, setTrends] = useState<CategoryTrend[]>([])
  const [drops, setDrops] = useState<PriceChange[]>([])
  const [rises, setRises] = useState<PriceChange[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'drops' | 'rises'>('drops')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<{ data: BuyAdviceSummary }>('/buy_advice/summary')
        setTrends(res.data.categoryTrends || [])
        setDrops(res.data.biggestDrops || [])
        setRises(res.data.biggestRises || [])
      } catch {
        // データなし
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const hasTrends = trends.length > 0
  const hasChanges = drops.length > 0 || rises.length > 0
  if (!loading && !hasTrends && !hasChanges) return null

  const activeList = activeTab === 'drops' ? drops : rises

  return (
    <section className="w-full max-w-4xl px-4 mb-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">最新価格動向</h2>
      <p className="text-xs text-gray-400 mb-6">過去30日間のデータに基づく</p>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-lg" />
        </div>
      ) : (
        <>
          {/* Category Summary Cards */}
          {hasTrends && (
            <>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">カテゴリ別 価格トレンド</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {trends
                  .filter((t) => ['cpu', 'gpu', 'memory', 'storage'].includes(t.category))
                  .map((t) => (
                    <Link key={t.category} href={`/price-trends/${t.category}`}>
                      <Card padding="sm" shadow="sm" hoverable>
                        <p className="text-xs text-gray-400 mb-1">{CATEGORY_LABELS[t.category] || t.label}</p>
                        <TrendBadge direction={t.direction} percent={t.avgChangePercent} />
                        <p className="text-xs text-gray-400 mt-1">{t.partCount}製品</p>
                      </Card>
                    </Link>
                  ))}
              </div>
            </>
          )}

          {/* Drops / Rises Tabs */}
          {hasChanges && (
            <Card padding="md" shadow="sm">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('drops')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    activeTab === 'drops'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-bold'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  値下がりTOP5
                </button>
                <button
                  onClick={() => setActiveTab('rises')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    activeTab === 'rises'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 font-bold'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  値上がりTOP5
                </button>
              </div>

              {activeList.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">データがありません</p>
              ) : (
                <div className="space-y-2">
                  {activeList.map((item, idx) => (
                    <Link
                      key={`${item.partType}-${item.partId}`}
                      href={`/price-trends/${item.partType}/${item.partId}`}
                      className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 rounded px-1 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-gray-400 w-4">{idx + 1}</span>
                        <div className="min-w-0">
                          <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{item.partName}</p>
                          <span className="text-xs text-gray-400">{CATEGORY_LABELS[item.partType] || item.partType}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatPrice(item.currentPrice)}</p>
                        <span className={`text-xs font-bold ${item.changePercent < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.changePercent > 0 ? '+' : ''}{item.changePercent}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          )}

          <div className="text-center mt-4">
            <Link href="/price-trends" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              価格動向をもっと見る →
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
