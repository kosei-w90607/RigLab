'use client'

import { ResponsiveContainer, AreaChart, Area } from 'recharts'

interface MiniTrendChartProps {
  data: { date: string; avgPrice: number }[]
  direction: string
}

export function MiniTrendChart({ data, direction }: MiniTrendChartProps) {
  const color = direction === 'down' ? '#16a34a' : direction === 'up' ? '#dc2626' : '#9ca3af'

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <Area
          type="monotone"
          dataKey="avgPrice"
          stroke={color}
          fill={color}
          fillOpacity={0.1}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
