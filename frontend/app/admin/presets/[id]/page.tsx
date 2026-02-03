'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { PresetForm } from '../_components/PresetForm'
import { api, ApiResponse } from '@/lib/api'

interface PresetData {
  id: number
  name: string
  budgetRange: string
  useCase: string
  parts: {
    cpuId: number | null
    gpuId: number | null
    memoryId: number | null
    storage1Id: number | null
    storage2Id: number | null
    storage3Id: number | null
    motherboardId: number | null
    psuId: number | null
    caseId: number | null
    osId: number | null
  }
}

export default function EditPresetPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession()
  const [preset, setPreset] = useState<PresetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)

  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  useEffect(() => {
    if (!resolvedParams || !session?.accessToken) return

    async function fetchPreset() {
      if (!resolvedParams || !session?.accessToken) return
      try {
        const data = await api.get<ApiResponse<PresetData>>(
          `/admin/presets/${resolvedParams.id}`,
          session.accessToken
        )
        setPreset(data.data)
      } catch (err) {
        console.error('プリセットの取得に失敗:', err)
        setError('プリセットが見つかりませんでした')
      } finally {
        setLoading(false)
      }
    }

    fetchPreset()
  }, [resolvedParams, session?.accessToken])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-48" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error || !preset) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/presets"
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">エラー</h1>
        </div>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || 'プリセットが見つかりませんでした'}
        </div>
      </div>
    )
  }

  // APIレスポンスからフォーム用データに変換
  const formData = {
    id: preset.id,
    name: preset.name,
    budgetRange: preset.budgetRange,
    useCase: preset.useCase,
    cpuId: preset.parts.cpuId,
    gpuId: preset.parts.gpuId,
    memoryId: preset.parts.memoryId,
    storage1Id: preset.parts.storage1Id,
    storage2Id: preset.parts.storage2Id,
    motherboardId: preset.parts.motherboardId,
    psuId: preset.parts.psuId,
    caseId: preset.parts.caseId,
    osId: preset.parts.osId,
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/presets"
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">プリセット編集</h1>
      </div>

      {/* フォーム */}
      <PresetForm initialData={formData} isEdit />
    </div>
  )
}
