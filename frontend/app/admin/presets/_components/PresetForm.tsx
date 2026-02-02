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
  { value: 'business', label: 'ビジネス' },
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
  budget_range: string
  use_case: string
  cpu_id: number | null
  gpu_id: number | null
  memory_id: number | null
  storage1_id: number | null
  storage2_id: number | null
  motherboard_id: number | null
  psu_id: number | null
  case_id: number | null
  os_id: number | null
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
    budget_range: initialData?.budget_range || 'middle',
    use_case: initialData?.use_case || 'gaming',
    cpu_id: initialData?.cpu_id || null,
    gpu_id: initialData?.gpu_id || null,
    memory_id: initialData?.memory_id || null,
    storage1_id: initialData?.storage1_id || null,
    storage2_id: initialData?.storage2_id || null,
    motherboard_id: initialData?.motherboard_id || null,
    psu_id: initialData?.psu_id || null,
    case_id: initialData?.case_id || null,
    os_id: initialData?.os_id || null,
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

    const selectedCpu = partsOptions.cpu.find(p => p.id === formData.cpu_id)
    const selectedGpu = partsOptions.gpu?.find(p => p.id === formData.gpu_id)
    const selectedMotherboard = partsOptions.motherboard?.find(p => p.id === formData.motherboard_id)
    const selectedMemory = partsOptions.memory?.find(p => p.id === formData.memory_id)

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
  }, [formData.cpu_id, formData.gpu_id, formData.memory_id, formData.motherboard_id, partsOptions])

  // 互換性チェック
  useEffect(() => {
    const warnings: CompatibilityWarning[] = []

    // 選択されたパーツを取得
    const cpu = partsOptions.cpu?.find(p => p.id === formData.cpu_id)
    const memory = partsOptions.memory?.find(p => p.id === formData.memory_id)
    const motherboard = partsOptions.motherboard?.find(p => p.id === formData.motherboard_id)
    const gpu = partsOptions.gpu?.find(p => p.id === formData.gpu_id)
    const pcCase = partsOptions.case?.find(p => p.id === formData.case_id)
    const psu = partsOptions.psu?.find(p => p.id === formData.psu_id)

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
        budget_range: formData.budget_range,
        use_case: formData.use_case,
        parts: {
          cpu_id: formData.cpu_id,
          gpu_id: formData.gpu_id,
          memory_id: formData.memory_id,
          storage1_id: formData.storage1_id,
          storage2_id: formData.storage2_id,
          motherboard_id: formData.motherboard_id,
          psu_id: formData.psu_id,
          case_id: formData.case_id,
          os_id: formData.os_id,
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

  const formatPartOption = (part: Part) => ({
    value: part.id.toString(),
    label: `${part.name} (${part.maker}) - ¥${part.price.toLocaleString()}`,
  })

  // PSU推奨ワット数の計算
  const canSelectPsu = formData.cpu_id && formData.gpu_id
  const selectedCpuForPsu = partsOptions.cpu?.find(p => p.id === formData.cpu_id)
  const selectedGpuForPsu = partsOptions.gpu?.find(p => p.id === formData.gpu_id)
  const recommendedWattage = canSelectPsu && selectedCpuForPsu?.tdp && selectedGpuForPsu?.tdp
    ? Math.ceil((selectedCpuForPsu.tdp + selectedGpuForPsu.tdp) * 1.5 + 100)
    : null

  // 推奨W以上のPSUのみ表示
  const filteredPsus = recommendedWattage
    ? partsOptions.psu?.filter(p => p.wattage && p.wattage >= recommendedWattage)
    : partsOptions.psu

  // パーツ選択フィールドの定義（選択順序制御付き）
  const partSelectFields = [
    { key: 'cpu_id', label: 'CPU', category: 'cpu', disabled: false, hint: '' },
    { key: 'gpu_id', label: 'GPU', category: 'gpu', disabled: false, hint: '' },
    {
      key: 'memory_id',
      label: 'メモリ',
      category: 'memory',
      disabled: !formData.cpu_id,
      hint: !formData.cpu_id ? 'CPUを先に選択してください' : ''
    },
    { key: 'storage1_id', label: 'ストレージ1', category: 'storage', disabled: false, hint: '' },
    { key: 'storage2_id', label: 'ストレージ2 (任意)', category: 'storage', disabled: false, hint: '' },
    {
      key: 'motherboard_id',
      label: 'マザーボード',
      category: 'motherboard',
      disabled: !formData.cpu_id || !formData.memory_id,
      hint: !formData.cpu_id || !formData.memory_id ? 'CPU・メモリを先に選択してください' : ''
    },
    {
      key: 'psu_id',
      label: recommendedWattage ? `電源 - 推奨: ${recommendedWattage}W以上` : '電源',
      category: 'psu',
      disabled: !formData.cpu_id || !formData.gpu_id,
      hint: !formData.cpu_id || !formData.gpu_id ? 'CPU・GPUを先に選択してください' : ''
    },
    {
      key: 'case_id',
      label: 'ケース',
      category: 'case',
      disabled: !formData.motherboard_id || !formData.gpu_id,
      hint: !formData.motherboard_id || !formData.gpu_id ? 'マザーボード・GPUを先に選択してください' : ''
    },
    { key: 'os_id', label: 'OS', category: 'os', disabled: false, hint: '' },
  ]

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
              value={formData.budget_range}
              onChange={(e) => handleChange('budget_range', e.target.value)}
              options={BUDGET_OPTIONS}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用途
            </label>
            <Select
              value={formData.use_case}
              onChange={(e) => handleChange('use_case', e.target.value)}
              options={USE_CASE_OPTIONS}
            />
          </div>
        </div>
      </Card>

      <Card padding="lg" shadow="sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">パーツ構成</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partSelectFields.map((field) => {
            // フィルタリング対象のカテゴリはfilteredPartsを使用、PSUは別途フィルタリング
            let parts: Part[]
            if (field.category === 'psu') {
              parts = filteredPsus || partsOptions.psu || []
            } else if (['memory', 'motherboard', 'case'].includes(field.category)) {
              parts = filteredParts[field.category] || partsOptions[field.category] || []
            } else {
              parts = partsOptions[field.category] || []
            }
            const options = [
              { value: '', label: field.hint || '選択してください' },
              ...parts.map(formatPartOption),
            ]

            // フィルタリング状態に応じたラベル
            let labelSuffix = ''
            if (field.category === 'memory' && formData.cpu_id) {
              const cpu = partsOptions.cpu?.find(p => p.id === formData.cpu_id)
              // DDR4,DDR5 → DDR4/DDR5 に変換して表示
              if (cpu?.memoryType) labelSuffix = ` (${cpu.memoryType.replace(',', '/')}対応)`
            }
            if (field.category === 'motherboard' && formData.cpu_id) {
              const cpu = partsOptions.cpu?.find(p => p.id === formData.cpu_id)
              const memory = partsOptions.memory?.find(p => p.id === formData.memory_id)
              const suffixes = []
              if (cpu?.socket) suffixes.push(cpu.socket)
              if (memory?.memoryType) suffixes.push(memory.memoryType)
              if (suffixes.length > 0) labelSuffix = ` (${suffixes.join('/')}対応)`
            }
            if (field.category === 'case') {
              const gpu = partsOptions.gpu?.find(p => p.id === formData.gpu_id)
              const mb = partsOptions.motherboard?.find(p => p.id === formData.motherboard_id)
              const suffixes = []
              if (gpu?.lengthMm) suffixes.push(`GPU ${gpu.lengthMm}mm以上`)
              if (mb?.formFactor) suffixes.push(`${mb.formFactor}`)
              if (suffixes.length > 0) labelSuffix = ` (${suffixes.join('/')}対応)`
            }

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
