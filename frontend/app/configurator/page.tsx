'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
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
import { calculateRecommendedPsuWattage } from '@/lib/psu-calculator'
import { shareConfiguration } from '@/lib/share'
import { useToast } from '@/app/components/ui/Toast'
import { SpecComparisonSection } from '@/app/components/configurator/SpecComparison'

// 編集モード用のAPIレスポンス型
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
  totalPrice: number
  shareToken: string
  parts: ApiPartEntry[]
  user: { id: number; name: string } | null
  createdAt: string
  updatedAt: string
}

interface PartsData {
  cpus: PartsCpu[]
  gpus: PartsGpu[]
  memories: PartsMemory[]
  storages: PartsStorage[]
  oses: PartsOs[]
  motherboards: PartsMotherboard[]
  psus: PartsPsu[]
  cases: PartsCase[]
}

interface SelectedParts {
  cpu: PartsCpu | null
  gpu: PartsGpu | null
  memory: PartsMemory | null
  storage1: PartsStorage | null
  storage2: PartsStorage | null
  storage3: PartsStorage | null
  os: PartsOs | null
  motherboard: PartsMotherboard | null
  psu: PartsPsu | null
  case: PartsCase | null
}

// フィルタリングされたパーツリスト（互換性に基づく）
interface FilteredPartsData {
  memories: PartsMemory[]
  motherboards: PartsMotherboard[]
  cases: PartsCase[]
}

function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(price)) {
    return '¥0'
  }
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
  const { addToast } = useToast()

  // URLパラメータからパーツIDを取得（共有URLからのカスタマイズ用）
  const cpuIdParam = searchParams.get('cpu')
  const gpuIdParam = searchParams.get('gpu')
  const memoryIdParam = searchParams.get('memory')
  const storage1IdParam = searchParams.get('storage1')
  const storage2IdParam = searchParams.get('storage2')
  const storage3IdParam = searchParams.get('storage3')
  const osIdParam = searchParams.get('os')
  const motherboardIdParam = searchParams.get('motherboard')
  const psuIdParam = searchParams.get('psu')
  const caseIdParam = searchParams.get('case')

  const [parts, setParts] = useState<PartsData | null>(null)
  const [selected, setSelected] = useState<SelectedParts>({
    cpu: null,
    gpu: null,
    memory: null,
    storage1: null,
    storage2: null,
    storage3: null,
    os: null,
    motherboard: null,
    psu: null,
    case: null,
  })
  // フィルタリングされたパーツリスト
  const [filteredParts, setFilteredParts] = useState<FilteredPartsData>({
    memories: [],
    motherboards: [],
    cases: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingBuild, setIsLoadingBuild] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [buildName, setBuildName] = useState('')
  const [error, setError] = useState<string | null>(null)

  // マウント時に全パーツを取得
  useEffect(() => {
    const fetchParts = async () => {
      try {
        const [cpuRes, gpuRes, memoryRes, storageRes, osRes, motherboardRes, psuRes, caseRes] = await Promise.all([
          api.get<{ data: PartsCpu[] }>('/parts?category=cpu'),
          api.get<{ data: PartsGpu[] }>('/parts?category=gpu'),
          api.get<{ data: PartsMemory[] }>('/parts?category=memory'),
          api.get<{ data: PartsStorage[] }>('/parts?category=storage'),
          api.get<{ data: PartsOs[] }>('/parts?category=os'),
          api.get<{ data: PartsMotherboard[] }>('/parts?category=motherboard'),
          api.get<{ data: PartsPsu[] }>('/parts?category=psu'),
          api.get<{ data: PartsCase[] }>('/parts?category=case'),
        ])

        setParts({
          cpus: cpuRes.data,
          gpus: gpuRes.data,
          memories: memoryRes.data,
          storages: storageRes.data,
          oses: osRes.data,
          motherboards: motherboardRes.data,
          psus: psuRes.data,
          cases: caseRes.data,
        })

        // 初期状態ではフィルタリングなしで全パーツを表示
        setFilteredParts({
          memories: memoryRes.data,
          motherboards: motherboardRes.data,
          cases: caseRes.data,
        })
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(`パーツの取得に失敗しました（${err.status}: ${err.message}）`)
        } else if (err instanceof TypeError) {
          setError('サーバーに接続できません。しばらくしてから再試行してください。')
        } else {
          setError('パーツの取得に失敗しました')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchParts()
  }, [])

  // URLパラメータから選択状態を初期化（共有URLからのカスタマイズ用）
  useEffect(() => {
    // editモードの場合は既存の処理を優先
    if (!parts || editId) return

    // sessionStorageに保存済み状態がある場合はURLパラメータ復元をスキップ
    // （sessionStorage復元を優先するため）
    if (sessionStorage.getItem('pendingBuildConfig')) return

    // URLパラメータがない場合は何もしない
    const hasParams = cpuIdParam || gpuIdParam || memoryIdParam || storage1IdParam || osIdParam || motherboardIdParam || psuIdParam || caseIdParam
    if (!hasParams) return

    const initialSelected: SelectedParts = { ...selected }

    if (cpuIdParam) {
      const cpu = parts.cpus.find(p => p.id === parseInt(cpuIdParam))
      if (cpu) initialSelected.cpu = cpu
    }
    if (gpuIdParam) {
      const gpu = parts.gpus.find(p => p.id === parseInt(gpuIdParam))
      if (gpu) initialSelected.gpu = gpu
    }
    if (memoryIdParam) {
      const memory = parts.memories.find(p => p.id === parseInt(memoryIdParam))
      if (memory) initialSelected.memory = memory
    }
    if (storage1IdParam) {
      const storage = parts.storages.find(p => p.id === parseInt(storage1IdParam))
      if (storage) initialSelected.storage1 = storage
    }
    if (storage2IdParam) {
      const storage = parts.storages.find(p => p.id === parseInt(storage2IdParam))
      if (storage) initialSelected.storage2 = storage
    }
    if (storage3IdParam) {
      const storage = parts.storages.find(p => p.id === parseInt(storage3IdParam))
      if (storage) initialSelected.storage3 = storage
    }
    if (osIdParam) {
      const os = parts.oses.find(p => p.id === parseInt(osIdParam))
      if (os) initialSelected.os = os
    }
    if (motherboardIdParam) {
      const motherboard = parts.motherboards.find(p => p.id === parseInt(motherboardIdParam))
      if (motherboard) initialSelected.motherboard = motherboard
    }
    if (psuIdParam) {
      const psu = parts.psus.find(p => p.id === parseInt(psuIdParam))
      if (psu) initialSelected.psu = psu
    }
    if (caseIdParam) {
      const pcCase = parts.cases.find(p => p.id === parseInt(caseIdParam))
      if (pcCase) initialSelected.case = pcCase
    }

    setSelected(initialSelected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts, editId])

  // sessionStorageから保存済み状態を復元（ログイン後のリダイレクト用）
  useEffect(() => {
    // partsのみ必要（ログイン完了前でも復元可能にする）
    if (!parts) return

    const savedConfig = sessionStorage.getItem('pendingBuildConfig')
    if (!savedConfig) return

    try {
      const config = JSON.parse(savedConfig)
      const restoredSelected: SelectedParts = {
        cpu: null,
        gpu: null,
        memory: null,
        storage1: null,
        storage2: null,
        storage3: null,
        os: null,
        motherboard: null,
        psu: null,
        case: null,
      }

      if (config.cpu_id) {
        restoredSelected.cpu = parts.cpus.find(p => p.id === config.cpu_id) || null
      }
      if (config.gpu_id) {
        restoredSelected.gpu = parts.gpus.find(p => p.id === config.gpu_id) || null
      }
      if (config.memory_id) {
        restoredSelected.memory = parts.memories.find(p => p.id === config.memory_id) || null
      }
      if (config.storage1_id) {
        restoredSelected.storage1 = parts.storages.find(p => p.id === config.storage1_id) || null
      }
      if (config.storage2_id) {
        restoredSelected.storage2 = parts.storages.find(p => p.id === config.storage2_id) || null
      }
      if (config.storage3_id) {
        restoredSelected.storage3 = parts.storages.find(p => p.id === config.storage3_id) || null
      }
      if (config.os_id) {
        restoredSelected.os = parts.oses.find(p => p.id === config.os_id) || null
      }
      if (config.motherboard_id) {
        restoredSelected.motherboard = parts.motherboards.find(p => p.id === config.motherboard_id) || null
      }
      if (config.psu_id) {
        restoredSelected.psu = parts.psus.find(p => p.id === config.psu_id) || null
      }
      if (config.case_id) {
        restoredSelected.case = parts.cases.find(p => p.id === config.case_id) || null
      }

      setSelected(restoredSelected)

      // 復元後はクリア
      sessionStorage.removeItem('pendingBuildConfig')
    } catch {
      // パースエラー時は無視
      sessionStorage.removeItem('pendingBuildConfig')
    }
  }, [parts])

  // 編集時に既存の構成を取得
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

        // 構成名を設定
        setBuildName(buildData.name)

        // APIレスポンスからカテゴリ別のパーツマップを構築
        const partsByCategory: Record<string, ApiPart[]> = {}
        for (const entry of buildData.parts) {
          if (!partsByCategory[entry.category]) {
            partsByCategory[entry.category] = []
          }
          partsByCategory[entry.category].push(entry.part)
        }

        // 読み込んだパーツリストから選択パーツを検索・設定
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
          motherboard: findPart(parts.motherboards, partsByCategory['motherboard']?.[0]),
          psu: findPart(parts.psus, partsByCategory['psu']?.[0]),
          case: findPart(parts.cases, partsByCategory['case']?.[0]),
        })
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(`構成の取得に失敗しました（${err.status}: ${err.message}）`)
        } else if (err instanceof TypeError) {
          setError('サーバーに接続できません。しばらくしてから再試行してください。')
        } else {
          setError('構成の取得に失敗しました')
        }
      } finally {
        setIsLoadingBuild(false)
      }
    }

    fetchBuildForEdit()
  }, [editId, parts, session?.accessToken])

  // CPU選択時にメモリをフィルタリング
  useEffect(() => {
    if (!parts) return

    const cpu = selected.cpu

    if (!cpu) {
      // CPU未選択時は全メモリを表示
      setFilteredParts(prev => ({
        ...prev,
        memories: parts.memories,
      }))
      return
    }

    // CPUのメモリタイプをパース（カンマ区切りの場合あり: "DDR4,DDR5"）
    const cpuMemoryTypes = cpu.memoryType.split(',')

    // CPUのメモリタイプに合うメモリをフィルタリング
    const filteredMemories = parts.memories.filter(
      m => cpuMemoryTypes.includes(m.memoryType)
    )

    setFilteredParts(prev => ({
      ...prev,
      memories: filteredMemories,
    }))

    // CPUを変更した場合、互換性のないメモリをリセット
    if (selected.memory && !cpuMemoryTypes.includes(selected.memory.memoryType)) {
      setSelected(prev => ({ ...prev, memory: null }))
    }
  }, [selected.cpu, parts])

  // CPU/メモリ選択時にマザーボードをフィルタリング
  useEffect(() => {
    if (!parts) return

    const cpu = selected.cpu
    const memory = selected.memory

    if (!cpu) {
      // CPU未選択時は全マザーボードを表示
      setFilteredParts(prev => ({
        ...prev,
        motherboards: parts.motherboards,
      }))
      return
    }

    // CPUのメモリタイプをパース
    const cpuMemoryTypes = cpu.memoryType.split(',')

    // マザーボードのフィルタリング条件
    // 1. CPUソケットが一致
    // 2. メモリが選択されている場合: そのメモリタイプと一致
    //    メモリが未選択の場合: CPU対応のメモリタイプのいずれかと一致
    const targetMemoryType = memory ? memory.memoryType : null

    const filteredMotherboards = parts.motherboards.filter(mb => {
      // ソケット一致は必須
      if (mb.socket !== cpu.socket) return false

      // メモリタイプのチェック
      if (targetMemoryType) {
        // メモリが選択されている場合、そのタイプと完全一致
        return mb.memoryType === targetMemoryType
      } else {
        // メモリ未選択の場合、CPU対応のいずれかと一致
        return cpuMemoryTypes.includes(mb.memoryType)
      }
    })

    setFilteredParts(prev => ({
      ...prev,
      motherboards: filteredMotherboards,
    }))

    // メモリを変更した場合、互換性のないマザーボードをリセット
    if (selected.motherboard) {
      const mbMemoryType = selected.motherboard.memoryType
      const isSocketOk = selected.motherboard.socket === cpu.socket
      const isMemoryTypeOk = targetMemoryType
        ? mbMemoryType === targetMemoryType
        : cpuMemoryTypes.includes(mbMemoryType)

      if (!isSocketOk || !isMemoryTypeOk) {
        setSelected(prev => ({ ...prev, motherboard: null }))
      }
    }
  }, [selected.cpu, selected.memory, parts])

  // GPU選択時にケースをフィルタリング
  useEffect(() => {
    if (!parts) return

    const gpu = selected.gpu
    const motherboard = selected.motherboard

    if (!gpu && !motherboard) {
      // GPU/マザボ未選択時は全ケースを表示
      setFilteredParts(prev => ({
        ...prev,
        cases: parts.cases,
      }))
      return
    }

    let filteredCases = parts.cases

    // GPUの長さに対応するケースをフィルタリング
    if (gpu && gpu.lengthMm) {
      filteredCases = filteredCases.filter(
        c => c.maxGpuLengthMm >= gpu.lengthMm
      )
    }

    // マザーボードのフォームファクタに対応するケースをフィルタリング
    if (motherboard) {
      filteredCases = filteredCases.filter(c => {
        // ケースのフォームファクタがマザーボードに対応しているか
        switch (c.formFactor) {
          case 'ATX':
            return ['ATX', 'mATX', 'ITX'].includes(motherboard.formFactor)
          case 'mATX':
            return ['mATX', 'ITX'].includes(motherboard.formFactor)
          case 'ITX':
            return motherboard.formFactor === 'ITX'
          default:
            return true
        }
      })
    }

    setFilteredParts(prev => ({
      ...prev,
      cases: filteredCases,
    }))

    // 互換性のないケースをリセット
    if (selected.case) {
      const isCompatible = filteredCases.some(c => c.id === selected.case?.id)
      if (!isCompatible) {
        setSelected(prev => ({ ...prev, case: null }))
      }
    }
  }, [selected.gpu, selected.motherboard, parts])

  // CPU/GPU変更時にPSUをリセット（推奨ワット数が変わる場合）
  useEffect(() => {
    if (!parts || !selected.psu) return

    const cpu = selected.cpu
    const gpu = selected.gpu

    // CPU/GPUのどちらかが未選択なら検証不可 → PSUは保持（UIで無効化済み）
    if (!cpu || !gpu) return

    // 推奨ワット数を計算
    const recommendedWattage = calculateRecommendedPsuWattage(cpu.tdp, gpu.tdp)

    // 選択中のPSUが推奨を満たさなければリセット
    if (selected.psu.wattage < recommendedWattage) {
      setSelected(prev => ({ ...prev, psu: null }))
    }
  }, [selected.cpu, selected.gpu, parts])


  const handleSelect = (key: keyof SelectedParts, id: string) => {
    if (!parts) return

    const partLists: Record<keyof SelectedParts, Array<{ id: number }>> = {
      cpu: parts.cpus,
      gpu: parts.gpus,
      memory: filteredParts.memories,
      storage1: parts.storages,
      storage2: parts.storages,
      storage3: parts.storages,
      os: parts.oses,
      motherboard: filteredParts.motherboards,
      psu: parts.psus,
      case: filteredParts.cases,
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
    (selected.motherboard?.price || 0) +
    (selected.psu?.price || 0) +
    (selected.case?.price || 0)

  const canSave = selected.cpu && selected.gpu && selected.memory && selected.storage1 && selected.os

  const handleShare = async () => {
    setIsSharing(true)
    try {
      await shareConfiguration(
        {
          cpu_id: selected.cpu?.id,
          gpu_id: selected.gpu?.id,
          memory_id: selected.memory?.id,
          storage1_id: selected.storage1?.id,
          storage2_id: selected.storage2?.id,
          storage3_id: selected.storage3?.id,
          os_id: selected.os?.id,
          motherboard_id: selected.motherboard?.id,
          psu_id: selected.psu?.id,
          case_id: selected.case?.id,
        },
        'RigLab - カスタム構成',
        `カスタムPC構成 - ${formatPrice(totalPrice)}`
      )
      // Web Share APIがない環境ではクリップボードにコピー済み
      if (!navigator.share) {
        addToast({ type: 'success', message: 'URLをコピーしました' })
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        addToast({ type: 'error', message: `共有URLの生成に失敗しました: ${err.message}` })
      }
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
          motherboard_id: selected.motherboard?.id,
          psu_id: selected.psu?.id,
          case_id: selected.case?.id,
        },
      }

      if (editId) {
        // 既存の構成を更新
        await api.put<{ data: { id: number } }>(
          `/builds/${editId}`,
          payload,
          session?.accessToken
        )
      } else {
        // 新規構成を作成
        await api.post<{ data: { id: number } }>(
          '/builds',
          payload,
          session?.accessToken
        )
      }

      setShowSaveModal(false)
      const flashMessage = editId ? '構成を更新しました' : '構成を保存しました'
      sessionStorage.setItem('flash', JSON.stringify({ type: 'success', message: flashMessage }))
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiClientError) {
        addToast({ type: 'error', message: `保存に失敗しました: ${err.message}` })
      } else {
        addToast({ type: 'error', message: '保存に失敗しました。ネットワーク接続を確認してください。' })
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <Card padding="lg" shadow="md" className="text-center max-w-md">
          <p role="alert" className="text-red-600 mb-4">{error}</p>
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
        {editId && (
          <Link href="/dashboard" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ダッシュボードに戻る
          </Link>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {editId ? '構成を編集' : 'カスタム構成'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {editId
            ? '保存済みの構成を編集しています'
            : 'パーツを自由に選んで、あなただけのPC構成を作成しましょう'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* パーツ選択 */}
          <div className="lg:col-span-2">
            <Card padding="lg" shadow="sm">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">パーツ選択</h2>

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
                    label={`Memory${selected.cpu ? ` (${selected.cpu.memoryType.replace(',', '/')}対応)` : ''}`}
                    value={selected.memory?.id?.toString() || ''}
                    onChange={(e) => handleSelect('memory', e.target.value)}
                    options={[
                      { value: '', label: selected.cpu ? '選択してください' : 'CPUを先に選択してください' },
                      ...filteredParts.memories.map((p) => ({
                        value: p.id.toString(),
                        label: `${p.name} (${p.memoryType}) - ${formatPrice(p.price)}`,
                      })),
                    ]}
                    disabled={!selected.cpu}
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

                  {/* セパレーター - 互換性依存パーツ */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      以下のパーツは選択状況に応じて有効化されます
                    </p>
                  </div>

                  {/* Motherboard: CPU + Memory 選択後に有効 */}
                  {(() => {
                    const canSelectMb = selected.cpu && selected.memory
                    const mbHint = !selected.cpu
                      ? 'CPUを先に選択してください'
                      : !selected.memory
                      ? 'メモリを先に選択してください'
                      : '選択してください'
                    const mbLabel = canSelectMb
                      ? `Motherboard (${selected.cpu!.socket} / ${selected.memory!.memoryType})`
                      : 'Motherboard'
                    return (
                      <Select
                        label={mbLabel}
                        value={selected.motherboard?.id?.toString() || ''}
                        onChange={(e) => handleSelect('motherboard', e.target.value)}
                        options={[
                          { value: '', label: mbHint },
                          ...filteredParts.motherboards.map((p) => ({
                            value: p.id.toString(),
                            label: `${p.name} (${p.formFactor}) - ${formatPrice(p.price)}`,
                          })),
                        ]}
                        disabled={!canSelectMb}
                      />
                    )
                  })()}

                  {/* PSU: CPU + GPU 選択後に有効、推奨ワット数を表示 */}
                  {(() => {
                    const canSelectPsu = selected.cpu && selected.gpu
                    const recommendedWattage = canSelectPsu
                      ? calculateRecommendedPsuWattage(selected.cpu!.tdp, selected.gpu!.tdp)
                      : null
                    const psuHint = !selected.cpu
                      ? 'CPUを先に選択してください'
                      : !selected.gpu
                      ? 'GPUを先に選択してください'
                      : '選択してください'
                    const psuLabel = recommendedWattage
                      ? `電源 (PSU) - 推奨: ${recommendedWattage}W以上`
                      : '電源 (PSU)'
                    // 推奨ワット数以上のPSUのみ表示（選択可能時）
                    const filteredPsus = canSelectPsu
                      ? parts.psus.filter(p => p.wattage >= recommendedWattage!)
                      : parts.psus
                    return (
                      <Select
                        label={psuLabel}
                        value={selected.psu?.id?.toString() || ''}
                        onChange={(e) => handleSelect('psu', e.target.value)}
                        options={[
                          { value: '', label: psuHint },
                          ...filteredPsus.map((p) => ({
                            value: p.id.toString(),
                            label: `${p.name} (${p.wattage}W) - ${formatPrice(p.price)}`,
                          })),
                        ]}
                        disabled={!canSelectPsu}
                      />
                    )
                  })()}

                  {/* Case: Motherboard + GPU 選択後に有効 */}
                  {(() => {
                    const canSelectCase = selected.motherboard && selected.gpu
                    const caseHint = !selected.motherboard
                      ? 'マザーボードを先に選択してください'
                      : !selected.gpu
                      ? 'GPUを先に選択してください'
                      : '選択してください'
                    const caseLabel = canSelectCase
                      ? `ケース (${selected.motherboard!.formFactor}対応 / GPU ${selected.gpu!.lengthMm}mm以上)`
                      : 'ケース'
                    return (
                      <Select
                        label={caseLabel}
                        value={selected.case?.id?.toString() || ''}
                        onChange={(e) => handleSelect('case', e.target.value)}
                        options={[
                          { value: '', label: caseHint },
                          ...filteredParts.cases.map((p) => ({
                            value: p.id.toString(),
                            label: `${p.name} (${p.formFactor}, max GPU ${p.maxGpuLengthMm}mm) - ${formatPrice(p.price)}`,
                          })),
                        ]}
                        disabled={!canSelectCase}
                      />
                    )
                  })()}
                </div>
              ) : null}
            </Card>
          </div>

          {/* サマリー */}
          <div className="lg:col-span-1">
            <Card padding="lg" shadow="sm" className="sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">構成サマリー</h2>

              {/* 選択パーツ */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">選択パーツ</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">CPU:</dt>
                    <dd className="text-gray-900 dark:text-gray-100 truncate ml-2 max-w-[150px]" title={selected.cpu?.name}>
                      {selected.cpu?.name || '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">GPU:</dt>
                    <dd className="text-gray-900 dark:text-gray-100 truncate ml-2 max-w-[150px]" title={selected.gpu?.name}>
                      {selected.gpu?.name || '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Memory:</dt>
                    <dd className="text-gray-900 dark:text-gray-100 truncate ml-2 max-w-[150px]" title={selected.memory?.name}>
                      {selected.memory?.name || '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Storage1:</dt>
                    <dd className="text-gray-900 dark:text-gray-100 truncate ml-2 max-w-[150px]" title={selected.storage1?.name}>
                      {selected.storage1?.name || '-'}
                    </dd>
                  </div>
                  {selected.storage2 && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Storage2:</dt>
                      <dd className="text-gray-900 dark:text-gray-100 truncate ml-2 max-w-[150px]" title={selected.storage2?.name}>
                        {selected.storage2.name}
                      </dd>
                    </div>
                  )}
                  {selected.storage3 && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">Storage3:</dt>
                      <dd className="text-gray-900 dark:text-gray-100 truncate ml-2 max-w-[150px]" title={selected.storage3?.name}>
                        {selected.storage3.name}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-500">OS:</dt>
                    <dd className="text-gray-900 dark:text-gray-100 truncate ml-2 max-w-[150px]" title={selected.os?.name}>
                      {selected.os?.name || '-'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* システムパーツ */}
              <div className="mb-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">互換性パーツ</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">MB:</dt>
                    <dd className="text-gray-900 dark:text-gray-100 truncate ml-2 max-w-[150px]" title={selected.motherboard?.name}>
                      {selected.motherboard?.name || '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">電源:</dt>
                    <dd className="text-gray-900 dark:text-gray-100 truncate ml-2 max-w-[150px]" title={selected.psu?.name}>
                      {selected.psu?.name || '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">ケース:</dt>
                    <dd className="text-gray-900 dark:text-gray-100 truncate ml-2 max-w-[150px]" title={selected.case?.name}>
                      {selected.case?.name || '-'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* 合計金額 */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-gray-100">合計:</span>
                  <span className="text-xl font-bold text-custom-blue">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* アクション */}
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
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      // 現在の選択状態をsessionStorageに保存
                      const stateToSave = {
                        cpu_id: selected.cpu?.id,
                        gpu_id: selected.gpu?.id,
                        memory_id: selected.memory?.id,
                        storage1_id: selected.storage1?.id,
                        storage2_id: selected.storage2?.id,
                        storage3_id: selected.storage3?.id,
                        os_id: selected.os?.id,
                        motherboard_id: selected.motherboard?.id,
                        psu_id: selected.psu?.id,
                        case_id: selected.case?.id,
                      }
                      sessionStorage.setItem('pendingBuildConfig', JSON.stringify(stateToSave))

                      // callbackUrl は /configurator のみ（パラメータなし）
                      // sessionStorage の状態を復元するため、古いURLパラメータは不要
                      window.location.href = `/signin?callbackUrl=${encodeURIComponent('/configurator')}`
                    }}
                    disabled={!canSave}
                  >
                    ログインして保存
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
        {parts && <SpecComparisonSection cpus={parts.cpus} gpus={parts.gpus} />}
      </div>

      {/* 保存モーダル */}
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
