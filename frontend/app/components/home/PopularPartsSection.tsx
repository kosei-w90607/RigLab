'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { api } from '@/lib/api'

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`
}

interface PartItem {
  id: number
  name: string
  maker: string
  price: number
  rakutenUrl?: string | null
  rakutenImageUrl?: string | null
}

const CATEGORIES = [
  { key: 'cpu', label: 'CPU' },
  { key: 'gpu', label: 'GPU' },
  { key: 'memory', label: 'メモリ' },
] as const

export function PopularPartsSection() {
  const [activeCategory, setActiveCategory] = useState<string>('cpu')
  const [parts, setParts] = useState<PartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true)
      try {
        const res = await api.get<{ data: PartItem[] }>(`/parts?category=${activeCategory}&per_page=6`)
        setParts(res.data || [])
      } catch {
        setParts([])
      } finally {
        setLoading(false)
      }
    }
    fetchParts()
  }, [activeCategory])

  return (
    <section className="w-full max-w-4xl px-4 mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">人気パーツ</h2>

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

      {/* Parts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : parts.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">パーツが登録されていません</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {parts.map((part) => (
            <Card key={part.id} padding="md" shadow="sm" hoverable>
              <p className="text-xs text-gray-400 mb-1">{part.maker}</p>
              <p className="text-sm font-bold text-gray-900 truncate" title={part.name}>{part.name}</p>
              <p className="text-lg font-bold text-custom-blue mt-2">{formatPrice(part.price)}</p>
              {part.rakutenUrl && (
                <a
                  href={part.rakutenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-red-600 hover:text-red-800"
                >
                  楽天で見る →
                </a>
              )}
            </Card>
          ))}
        </div>
      )}

      <div className="text-center mt-4">
        <Link href="/configurator" className="text-sm text-blue-600 hover:text-blue-800">
          もっと見る →
        </Link>
      </div>
    </section>
  )
}
