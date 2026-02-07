'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PartForm } from '../_components/PartForm'

export default function NewPartPage() {
  const searchParams = useSearchParams()

  // 楽天からのプリフィル対応
  const prefillName = searchParams.get('name')
  const prefillPrice = searchParams.get('price')
  const prefillCategory = searchParams.get('category')
  const prefillRakutenUrl = searchParams.get('rakuten_url')
  const prefillRakutenImageUrl = searchParams.get('rakuten_image_url')

  const initialData = prefillName ? {
    category: prefillCategory || 'cpu',
    name: prefillName,
    maker: '',
    price: prefillPrice ? parseInt(prefillPrice) : 0,
    rakuten_url: prefillRakutenUrl || '',
    rakuten_image_url: prefillRakutenImageUrl || '',
  } : undefined

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/parts"
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">パーツ新規登録</h1>
      </div>

      {/* フォーム */}
      <PartForm initialData={initialData} />
    </div>
  )
}
