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
  { value: 'entry', label: 'エントリー (~10万円)' },
  { value: 'middle', label: 'ミドル (10~20万円)' },
  { value: 'high', label: 'ハイエンド (20万円~)' },
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

  const partSelectFields = [
    { key: 'cpu_id', label: 'CPU', category: 'cpu' },
    { key: 'gpu_id', label: 'GPU', category: 'gpu' },
    { key: 'memory_id', label: 'メモリ', category: 'memory' },
    { key: 'storage1_id', label: 'ストレージ1', category: 'storage' },
    { key: 'storage2_id', label: 'ストレージ2 (任意)', category: 'storage' },
    { key: 'motherboard_id', label: 'マザーボード', category: 'motherboard' },
    { key: 'psu_id', label: '電源', category: 'psu' },
    { key: 'case_id', label: 'ケース', category: 'case' },
    { key: 'os_id', label: 'OS', category: 'os' },
  ]

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
            const parts = partsOptions[field.category] || []
            const options = [
              { value: '', label: '選択してください' },
              ...parts.map(formatPartOption),
            ]

            return (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
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
                />
              </div>
            )
          })}
        </div>
      </Card>

      <div className="flex justify-end gap-4">
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
