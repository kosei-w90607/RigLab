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
  budget_range: string
  use_case: string
  parts: {
    cpu_id: number | null
    gpu_id: number | null
    memory_id: number | null
    storage1_id: number | null
    storage2_id: number | null
    storage3_id: number | null
    motherboard_id: number | null
    psu_id: number | null
    case_id: number | null
    os_id: number | null
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
    budget_range: preset.budget_range,
    use_case: preset.use_case,
    cpu_id: preset.parts.cpu_id,
    gpu_id: preset.parts.gpu_id,
    memory_id: preset.parts.memory_id,
    storage1_id: preset.parts.storage1_id,
    storage2_id: preset.parts.storage2_id,
    motherboard_id: preset.parts.motherboard_id,
    psu_id: preset.parts.psu_id,
    case_id: preset.parts.case_id,
    os_id: preset.parts.os_id,
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
