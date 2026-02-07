'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'

type BudgetOption = 'under100k' | '100k-300k' | 'over300k' | 'any'
type UsageOption = 'gaming' | 'creative' | 'office'

const budgetOptions: { value: BudgetOption; label: string }[] = [
  { value: 'under100k', label: '〜15万円' },
  { value: '100k-300k', label: '15〜30万円' },
  { value: 'over300k', label: '30万円〜' },
  { value: 'any', label: '指定しない' },
]

const usageOptions: { value: UsageOption; label: string; description: string }[] = [
  { value: 'gaming', label: 'ゲーム', description: '高画質・高フレームレートでゲームを楽しむ' },
  { value: 'creative', label: 'クリエイティブ', description: '動画編集・配信・3DCG制作' },
  { value: 'office', label: '事務・普段使い', description: 'ブラウジング・オフィス作業' },
]

export default function BuilderPage() {
  const router = useRouter()
  const [budget, setBudget] = useState<BudgetOption | null>(null)
  const [usages, setUsages] = useState<UsageOption[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const toggleUsage = (usage: UsageOption) => {
    setUsages((prev) =>
      prev.includes(usage)
        ? prev.filter((u) => u !== usage)
        : [...prev, usage]
    )
  }

  const handleSubmit = () => {
    setIsLoading(true)
    const params = new URLSearchParams()
    if (budget) params.set('budget', budget)
    if (usages.length > 0) params.set('usages', usages.join(','))
    router.push(`/builder/result?${params.toString()}`)
  }

  const isValid = budget !== null || usages.length > 0

  return (
    <div className="flex-1 px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          おまかせ構成
        </h1>
        <p className="text-gray-600 mb-8">
          予算と用途を選択すると、最適なPC構成を提案します
        </p>

        {/* 予算選択 */}
        <Card padding="lg" shadow="sm" className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">予算を選択</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {budgetOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setBudget(option.value)}
                className={`
                  px-4 py-3 rounded-lg border-2 text-sm font-medium
                  transition-colors duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-custom-blue focus-visible:ring-offset-2
                  ${
                    budget === option.value
                      ? 'border-custom-blue bg-custom-blue bg-opacity-10 text-custom-blue'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
                aria-pressed={budget === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Card>

        {/* 用途選択 */}
        <Card padding="lg" shadow="sm" className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">用途を選択</h2>
          <p className="text-sm text-gray-500 mb-4">複数選択できます</p>
          <div className="space-y-3">
            {usageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleUsage(option.value)}
                className={`
                  w-full px-4 py-4 rounded-lg border-2 text-left
                  transition-colors duration-200
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-custom-blue focus-visible:ring-offset-2
                  ${
                    usages.includes(option.value)
                      ? 'border-custom-blue bg-custom-blue bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                aria-pressed={usages.includes(option.value)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center
                      ${
                        usages.includes(option.value)
                          ? 'border-custom-blue bg-custom-blue'
                          : 'border-gray-300'
                      }
                    `}
                  >
                    {usages.includes(option.value) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* 検索ボタン */}
        <div className="text-center">
          <Button
            variant="primary"
            size="lg"
            onClick={handleSubmit}
            disabled={!isValid}
            isLoading={isLoading}
            className="min-w-[200px]"
          >
            {isLoading ? '検索中...' : '構成を探す'}
          </Button>
          {!isValid && (
            <p className="mt-2 text-sm text-gray-500">
              予算または用途を選択してください
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
