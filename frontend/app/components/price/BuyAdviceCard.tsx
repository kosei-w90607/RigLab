'use client'

import type { BuyVerdict } from '@/types'

interface BuyAdviceCardProps {
  verdict: BuyVerdict
  message: string
  confidence: number
}

const VERDICT_CONFIG = {
  buy_now: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconColor: 'text-green-600',
    label: '買い時！',
    labelBg: 'bg-green-100 text-green-800',
  },
  wait: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-600',
    label: '待ちが賢明',
    labelBg: 'bg-red-100 text-red-800',
  },
  neutral: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    iconColor: 'text-gray-600',
    label: '様子見',
    labelBg: 'bg-gray-100 text-gray-800',
  },
}

export function BuyAdviceCard({ verdict, message, confidence }: BuyAdviceCardProps) {
  const config = VERDICT_CONFIG[verdict]

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} p-4`}>
      <div className="flex items-start gap-3">
        <div className={`text-3xl flex-shrink-0 ${config.iconColor}`}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="currentColor">
            <circle cx="18" cy="14" r="8" opacity="0.2" />
            <circle cx="18" cy="14" r="6" />
            <ellipse cx="18" cy="30" rx="10" ry="5" opacity="0.3" />
            <circle cx="15" cy="13" r="1" fill="white" />
            <circle cx="21" cy="13" r="1" fill="white" />
            <path d="M14 16 Q18 19 22 16" stroke="white" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${config.labelBg}`}>
              {config.label}
            </span>
            {confidence > 0 && (
              <span className="text-xs text-gray-400">
                信頼度 {Math.round(confidence * 100)}%
              </span>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}
