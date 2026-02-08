'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { api } from '@/lib/api'

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`
}

interface RankingItem {
  rank?: number
  name: string
  price: number
  url?: string
  imageUrl?: string | null
  shopName?: string
  reviewCount?: number
  reviewAverage?: number
}

const CATEGORIES = [
  { key: 'cpu', label: 'CPU' },
  { key: 'gpu', label: 'GPU' },
  { key: 'memory', label: 'メモリ' },
  { key: 'storage', label: 'ストレージ' },
  { key: 'motherboard', label: 'マザーボード' },
  { key: 'psu', label: '電源' },
  { key: 'case', label: 'ケース' },
] as const

function StarRating({ average }: { average: number }) {
  return (
    <span className="text-xs text-yellow-500" title={`${average}/5`}>
      {'★'.repeat(Math.round(average))}
      <span className="text-gray-300">{'★'.repeat(5 - Math.round(average))}</span>
    </span>
  )
}

export function RankingSection() {
  const [activeCategory, setActiveCategory] = useState<string>('cpu')
  const [items, setItems] = useState<RankingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true)
      setError(false)
      try {
        const res = await api.get<{ data: { items: RankingItem[] } }>(
          `/rankings?category=${activeCategory}`
        )
        setItems(res.data.items || [])
      } catch {
        setError(true)
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchRanking()
  }, [activeCategory])

  return (
    <section className="w-full max-w-4xl px-4 mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-1">売れ筋ランキング</h2>
      <p className="text-xs text-gray-400 mb-6">楽天市場の売れ筋データに基づく</p>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
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

      {/* Ranking List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <Card padding="lg" shadow="sm" className="text-center py-8">
          <p className="text-sm text-gray-400">ランキングデータを取得できませんでした</p>
          <p className="text-xs text-gray-300 mt-1">楽天APIの設定を確認してください</p>
        </Card>
      ) : items.length === 0 ? (
        <Card padding="lg" shadow="sm" className="text-center py-8">
          <p className="text-sm text-gray-400">ランキングデータがありません</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 10).map((item, idx) => (
            <Card key={idx} padding="sm" shadow="sm" hoverable>
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                  idx === 1 ? 'bg-gray-200 text-gray-600' :
                  idx === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-50 text-gray-500'
                }`}>
                  {item.rank || idx + 1}
                </div>

                {/* Image */}
                {item.imageUrl && (
                  <div className="flex-shrink-0 w-14 h-14">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-contain rounded"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-bold text-custom-blue">{formatPrice(item.price)}</span>
                    {item.reviewAverage != null && item.reviewAverage > 0 && (
                      <span className="flex items-center gap-1">
                        <StarRating average={item.reviewAverage} />
                        {item.reviewCount != null && (
                          <span className="text-xs text-gray-400">({item.reviewCount})</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Link to price trends */}
                <Link
                  href={`/price-trends/${activeCategory}`}
                  className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                >
                  価格推移 →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
