'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Select } from '@/app/components/ui/Select'
import { api, ApiResponse } from '@/lib/api'

// 予算帯
const BUDGET_OPTIONS = [
  { value: 'entry', label: 'エントリー (~15万円)' },
  { value: 'middle', label: 'ミドル (15~30万円)' },
  { value: 'high', label: 'ハイエンド (30万円~)' },
]

// 用途
const USE_CASE_OPTIONS = [
  { value: 'gaming', label: 'ゲーミング' },
  { value: 'creative', label: 'クリエイティブ' },
  { value: 'office', label: 'オフィス' },
]

interface Part {
  id: number
  name: string
  maker: string
  price: number
  category: string
  // CPU固有
  socket?: string
  memoryType?: string
  tdp?: number
  // GPU固有
  lengthMm?: number
  // マザーボード固有
  formFactor?: string
  // ケース固有
  maxGpuLengthMm?: number
  // PSU固有
  wattage?: number
}

interface CompatibilityWarning {
  type: 'error' | 'warning'
  message: string
}

interface PresetFormData {
  id?: number
  name: string
  budgetRange: string
  useCase: string
  cpuId: number | null
  gpuId: number | null
  memoryId: number | null
  storage1Id: number | null
  storage2Id: number | null
  motherboardId: number | null
  psuId: number | null
  caseId: number | null
  osId: number | null
}

interface PresetFormProps {
  initialData?: PresetFormData
  isEdit?: boolean
}

export function PresetForm({ initialData, isEdit = false }: PresetFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [partsOptions, setPartsOptions] = useState<Record<string, Part[]>>({})
  const [filteredParts, setFilteredParts] = useState<Record<string, Part[]>>({})
  const [compatibilityWarnings, setCompatibilityWarnings] = useState<CompatibilityWarning[]>([])

  const [formData, setFormData] = useState<PresetFormData>({
    name: initialData?.name || '',
    budgetRange: initialData?.budgetRange || 'middle',
    useCase: initialData?.useCase || 'gaming',
    cpuId: initialData?.cpuId || null,
    gpuId: initialData?.gpuId || null,
    memoryId: initialData?.memoryId || null,
    storage1Id: initialData?.storage1Id || null,
    storage2Id: initialData?.storage2Id || null,
    motherboardId: initialData?.motherboardId || null,
    psuId: initialData?.psuId || null,
    caseId: initialData?.caseId || null,
    osId: initialData?.osId || null,
  })

  // パーツ一覧を取得
  useEffect(() => {
    async function fetchParts() {
      try {
        const categories = ['cpu', 'gpu', 'memory', 'storage', 'motherboard', 'psu', 'case', 'os']
        const options: Record<string, Part[]> = {}

        for (const category of categories) {
          const data = await api.get<ApiResponse<Part[]>>(`/parts?category=${category}&per_page=100`)
          options[category] = data.data || []
        }

        setPartsOptions(options)
      } catch (error) {
        console.error('パーツ一覧の取得に失敗:', error)
      }
    }

    fetchParts()
  }, [])

  const handleChange = (name: string, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 互換性に基づくフィルタリング
  useEffect(() => {
    if (!partsOptions.cpu) return

    const selectedCpu = partsOptions.cpu.find(p => p.id === formData.cpuId)
    const selectedGpu = partsOptions.gpu?.find(p => p.id === formData.gpuId)
    const selectedMotherboard = partsOptions.motherboard?.find(p => p.id === formData.motherboardId)
    const selectedMemory = partsOptions.memory?.find(p => p.id === formData.memoryId)

    // CPUの対応メモリタイプを配列化（DDR4,DDR5 → ['DDR4', 'DDR5']）
    const cpuMemoryTypes = selectedCpu?.memoryType?.split(',') || []

    // メモリ: CPUの対応memoryTypeでフィルタ（複数タイプ対応）
    const filteredMemories = selectedCpu
      ? partsOptions.memory?.filter(m => cpuMemoryTypes.includes(m.memoryType || '')) || []
      : partsOptions.memory || []

    // マザーボード: CPUのsocketでフィルタ + メモリが選択されていればそのタイプで絞り込み
    const targetMemoryType = selectedMemory?.memoryType
    const filteredMotherboards = selectedCpu
      ? partsOptions.motherboard?.filter(mb => {
          if (mb.socket !== selectedCpu.socket) return false
          if (targetMemoryType) {
            return mb.memoryType === targetMemoryType
          }
          return cpuMemoryTypes.includes(mb.memoryType || '')
        }) || []
      : partsOptions.motherboard || []

    // ケース: GPUのlengthMmとマザーボードのフォームファクタでフィルタ
    let filteredCases = partsOptions.case || []
    if (selectedGpu?.lengthMm) {
      filteredCases = filteredCases.filter(c => c.maxGpuLengthMm && c.maxGpuLengthMm >= selectedGpu.lengthMm!)
    }
    if (selectedMotherboard?.formFactor) {
      filteredCases = filteredCases.filter(c => {
        switch (c.formFactor) {
          case 'ATX':
            return ['ATX', 'mATX', 'ITX'].includes(selectedMotherboard.formFactor!)
          case 'mATX':
            return ['mATX', 'ITX'].includes(selectedMotherboard.formFactor!)
          case 'ITX':
            return selectedMotherboard.formFactor === 'ITX'
          default:
            return true
        }
      })
    }

    setFilteredParts({
      ...partsOptions,
      memory: filteredMemories,
      motherboard: filteredMotherboards,
      case: filteredCases,
    })
  }, [formData.cpuId, formData.gpuId, formData.memoryId, formData.motherboardId, partsOptions])

  // 互換性チェック
  useEffect(() => {
    const warnings: CompatibilityWarning[] = []

    // 選択されたパーツを取得
    const cpu = partsOptions.cpu?.find(p => p.id === formData.cpuId)
    const memory = partsOptions.memory?.find(p => p.id === formData.memoryId)
    const motherboard = partsOptions.motherboard?.find(p => p.id === formData.motherboardId)
    const gpu = partsOptions.gpu?.find(p => p.id === formData.gpuId)
    const pcCase = partsOptions.case?.find(p => p.id === formData.caseId)
    const psu = partsOptions.psu?.find(p => p.id === formData.psuId)

    // CPU - マザーボード ソケット互換性
    if (cpu && motherboard && cpu.socket !== motherboard.socket) {
      warnings.push({
        type: 'error',
        message: `CPUソケット不一致: CPU(${cpu.socket}) ≠ マザーボード(${motherboard.socket})`
      })
    }

    // CPU - メモリタイプ互換性（複数タイプ対応）
    const cpuMemTypes = cpu?.memoryType?.split(',') || []
    if (cpu && memory && !cpuMemTypes.includes(memory.memoryType || '')) {
      warnings.push({
        type: 'error',
        message: `メモリタイプ不一致: CPU(${cpu.memoryType?.replace(',', '/')}) ≠ メモリ(${memory.memoryType})`
      })
    }

    // マザーボード - メモリタイプ互換性
    if (motherboard && memory && motherboard.memoryType !== memory.memoryType) {
      warnings.push({
        type: 'error',
        message: `メモリタイプ不一致: マザーボード(${motherboard.memoryType}) ≠ メモリ(${memory.memoryType})`
      })
    }

    // GPU - ケース サイズ互換性
    if (gpu && pcCase && gpu.lengthMm && pcCase.maxGpuLengthMm) {
      if (gpu.lengthMm > pcCase.maxGpuLengthMm) {
        warnings.push({
          type: 'error',
          message: `GPU長がケースに収まりません: GPU(${gpu.lengthMm}mm) > ケース最大(${pcCase.maxGpuLengthMm}mm)`
        })
      }
    }

    // マザーボード - ケース フォームファクタ互換性
    if (motherboard && pcCase && motherboard.formFactor && pcCase.formFactor) {
      const isCompatible = (() => {
        switch (pcCase.formFactor) {
          case 'ATX':
            return ['ATX', 'mATX', 'ITX'].includes(motherboard.formFactor)
          case 'mATX':
            return ['mATX', 'ITX'].includes(motherboard.formFactor)
          case 'ITX':
            return motherboard.formFactor === 'ITX'
          default:
            return true
        }
      })()

      if (!isCompatible) {
        warnings.push({
          type: 'error',
          message: `フォームファクタ不一致: マザーボード(${motherboard.formFactor}) がケース(${pcCase.formFactor})に収まりません`
        })
      }
    }

    // 電源容量チェック（警告のみ）
    if (cpu && psu && cpu.tdp && psu.wattage) {
      const gpuTdp = gpu?.tdp || 0
      const totalTdp = cpu.tdp + gpuTdp
      const recommendedWattage = totalTdp * 1.5 + 100

      if (psu.wattage < recommendedWattage) {
        warnings.push({
          type: 'warning',
          message: `電源容量が不足している可能性があります: 推奨${Math.ceil(recommendedWattage)}W以上（CPU ${cpu.tdp}W + GPU ${gpuTdp}W）、現在${psu.wattage}W`
        })
      }
    }

    setCompatibilityWarnings(warnings)
  }, [formData, partsOptions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.accessToken) return

    setLoading(true)
    setErrors([])

    try {
      const payload = {
        name: formData.name,
        budget_range: formData.budgetRange,
        use_case: formData.useCase,
        parts: {
          cpu_id: formData.cpuId,
          gpu_id: formData.gpuId,
          memory_id: formData.memoryId,
          storage1_id: formData.storage1Id,
          storage2_id: formData.storage2Id,
          motherboard_id: formData.motherboardId,
          psu_id: formData.psuId,
          case_id: formData.caseId,
          os_id: formData.osId,
        },
      }

      if (isEdit && initialData?.id) {
        await api.patch(`/admin/presets/${initialData.id}`, payload, session.accessToken)
      } else {
        await api.post('/admin/presets', payload, session.accessToken)
      }

      router.push('/admin/presets')
    } catch (error) {
      console.error('保存に失敗:', error)
      if (error instanceof Error) {
        setErrors([error.message])
      } else {
        setErrors(['保存に失敗しました'])
      }
    } finally {
      setLoading(false)
    }
  }

  const getPartFieldInfo = (field: { key: string; label: string; category: string; disabled: boolean; hint: string }) => {
    let parts: Part[]
    if (field.category === 'psu') {
      parts = filteredPsus || partsOptions.psu || []
    } else if (['memory', 'motherboard', 'case'].includes(field.category)) {
      parts = filteredParts[field.category] || partsOptions[field.category] || []
    } else {
      parts = partsOptions[field.category] || []
    }

    let labelSuffix = ''
    if (field.category === 'memory' && formData.cpuId) {
      const cpu = partsOptions.cpu?.find(p => p.id === formData.cpuId)
      if (cpu?.memoryType) labelSuffix = ` (${cpu.memoryType.replace(',', '/')}対応)`
    }
    if (field.category === 'motherboard' && formData.cpuId) {
      const cpu = partsOptions.cpu?.find(p => p.id === formData.cpuId)
      const memory = partsOptions.memory?.find(p => p.id === formData.memoryId)
      const suffixes = []
      if (cpu?.socket) suffixes.push(cpu.socket)
      if (memory?.memoryType) suffixes.push(memory.memoryType)
      if (suffixes.length > 0) labelSuffix = ` (${suffixes.join('/')}対応)`
    }
    if (field.category === 'case') {
      const gpu = partsOptions.gpu?.find(p => p.id === formData.gpuId)
      const mb = partsOptions.motherboard?.find(p => p.id === formData.motherboardId)
      const suffixes = []
      if (gpu?.lengthMm) suffixes.push(`GPU ${gpu.lengthMm}mm以上`)
      if (mb?.formFactor) suffixes.push(`${mb.formFactor}`)
      if (suffixes.length > 0) labelSuffix = ` (${suffixes.join('/')}対応)`
    }

    return { parts, labelSuffix }
  }

  const formatPartOption = (part: Part) => ({
    value: part.id.toString(),
    label: `${part.name} (${part.maker}) - ¥${part.price.toLocaleString()}`,
  })

  // PSU推奨ワット数の計算
  const canSelectPsu = formData.cpuId && formData.gpuId
  const selectedCpuForPsu = partsOptions.cpu?.find(p => p.id === formData.cpuId)
  const selectedGpuForPsu = partsOptions.gpu?.find(p => p.id === formData.gpuId)
  const recommendedWattage = canSelectPsu && selectedCpuForPsu?.tdp && selectedGpuForPsu?.tdp
    ? Math.ceil((selectedCpuForPsu.tdp + selectedGpuForPsu.tdp) * 1.5 + 100)
    : null

  // 推奨W以上のPSUのみ表示
  const filteredPsus = recommendedWattage
    ? partsOptions.psu?.filter(p => p.wattage && p.wattage >= recommendedWattage)
    : partsOptions.psu

  // パーツ選択フィールドの定義（選択順序制御付き）
  // 左列: コアパーツ (CPU, GPU, メモリ, ストレージ1, ストレージ2, OS)
  const leftColumnFields = [
    { key: 'cpuId', label: 'CPU', category: 'cpu', disabled: false, hint: '' },
    { key: 'gpuId', label: 'GPU', category: 'gpu', disabled: false, hint: '' },
    {
      key: 'memoryId',
      label: 'メモリ',
      category: 'memory',
      disabled: !formData.cpuId,
      hint: !formData.cpuId ? 'CPUを先に選択してください' : ''
    },
    { key: 'storage1Id', label: 'ストレージ1', category: 'storage', disabled: false, hint: '' },
    { key: 'storage2Id', label: 'ストレージ2 (任意)', category: 'storage', disabled: false, hint: '' },
    { key: 'osId', label: 'OS', category: 'os', disabled: false, hint: '' },
  ]

  // 右列: 筐体系パーツ (マザーボード, 電源, ケース)
  const rightColumnFields = [
    {
      key: 'motherboardId',
      label: 'マザーボード',
      category: 'motherboard',
      disabled: !formData.cpuId || !formData.memoryId,
      hint: !formData.cpuId || !formData.memoryId ? 'CPU・メモリを先に選択してください' : ''
    },
    {
      key: 'psuId',
      label: recommendedWattage ? `電源 - 推奨: ${recommendedWattage}W以上` : '電源',
      category: 'psu',
      disabled: !formData.cpuId || !formData.gpuId,
      hint: !formData.cpuId || !formData.gpuId ? 'CPU・GPUを先に選択してください' : ''
    },
    {
      key: 'caseId',
      label: 'ケース',
      category: 'case',
      disabled: !formData.motherboardId || !formData.gpuId,
      hint: !formData.motherboardId || !formData.gpuId ? 'マザーボード・GPUを先に選択してください' : ''
    },
  ]

  const partSelectFields = [...leftColumnFields, ...rightColumnFields]

  const hasErrors = compatibilityWarnings.some(w => w.type === 'error')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.length > 0 && (
        <Card padding="md" className="bg-red-50 border-red-200">
          <ul className="list-disc list-inside text-red-600">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* 互換性警告 */}
      {compatibilityWarnings.length > 0 && (
        <Card padding="md" className={hasErrors ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}>
          <h3 className={`font-semibold mb-2 ${hasErrors ? 'text-red-700' : 'text-yellow-700'}`}>
            互換性チェック
          </h3>
          <ul className="space-y-1">
            {compatibilityWarnings.map((warning, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm ${warning.type === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
                {warning.type === 'error' ? (
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
                <span>{warning.message}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card padding="lg" shadow="sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              プリセット名
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="例: ゲーミングPC エントリーモデル"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              予算帯
            </label>
            <Select
              value={formData.budgetRange}
              onChange={(e) => handleChange('budgetRange', e.target.value)}
              options={BUDGET_OPTIONS}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用途
            </label>
            <Select
              value={formData.useCase}
              onChange={(e) => handleChange('useCase', e.target.value)}
              options={USE_CASE_OPTIONS}
            />
          </div>
        </div>
      </Card>

      <Card padding="lg" shadow="sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">パーツ構成</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 左列: コアパーツ */}
          <div className="space-y-4">
            {leftColumnFields.map((field) => {
              const { parts, labelSuffix } = getPartFieldInfo(field)
              const options = [
                { value: '', label: field.hint || '選択してください' },
                ...parts.map(formatPartOption),
              ]
              return (
                <div key={field.key}>
                  <label className={`block text-sm font-medium mb-1 ${field.disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                    {field.label}{labelSuffix}
                  </label>
                  <Select
                    value={formData[field.key as keyof PresetFormData]?.toString() || ''}
                    onChange={(e) =>
                      handleChange(
                        field.key,
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    options={options}
                    disabled={field.disabled}
                  />
                </div>
              )
            })}
          </div>
          {/* 右列: 筐体系パーツ */}
          <div className="space-y-4">
            {rightColumnFields.map((field) => {
              const { parts, labelSuffix } = getPartFieldInfo(field)
              const options = [
                { value: '', label: field.hint || '選択してください' },
                ...parts.map(formatPartOption),
              ]
              return (
                <div key={field.key}>
                  <label className={`block text-sm font-medium mb-1 ${field.disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                    {field.label}{labelSuffix}
                  </label>
                  <Select
                    value={formData[field.key as keyof PresetFormData]?.toString() || ''}
                    onChange={(e) =>
                      handleChange(
                        field.key,
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    options={options}
                    disabled={field.disabled}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      <div className="flex justify-end items-center gap-4">
        {hasErrors && (
          <span className="text-sm text-red-600">
            互換性エラーがあります（保存は可能ですが非推奨）
          </span>
        )}
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/presets')}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? '保存中...' : isEdit ? '更新する' : '登録する'}
        </Button>
      </div>
    </form>
  )
}
