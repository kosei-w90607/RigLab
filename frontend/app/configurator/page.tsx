'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Select } from '@/app/components/ui/Select'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { Modal } from '@/app/components/ui/Modal'
import { Input } from '@/app/components/ui/Input'
import type {
  PartsCpu,
  PartsGpu,
  PartsMemory,
  PartsStorage,
  PartsOs,
  PartsMotherboard,
  PartsPsu,
  PartsCase,
} from '@/types'
import { api, ApiClientError } from '@/lib/api'

// API response types for edit mode
interface ApiPart {
  id: number
  name: string
  maker: string
  price: number
}

interface ApiPartEntry {
  category: string
  part: ApiPart
}

interface ApiBuildDetail {
  id: number
  name: string
  total_price: number
  share_token: string
  parts: ApiPartEntry[]
  user: { id: number; name: string } | null
  created_at: string
  updated_at: string
}

interface PartsData {
  cpus: PartsCpu[]
  gpus: PartsGpu[]
  memories: PartsMemory[]
  storages: PartsStorage[]
  oses: PartsOs[]
}

interface SelectedParts {
  cpu: PartsCpu | null
  gpu: PartsGpu | null
  memory: PartsMemory | null
  storage1: PartsStorage | null
  storage2: PartsStorage | null
  storage3: PartsStorage | null
  os: PartsOs | null
}

interface RecommendedParts {
  motherboard: PartsMotherboard | null
  psu: PartsPsu | null
  case: PartsCase | null
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price)
}

function PartSelectSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i}>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}

export default function ConfiguratorPage() {
  const sessionResult = useSession()
  const session = sessionResult?.data
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [parts, setParts] = useState<PartsData | null>(null)
  const [selected, setSelected] = useState<SelectedParts>({
    cpu: null,
    gpu: null,
    memory: null,
    storage1: null,
    storage2: null,
    storage3: null,
    os: null,
  })
  const [recommended, setRecommended] = useState<RecommendedParts>({
    motherboard: null,
    psu: null,
    case: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingBuild, setIsLoadingBuild] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [buildName, setBuildName] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Fetch all parts on mount
  useEffect(() => {
    const fetchParts = async () => {
      try {
        const [cpuRes, gpuRes, memoryRes, storageRes, osRes] = await Promise.all([
          api.get<{ data: PartsCpu[] }>('/parts?category=cpu'),
          api.get<{ data: PartsGpu[] }>('/parts?category=gpu'),
          api.get<{ data: PartsMemory[] }>('/parts?category=memory'),
          api.get<{ data: PartsStorage[] }>('/parts?category=storage'),
          api.get<{ data: PartsOs[] }>('/parts?category=os'),
        ])

        setParts({
          cpus: cpuRes.data,
          gpus: gpuRes.data,
          memories: memoryRes.data,
          storages: storageRes.data,
          oses: osRes.data,
        })
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message)
        } else {
          setError('パーツの取得に失敗しました')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchParts()
  }, [])

  // Fetch existing build when editing
  useEffect(() => {
    const fetchBuildForEdit = async () => {
      if (!editId || !parts || !session?.accessToken) return

      setIsLoadingBuild(true)
      try {
        const response = await api.get<{ data: ApiBuildDetail }>(
          `/builds/${editId}`,
          session.accessToken
        )
        const buildData = response.data

        // Set build name
        setBuildName(buildData.name)

        // Build a map of parts by category from API response
        const partsByCategory: Record<string, ApiPart[]> = {}
        for (const entry of buildData.parts) {
          if (!partsByCategory[entry.category]) {
            partsByCategory[entry.category] = []
          }
          partsByCategory[entry.category].push(entry.part)
        }

        // Find and set selected parts from the loaded parts lists
        const findPart = <T extends { id: number }>(list: T[], apiPart: ApiPart | undefined): T | null => {
          if (!apiPart) return null
          return list.find(p => p.id === apiPart.id) || null
        }

        const storageParts = partsByCategory['storage'] || []

        setSelected({
          cpu: findPart(parts.cpus, partsByCategory['cpu']?.[0]),
          gpu: findPart(parts.gpus, partsByCategory['gpu']?.[0]),
          memory: findPart(parts.memories, partsByCategory['memory']?.[0]),
          storage1: findPart(parts.storages, storageParts[0]),
          storage2: findPart(parts.storages, storageParts[1]),
          storage3: findPart(parts.storages, storageParts[2]),
          os: findPart(parts.oses, partsByCategory['os']?.[0]),
        })
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message)
        } else {
          setError('構成の取得に失敗しました')
        }
      } finally {
        setIsLoadingBuild(false)
      }
    }

    fetchBuildForEdit()
  }, [editId, parts, session?.accessToken])

  // Fetch recommended parts when CPU or Memory changes
  const fetchRecommendations = useCallback(async () => {
    if (!selected.cpu || !selected.memory) {
      setRecommended({ motherboard: null, psu: null, case: null })
      return
    }

    try {
      const response = await api.get<{
        motherboard: PartsMotherboard
        psu: PartsPsu
        case: PartsCase
      }>(`/parts/recommendations?cpu_id=${selected.cpu.id}&memory_id=${selected.memory.id}${selected.gpu ? `&gpu_id=${selected.gpu.id}` : ''}`)

      setRecommended({
        motherboard: response.motherboard,
        psu: response.psu,
        case: response.case,
      })
    } catch {
      // Recommendations are optional, don't show error
      setRecommended({ motherboard: null, psu: null, case: null })
    }
  }, [selected.cpu, selected.memory, selected.gpu])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  const handleSelect = (key: keyof SelectedParts, id: string) => {
    if (!parts) return

    const partLists: Record<keyof SelectedParts, Array<{ id: number }>> = {
      cpu: parts.cpus,
      gpu: parts.gpus,
      memory: parts.memories,
      storage1: parts.storages,
      storage2: parts.storages,
      storage3: parts.storages,
      os: parts.oses,
    }

    const list = partLists[key]
    const part = id ? list.find((p) => p.id === Number(id)) : null
    setSelected((prev) => ({ ...prev, [key]: part ?? null }))
  }

  const totalPrice =
    (selected.cpu?.price || 0) +
    (selected.gpu?.price || 0) +
    (selected.memory?.price || 0) +
    (selected.storage1?.price || 0) +
    (selected.storage2?.price || 0) +
    (selected.storage3?.price || 0) +
    (selected.os?.price || 0) +
    (recommended.motherboard?.price || 0) +
    (recommended.psu?.price || 0) +
    (recommended.case?.price || 0)

  const canSave = selected.cpu && selected.gpu && selected.memory && selected.storage1 && selected.os

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const params = new URLSearchParams()
      if (selected.cpu) params.set('cpu', String(selected.cpu.id))
      if (selected.gpu) params.set('gpu', String(selected.gpu.id))
      if (selected.memory) params.set('memory', String(selected.memory.id))
      if (selected.storage1) params.set('storage1', String(selected.storage1.id))
      if (selected.storage2) params.set('storage2', String(selected.storage2.id))
      if (selected.storage3) params.set('storage3', String(selected.storage3.id))
      if (selected.os) params.set('os', String(selected.os.id))

      const shareUrl = `${window.location.origin}/share?${params.toString()}`

      if (navigator.share) {
        await navigator.share({
          title: 'RigLab - カスタム構成',
          text: `カスタムPC構成 - ${formatPrice(totalPrice)}`,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        alert('URLをコピーしました')
      }
    } catch {
      // User cancelled share
    } finally {
      setIsSharing(false)
    }
  }

  const handleSave = async () => {
    if (!canSave || !buildName.trim()) return

    setIsSaving(true)
    try {
      const payload = {
        name: buildName,
        parts: {
          cpu_id: selected.cpu!.id,
          gpu_id: selected.gpu!.id,
          memory_id: selected.memory!.id,
          storage1_id: selected.storage1!.id,
          storage2_id: selected.storage2?.id,
          storage3_id: selected.storage3?.id,
          os_id: selected.os!.id,
        },
      }

      if (editId) {
        // Update existing build
        await api.put<{ data: { id: number } }>(
          `/builds/${editId}`,
          payload,
          session?.accessToken
        )
      } else {
        // Create new build
        await api.post<{ data: { id: number } }>(
          '/builds',
          payload,
          session?.accessToken
        )
      }

      setShowSaveModal(false)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiClientError) {
        alert(err.message)
      } else {
        alert('保存に失敗しました')
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <Card padding="lg" shadow="md" className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            再読み込み
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 px-4 py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {editId ? '構成を編集' : 'カスタム構成'}
        </h1>
        <p className="text-gray-600 mb-8">
          {editId
            ? '保存済みの構成を編集しています'
            : 'パーツを自由に選んで、あなただけのPC構成を作成しましょう'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Parts Selection */}
          <div className="lg:col-span-2">
            <Card padding="lg" shadow="sm">
              <h2 className="text-lg font-bold text-gray-900 mb-6">パーツ選択</h2>

              {isLoading ? (
                <PartSelectSkeleton />
              ) : parts ? (
                <div className="space-y-4">
                  <Select
                    label="CPU"
                    value={selected.cpu?.id?.toString() || ''}
                    onChange={(e) => handleSelect('cpu', e.target.value)}
                    options={[
                      { value: '', label: '選択してください' },
                      ...parts.cpus.map((p) => ({
                        value: p.id.toString(),
                        label: `${p.name} - ${formatPrice(p.price)}`,
                      })),
                    ]}
                  />

                  <Select
                    label="GPU"
                    value={selected.gpu?.id?.toString() || ''}
                    onChange={(e) => handleSelect('gpu', e.target.value)}
                    options={[
                      { value: '', label: '選択してください' },
                      ...parts.gpus.map((p) => ({
                        value: p.id.toString(),
                        label: `${p.name} - ${formatPrice(p.price)}`,
                      })),
                    ]}
                  />

                  <Select
                    label="Memory"
                    value={selected.memory?.id?.toString() || ''}
                    onChange={(e) => handleSelect('memory', e.target.value)}
                    options={[
                      { value: '', label: '選択してください' },
                      ...parts.memories.map((p) => ({
                        value: p.id.toString(),
                        label: `${p.name} - ${formatPrice(p.price)}`,
                      })),
                    ]}
                  />

                  <Select
                    label="Storage (1)"
                    value={selected.storage1?.id?.toString() || ''}
                    onChange={(e) => handleSelect('storage1', e.target.value)}
                    options={[
                      { value: '', label: '選択してください' },
                      ...parts.storages.map((p) => ({
                        value: p.id.toString(),
                        label: `${p.name} - ${formatPrice(p.price)}`,
                      })),
                    ]}
                  />

                  <Select
                    label="Storage (2) - 任意"
                    value={selected.storage2?.id?.toString() || ''}
                    onChange={(e) => handleSelect('storage2', e.target.value)}
                    options={[
                      { value: '', label: '選択しない' },
                      ...parts.storages.map((p) => ({
                        value: p.id.toString(),
                        label: `${p.name} - ${formatPrice(p.price)}`,
                      })),
                    ]}
                  />

                  <Select
                    label="Storage (3) - 任意"
                    value={selected.storage3?.id?.toString() || ''}
                    onChange={(e) => handleSelect('storage3', e.target.value)}
                    options={[
                      { value: '', label: '選択しない' },
                      ...parts.storages.map((p) => ({
                        value: p.id.toString(),
                        label: `${p.name} - ${formatPrice(p.price)}`,
                      })),
                    ]}
                  />

                  <Select
                    label="OS"
                    value={selected.os?.id?.toString() || ''}
                    onChange={(e) => handleSelect('os', e.target.value)}
                    options={[
                      { value: '', label: '選択してください' },
                      ...parts.oses.map((p) => ({
                        value: p.id.toString(),
                        label: `${p.name} - ${formatPrice(p.price)}`,
                      })),
                    ]}
                  />
                </div>
              ) : null}
            </Card>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card padding="lg" shadow="sm" className="sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">構成サマリー</h2>

              {/* Selected Parts */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">選択パーツ</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">CPU:</dt>
                    <dd className="text-gray-900 truncate ml-2 max-w-[150px]" title={selected.cpu?.name}>
                      {selected.cpu?.name || '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">GPU:</dt>
                    <dd className="text-gray-900 truncate ml-2 max-w-[150px]" title={selected.gpu?.name}>
                      {selected.gpu?.name || '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Memory:</dt>
                    <dd className="text-gray-900 truncate ml-2 max-w-[150px]" title={selected.memory?.name}>
                      {selected.memory?.name || '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Storage1:</dt>
                    <dd className="text-gray-900 truncate ml-2 max-w-[150px]" title={selected.storage1?.name}>
                      {selected.storage1?.name || '-'}
                    </dd>
                  </div>
                  {selected.storage2 && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Storage2:</dt>
                      <dd className="text-gray-900 truncate ml-2 max-w-[150px]" title={selected.storage2?.name}>
                        {selected.storage2.name}
                      </dd>
                    </div>
                  )}
                  {selected.storage3 && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Storage3:</dt>
                      <dd className="text-gray-900 truncate ml-2 max-w-[150px]" title={selected.storage3?.name}>
                        {selected.storage3.name}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-500">OS:</dt>
                    <dd className="text-gray-900 truncate ml-2 max-w-[150px]" title={selected.os?.name}>
                      {selected.os?.name || '-'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Recommended Parts */}
              {(recommended.motherboard || recommended.psu || recommended.case) && (
                <div className="mb-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">自動推奨</h3>
                  <dl className="space-y-1 text-sm">
                    {recommended.motherboard && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">MB:</dt>
                        <dd className="text-gray-900 truncate ml-2 max-w-[150px]" title={recommended.motherboard.name}>
                          {recommended.motherboard.name}
                        </dd>
                      </div>
                    )}
                    {recommended.psu && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">電源:</dt>
                        <dd className="text-gray-900 truncate ml-2 max-w-[150px]" title={recommended.psu.name}>
                          {recommended.psu.name}
                        </dd>
                      </div>
                    )}
                    {recommended.case && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">ケース:</dt>
                        <dd className="text-gray-900 truncate ml-2 max-w-[150px]" title={recommended.case.name}>
                          {recommended.case.name}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Total Price */}
              <div className="pt-4 border-t border-gray-200 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">合計:</span>
                  <span className="text-xl font-bold text-custom-blue">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleShare}
                  isLoading={isSharing}
                  disabled={!canSave}
                >
                  共有する
                </Button>
                {session ? (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => setShowSaveModal(true)}
                    disabled={!canSave || isLoadingBuild}
                  >
                    {editId ? 'この構成を更新' : 'この構成を保存'}
                  </Button>
                ) : (
                  <p className="text-xs text-gray-500 text-center">
                    保存するにはログインが必要です
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Save Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title={editId ? '構成を更新' : '構成を保存'}
      >
        <div className="space-y-4">
          <Input
            label="構成名"
            value={buildName}
            onChange={(e) => setBuildName(e.target.value)}
            placeholder="マイゲーミングPC"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
              キャンセル
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={isSaving}
              disabled={!buildName.trim()}
            >
              {editId ? '更新する' : '保存する'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
