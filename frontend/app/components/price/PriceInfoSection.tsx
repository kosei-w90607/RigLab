'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/app/components/ui/Card'
import { PriceChart } from './PriceChart'
import { BuyAdviceCard } from './BuyAdviceCard'
import { ExternalLinkBadge } from './ExternalLinkBadge'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { api } from '@/lib/api'
import type { PriceHistoryResponse, BuyAdvice } from '@/types'

interface PriceInfoSectionProps {
  partType: string
  partId: number
  defaultExpanded?: boolean
}

function formatYen(price: number): string {
  return `¥${price.toLocaleString()}`
}

export function PriceInfoSection({ partType, partId, defaultExpanded = false }: PriceInfoSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [priceData, setPriceData] = useState<PriceHistoryResponse | null>(null)
  const [advice, setAdvice] = useState<BuyAdvice | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!expanded) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [priceRes, adviceRes] = await Promise.all([
          api.get<{ data: PriceHistoryResponse }>(`/parts/${partType}/${partId}/price_histories`),
          api.get<{ data: BuyAdvice }>(`/parts/${partType}/${partId}/buy_advice`),
        ])
        setPriceData(priceRes.data)
        setAdvice(adviceRes.data)
      } catch {
        // データなしの場合は表示しない
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [expanded, partType, partId])

  return (
    <div className="mt-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        価格情報
      </button>

      {expanded && (
        <Card padding="md" shadow="sm" className="mt-2">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-48" />
              <Skeleton className="h-16" />
            </div>
          ) : priceData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500">現在価格</span>
                  <p className="text-lg font-bold text-custom-blue">
                    {formatYen(priceData.currentPrice)}
                  </p>
                </div>
                {priceData.trend && (
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      priceData.trend.direction === 'down' ? 'text-green-600' :
                      priceData.trend.direction === 'up' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {priceData.trend.changePercent > 0 ? '+' : ''}
                      {priceData.trend.changePercent}%
                    </span>
                    <p className="text-xs text-gray-400">30日間</p>
                  </div>
                )}
              </div>

              <PriceChart
                histories={priceData.histories}
                initialPrice={priceData.initialPrice}
              />

              {advice && (
                <BuyAdviceCard
                  verdict={advice.verdict}
                  message={advice.message}
                  confidence={advice.confidence}
                />
              )}

              <ExternalLinkBadge
                rakutenUrl={priceData.rakutenUrl}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              価格データがありません
            </p>
          )}
        </Card>
      )}
    </div>
  )
}
