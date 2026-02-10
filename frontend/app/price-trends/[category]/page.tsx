'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { api } from '@/lib/api'
import { CategoryPriceChart } from '@/app/components/price-trends/CategoryPriceChart'

const CATEGORY_LABELS: Record<string, string> = {
  cpu: 'CPU', gpu: 'GPU', memory: 'メモリ', ssd: 'SSD', hdd: 'HDD', storage: 'ストレージ',
  motherboard: 'マザーボード', psu: '電源', case: 'ケース',
}

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
  rakutenUrl?: string | null
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

export default function CategoryDetailPage() {
  const params = useParams()
  const category = params.category as string
  const label = CATEGORY_LABELS[category] || category

  const [data, setData] = useState<CategoryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortKey>('change_7d')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await api.get<{ data: CategoryDetail }>(
          `/price_trends/categories/${category}?sort_by=${sortBy}&sort_order=${sortOrder}`
        )
        setData(res.data)
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [category, sortBy, sortOrder])

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder(key === 'price' ? 'asc' : 'asc')
    }
  }

  const sortIndicator = (key: SortKey) => {
    if (sortBy !== key) return ''
    return sortOrder === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 dark:bg-none dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/price-trends" className="hover:text-blue-600 dark:hover:text-blue-400">価格動向</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">{label}</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{label} 価格動向</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">過去30日間の価格推移</p>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-96 rounded-lg" />
          </div>
        ) : !data || data.parts.length === 0 ? (
          <Card padding="lg" shadow="sm" className="text-center py-12">
            <p className="text-gray-500">このカテゴリの価格データがありません</p>
            <Link href="/price-trends" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 inline-block">
              ← カテゴリ一覧に戻る
            </Link>
          </Card>
        ) : (
          <>
            {/* Category Price Chart */}
            {data.dailyAverages && data.dailyAverages.length > 1 && (
              <Card padding="md" shadow="sm" className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{label} 平均価格推移</h2>
                <div className="h-64">
                  <CategoryPriceChart data={data.dailyAverages} />
                </div>
              </Card>
            )}

            {/* Parts Table */}
            <Card padding="none" shadow="sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
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
                        className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link href={`/price-trends/${category}/${part.id}`} className="flex items-center gap-3 group">
                            {part.rakutenImageUrl && (
                              <img
                                src={part.rakutenImageUrl}
                                alt={part.name}
                                className="w-10 h-10 object-contain rounded flex-shrink-0"
                                loading="lazy"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="text-gray-900 dark:text-gray-100 font-medium truncate group-hover:text-blue-600">{part.name}</p>
                              {part.maker && <p className="text-xs text-gray-400">{part.maker}</p>}
                            </div>
                          </Link>
                        </td>
                        <td className="text-right px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
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
