'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { api } from '@/lib/api'
import { MiniTrendChart } from '@/app/components/price-trends/MiniTrendChart'

interface CategorySummary {
  category: string
  label: string
  avgChangePercent: number
  direction: 'up' | 'down' | 'stable'
  partCount: number
  avgPrice?: number
  dailyAverages?: { date: string; avgPrice: number }[]
}

const CATEGORY_ORDER = ['cpu', 'gpu', 'memory', 'storage', 'motherboard', 'psu', 'case']

function TrendIcon({ direction }: { direction: string }) {
  if (direction === 'down') return <span className="text-green-600 text-lg">↓</span>
  if (direction === 'up') return <span className="text-red-600 text-lg">↑</span>
  return <span className="text-gray-400 text-lg">→</span>
}

export default function PriceTrendsPage() {
  const [categories, setCategories] = useState<CategorySummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<{ data: { categories: CategorySummary[] } }>('/price_trends/categories')
        setCategories(res.data.categories || [])
      } catch {
        // フォールバック: buy_advice/summary から取得
        try {
          const res = await api.get<{ data: { categoryTrends: CategorySummary[] } }>('/buy_advice/summary')
          setCategories(res.data.categoryTrends || [])
        } catch {
          setCategories([])
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const sortedCategories = categories.sort(
    (a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category)
  )

  return (
    <div className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">価格分析</h1>
        <p className="text-sm text-gray-500 mb-8">PCパーツの価格推移をカテゴリ別にチェック</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-36 rounded-lg" />
            ))}
          </div>
        ) : sortedCategories.length === 0 ? (
          <Card padding="lg" shadow="sm" className="text-center py-12">
            <p className="text-gray-500">価格データがまだありません</p>
            <p className="text-sm text-gray-400 mt-2">パーツの価格を取得すると、ここにトレンドが表示されます</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedCategories.map((cat) => (
              <Link key={cat.category} href={`/price-trends/${cat.category}`}>
                <Card padding="md" shadow="sm" hoverable className="h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{cat.label}</h2>
                      <p className="text-xs text-gray-400">{cat.partCount}製品</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendIcon direction={cat.direction} />
                      <span className={`text-sm font-bold ${
                        cat.direction === 'down' ? 'text-green-600' :
                        cat.direction === 'up' ? 'text-red-600' :
                        'text-gray-500'
                      }`}>
                        {cat.avgChangePercent > 0 ? '+' : ''}{cat.avgChangePercent}%
                      </span>
                    </div>
                  </div>

                  {/* Mini Sparkline Chart */}
                  {cat.dailyAverages && cat.dailyAverages.length > 1 && (
                    <div className="h-12 mt-2">
                      <MiniTrendChart
                        data={cat.dailyAverages}
                        direction={cat.direction}
                      />
                    </div>
                  )}

                  {cat.avgPrice != null && (
                    <p className="text-xs text-gray-400 mt-2">
                      平均価格: ¥{cat.avgPrice.toLocaleString()}
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
