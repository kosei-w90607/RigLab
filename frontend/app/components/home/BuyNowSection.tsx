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

function formatPriceDiff(diff: number): string {
  const sign = diff < 0 ? '' : '+'
  return `${sign}¥${diff.toLocaleString()}`
}

interface BuyDeal {
  partType: string
  partId: number
  partName: string
  currentPrice: number
  changePercent: number
  priceDiff?: number
  verdict: string
  message: string
}

const CATEGORY_LABELS: Record<string, string> = {
  cpu: 'CPU', gpu: 'GPU', memory: 'メモリ', storage: 'ストレージ',
  os: 'OS', motherboard: 'マザーボード', psu: '電源', case: 'ケース',
}

export function BuyNowSection() {
  const [deals, setDeals] = useState<BuyDeal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await api.get<{ data: BuyAdviceSummary }>('/buy_advice/summary')
        setDeals(res.data.bestDeals || [])
      } catch {
        // データなし時は非表示
      } finally {
        setLoading(false)
      }
    }
    fetchDeals()
  }, [])

  if (!loading && deals.length === 0) return null

  return (
    <section className="w-full max-w-4xl px-4 mb-12">
      <div className="flex items-center gap-2 mb-1">
        <svg width="28" height="28" viewBox="0 0 36 36" fill="currentColor" className="text-green-600">
          <circle cx="18" cy="14" r="8" opacity="0.2" />
          <circle cx="18" cy="14" r="6" />
          <circle cx="15" cy="13" r="1" fill="white" />
          <circle cx="21" cy="13" r="1" fill="white" />
          <path d="M14 16 Q18 19 22 16" stroke="white" strokeWidth="1.5" fill="none" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900">注目の値下がりパーツ</h2>
      </div>
      <p className="text-xs text-gray-400 mb-6">過去7日間の価格変動</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deals.map((deal) => (
            <Link key={`${deal.partType}-${deal.partId}`} href={`/price-trends/${deal.partType}/${deal.partId}`}>
              <Card padding="md" shadow="sm" hoverable>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-gray-400">
                      {CATEGORY_LABELS[deal.partType] || deal.partType}
                    </span>
                    <p className="text-sm font-bold text-gray-900 truncate">{deal.partName}</p>
                    <p className="text-lg font-bold text-custom-blue mt-1">
                      {formatPrice(deal.currentPrice)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 ml-2">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800">
                      {deal.changePercent}%
                    </span>
                    {deal.priceDiff != null && deal.priceDiff !== 0 && (
                      <span className="text-xs text-green-600 mt-1">
                        {formatPriceDiff(deal.priceDiff)} (先週比)
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{deal.message}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="text-center mt-4">
        <Link href="/price-trends" className="text-sm text-blue-600 hover:text-blue-800">
          価格分析をもっと見る →
        </Link>
      </div>
    </section>
  )
}
