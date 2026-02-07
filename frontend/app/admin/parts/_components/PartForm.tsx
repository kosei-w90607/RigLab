'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Select } from '@/app/components/ui/Select'
import { useToast } from '@/app/components/ui/Toast'
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

// 全カテゴリの固有フィールド名一覧
const ALL_CATEGORY_FIELD_NAMES = new Set(
  Object.values(CATEGORY_FIELDS).flatMap((fields) => fields.map((f) => f.name))
)

export function PartForm({ initialData, isEdit = false }: PartFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const formRef = useRef<HTMLFormElement>(null)

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

  const handleCategoryChange = (newCategory: string) => {
    setFormData((prev) => {
      // 全カテゴリ固有フィールドをクリア
      const cleaned: PartFormData = {
        category: newCategory,
        name: prev.name,
        maker: prev.maker,
        price: prev.price,
      }
      if (prev.id !== undefined) cleaned.id = prev.id
      return cleaned
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.accessToken) return

    setLoading(true)
    setErrors([])

    try {
      // フォームDOM要素から直接値を収集し、Reactステートとマージ
      // Firefoxのイベント発火タイミング問題を回避する
      const payload = { ...formData }
      if (formRef.current) {
        const currentFields = CATEGORY_FIELDS[formData.category] || []
        for (const field of currentFields) {
          const input = formRef.current.elements.namedItem(field.name) as HTMLInputElement | null
          if (input && input.value !== '') {
            payload[field.name] =
              field.type === 'number' ? parseInt(input.value) || 0 : input.value
          }
        }
      }

      // 現在のカテゴリに属さない固有フィールドを除外
      const currentFieldNames = new Set(
        (CATEGORY_FIELDS[payload.category] || []).map((f) => f.name)
      )
      for (const fieldName of ALL_CATEGORY_FIELD_NAMES) {
        if (!currentFieldNames.has(fieldName)) {
          delete payload[fieldName]
        }
      }

      if (isEdit && initialData?.id) {
        await api.patch(`/admin/parts/${initialData.id}`, payload, session.accessToken)
        addToast({ type: 'success', message: 'パーツを更新しました' })
      } else {
        await api.post('/admin/parts', payload, session.accessToken)
        addToast({ type: 'success', message: 'パーツを作成しました' })
      }

      router.push('/admin/parts')
    } catch (error) {
      console.error('保存に失敗:', error)
      const errorMessage = error instanceof Error ? error.message : '保存に失敗しました'
      setErrors([errorMessage])
      addToast({ type: 'error', message: `保存に失敗しました: ${errorMessage}` })
    } finally {
      setLoading(false)
    }
  }

  const categoryFields = CATEGORY_FIELDS[formData.category] || []

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
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
              onChange={(e) => handleCategoryChange(e.target.value)}
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
                  name={field.name}
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

      <Card padding="lg" shadow="sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">外部リンク情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              楽天URL
            </label>
            <Input
              type="url"
              value={(formData.rakuten_url as string) || ''}
              onChange={(e) => handleChange('rakuten_url', e.target.value)}
              placeholder="https://item.rakuten.co.jp/..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              楽天画像URL
            </label>
            <Input
              type="url"
              value={(formData.rakuten_image_url as string) || ''}
              onChange={(e) => handleChange('rakuten_image_url', e.target.value)}
              placeholder="https://thumbnail.image.rakuten.co.jp/..."
            />
          </div>
        </div>
      </Card>

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
