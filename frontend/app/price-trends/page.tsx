'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { api } from '@/lib/api'
import { CategoryPriceChart } from '@/app/components/price-trends/CategoryPriceChart'

const CATEGORIES = [
  { key: 'cpu', label: 'CPU' },
  { key: 'gpu', label: 'GPU' },
  { key: 'memory', label: 'メモリ' },
  { key: 'ssd', label: 'SSD' },
  { key: 'hdd', label: 'HDD' },
  { key: 'motherboard', label: 'マザーボード' },
  { key: 'psu', label: '電源' },
  { key: 'case', label: 'ケース' },
] as const

interface PartWithTrend {
  id: number
  name: string
  maker?: string
  currentPrice: number
  priceDiff7d?: number
  priceDiff30d?: number
  changePercent7d?: number
  changePercent30d?: number
  rakutenImageUrl?: string | null
}

interface CategoryDetail {
  category: string
  label: string
  parts: PartWithTrend[]
  dailyAverages?: { date: string; avgPrice: number }[]
}

type SortKey = 'price' | 'change_7d' | 'change_30d'
type SortOrder = 'asc' | 'desc'

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`
}

function formatDiff(diff: number | undefined | null): string {
  if (diff == null) return '-'
  const sign = diff < 0 ? '' : '+'
  return `${sign}¥${diff.toLocaleString()}`
}

function formatPercent(pct: number | undefined | null): string {
  if (pct == null) return '-'
  return `${pct > 0 ? '+' : ''}${pct}%`
}

export default function PriceTrendsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('cpu')
  const [data, setData] = useState<CategoryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortKey>('price')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const fetchCategoryDetail = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<{ data: CategoryDetail }>(
        `/price_trends/categories/${activeCategory}?sort_by=${sortBy}&sort_order=${sortOrder}`
      )
      setData(res.data)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [activeCategory, sortBy, sortOrder])

  useEffect(() => {
    fetchCategoryDetail()
  }, [fetchCategoryDetail])

  const handleCategoryChange = (key: string) => {
    setActiveCategory(key)
    setSortBy('price')
    setSortOrder('asc')
  }

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  const sortIndicator = (key: SortKey) => {
    if (sortBy !== key) return ''
    return sortOrder === 'asc' ? ' ↑' : ' ↓'
  }

  const categoryLabel = CATEGORIES.find(c => c.key === activeCategory)?.label || activeCategory

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">価格動向</h1>
        <p className="text-sm text-gray-500 mb-6">PCパーツの価格推移をカテゴリ別にチェック</p>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                activeCategory === cat.key
                  ? 'bg-custom-blue text-white font-bold'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-96 rounded-lg" />
          </div>
        ) : !data ? (
          <Card padding="lg" shadow="sm" className="text-center py-12">
            <p className="text-gray-500">{categoryLabel}のデータを取得できませんでした</p>
          </Card>
        ) : data.parts.length === 0 ? (
          <Card padding="lg" shadow="sm" className="text-center py-12">
            <p className="text-gray-500">{categoryLabel}の登録パーツがありません</p>
            <p className="text-sm text-gray-400 mt-2">
              管理画面からパーツを登録すると、ここに価格推移が表示されます
            </p>
          </Card>
        ) : (
          <>
            {/* Category Price Chart */}
            {data.dailyAverages && data.dailyAverages.length > 1 && (
              <Card padding="md" shadow="sm" className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{categoryLabel} 平均価格推移</h2>
                <div className="h-64">
                  <CategoryPriceChart data={data.dailyAverages} />
                </div>
              </Card>
            )}

            {/* Parts Table */}
            <Card padding="none" shadow="sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">パーツ</th>
                      <th
                        className="text-right px-4 py-3 text-gray-600 font-medium cursor-pointer hover:text-blue-600"
                        onClick={() => toggleSort('price')}
                      >
                        現在価格{sortIndicator('price')}
                      </th>
                      <th
                        className="text-right px-4 py-3 text-gray-600 font-medium cursor-pointer hover:text-blue-600"
                        onClick={() => toggleSort('change_7d')}
                      >
                        先週比{sortIndicator('change_7d')}
                      </th>
                      <th
                        className="text-right px-4 py-3 text-gray-600 font-medium cursor-pointer hover:text-blue-600"
                        onClick={() => toggleSort('change_30d')}
                      >
                        先月比{sortIndicator('change_30d')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.parts.map((part) => (
                      <tr
                        key={part.id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link href={`/price-trends/${activeCategory}/${part.id}`} className="flex items-center gap-3 group">
                            {part.rakutenImageUrl && (
                              <img
                                src={part.rakutenImageUrl}
                                alt={part.name}
                                className="w-10 h-10 object-contain rounded flex-shrink-0"
                                loading="lazy"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="text-gray-900 font-medium truncate group-hover:text-blue-600">{part.name}</p>
                              {part.maker && <p className="text-xs text-gray-400">{part.maker}</p>}
                            </div>
                          </Link>
                        </td>
                        <td className="text-right px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {formatPrice(part.currentPrice)}
                        </td>
                        <td className="text-right px-4 py-3 whitespace-nowrap">
                          <div className={`font-medium ${
                            (part.priceDiff7d ?? 0) < 0 ? 'text-green-600' :
                            (part.priceDiff7d ?? 0) > 0 ? 'text-red-600' :
                            'text-gray-400'
                          }`}>
                            {formatDiff(part.priceDiff7d)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatPercent(part.changePercent7d)}
                          </div>
                        </td>
                        <td className="text-right px-4 py-3 whitespace-nowrap">
                          <div className={`font-medium ${
                            (part.priceDiff30d ?? 0) < 0 ? 'text-green-600' :
                            (part.priceDiff30d ?? 0) > 0 ? 'text-red-600' :
                            'text-gray-400'
                          }`}>
                            {formatDiff(part.priceDiff30d)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatPercent(part.changePercent30d)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
