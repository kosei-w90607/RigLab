'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Select } from '@/app/components/ui/Select'
import { api } from '@/lib/api'

// パーツカテゴリ
const CATEGORIES = [
  { value: 'cpu', label: 'CPU' },
  { value: 'gpu', label: 'GPU' },
  { value: 'memory', label: 'メモリ' },
  { value: 'storage', label: 'ストレージ' },
  { value: 'motherboard', label: 'マザーボード' },
  { value: 'psu', label: '電源' },
  { value: 'case', label: 'ケース' },
  { value: 'os', label: 'OS' },
]

// カテゴリ別の追加フィールド
const CATEGORY_FIELDS: Record<string, { name: string; label: string; type: string }[]> = {
  cpu: [
    { name: 'socket', label: 'ソケット', type: 'text' },
    { name: 'tdp', label: 'TDP (W)', type: 'number' },
    { name: 'memory_type', label: 'メモリタイプ', type: 'text' },
  ],
  gpu: [
    { name: 'tdp', label: 'TDP (W)', type: 'number' },
    { name: 'length_mm', label: '長さ (mm)', type: 'number' },
  ],
  memory: [
    { name: 'memory_type', label: 'メモリタイプ', type: 'text' },
    { name: 'capacity_gb', label: '容量 (GB)', type: 'number' },
  ],
  storage: [
    { name: 'capacity_gb', label: '容量 (GB)', type: 'number' },
    { name: 'interface', label: 'インターフェース', type: 'text' },
  ],
  motherboard: [
    { name: 'socket', label: 'ソケット', type: 'text' },
    { name: 'memory_type', label: 'メモリタイプ', type: 'text' },
    { name: 'form_factor', label: 'フォームファクタ', type: 'text' },
  ],
  psu: [
    { name: 'wattage', label: '出力 (W)', type: 'number' },
    { name: 'efficiency', label: '効率認証', type: 'text' },
  ],
  case: [
    { name: 'form_factor', label: '対応フォームファクタ', type: 'text' },
    { name: 'max_gpu_length_mm', label: '最大GPU長 (mm)', type: 'number' },
  ],
  os: [
    { name: 'version', label: 'バージョン', type: 'text' },
    { name: 'edition', label: 'エディション', type: 'text' },
  ],
}

interface PartFormData {
  id?: number
  category: string
  name: string
  maker: string
  price: number
  [key: string]: unknown
}

interface PartFormProps {
  initialData?: PartFormData
  isEdit?: boolean
}

export function PartForm({ initialData, isEdit = false }: PartFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const [formData, setFormData] = useState<PartFormData>({
    category: initialData?.category || 'cpu',
    name: initialData?.name || '',
    maker: initialData?.maker || '',
    price: initialData?.price || 0,
    ...initialData,
  })

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.accessToken) return

    setLoading(true)
    setErrors([])

    try {
      const payload = { ...formData }

      if (isEdit && initialData?.id) {
        await api.patch(`/admin/parts/${initialData.id}`, payload, session.accessToken)
      } else {
        await api.post('/admin/parts', payload, session.accessToken)
      }

      router.push('/admin/parts')
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

  const categoryFields = CATEGORY_FIELDS[formData.category] || []

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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ
            </label>
            <Select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              options={CATEGORIES}
              disabled={isEdit}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メーカー
            </label>
            <Input
              type="text"
              value={formData.maker}
              onChange={(e) => handleChange('maker', e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              製品名
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              価格 (円)
            </label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
              min={0}
              required
            />
          </div>
        </div>
      </Card>

      {categoryFields.length > 0 && (
        <Card padding="lg" shadow="sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">カテゴリ固有情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryFields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <Input
                  type={field.type}
                  value={(formData[field.name] as string | number) || ''}
                  onChange={(e) =>
                    handleChange(
                      field.name,
                      field.type === 'number'
                        ? parseInt(e.target.value) || 0
                        : e.target.value
                    )
                  }
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/admin/parts')}
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
