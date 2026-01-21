'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { PartForm } from '../_components/PartForm'
import { api, ApiResponse } from '@/lib/api'

interface PartData {
  id: number
  category: string
  name: string
  maker: string
  price: number
  [key: string]: unknown
}

export default function EditPartPage({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || 'cpu'
  const [part, setPart] = useState<PartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  useEffect(() => {
    if (!resolvedParams) return

    async function fetchPart() {
      if (!resolvedParams) return
      try {
        const data = await api.get<ApiResponse<PartData>>(`/parts/${resolvedParams.id}?category=${category}`)
        setPart({
          ...data.data,
          category,
        })
      } catch (err) {
        console.error('パーツの取得に失敗:', err)
        setError('パーツが見つかりませんでした')
      } finally {
        setLoading(false)
      }
    }

    fetchPart()
  }, [resolvedParams, category])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (error || !part) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/parts"
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">エラー</h1>
        </div>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || 'パーツが見つかりませんでした'}
        </div>
      </div>
    )
  }

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
        <h1 className="text-2xl font-bold text-gray-900">パーツ編集</h1>
      </div>

      {/* フォーム */}
      <PartForm initialData={part} isEdit />
    </div>
  )
}
