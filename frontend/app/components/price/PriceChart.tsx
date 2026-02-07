'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { PriceHistory } from '@/types'

interface PriceChartProps {
  histories: PriceHistory[]
  initialPrice?: number | null
}

function formatYen(value: number): string {
  return `¥${value.toLocaleString()}`
}

export function PriceChart({ histories, initialPrice }: PriceChartProps) {
  if (histories.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        価格データがありません
      </div>
    )
  }

  const data = histories.map((h) => ({
    date: new Date(h.fetchedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
    price: h.price,
  }))

  const prices = histories.map((h) => h.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const padding = Math.max(Math.round((maxPrice - minPrice) * 0.1), 1000)

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis
            tickFormatter={formatYen}
            tick={{ fontSize: 11 }}
            stroke="#9ca3af"
            domain={[minPrice - padding, maxPrice + padding]}
            width={70}
          />
          <Tooltip
            formatter={(value: number | undefined) => [value != null ? formatYen(value) : '', '価格']}
            labelStyle={{ color: '#374151' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          {initialPrice && (
            <ReferenceLine
              y={initialPrice}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{ value: '初回価格', position: 'right', fill: '#f59e0b', fontSize: 11 }}
            />
          )}
          <Area
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#priceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
