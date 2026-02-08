'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Input } from '@/app/components/ui/Input'
import { Select } from '@/app/components/ui/Select'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { useToast } from '@/app/components/ui/Toast'
import { api } from '@/lib/api'

const CATEGORIES = [
  { value: '', label: 'すべて' },
  { value: 'cpu', label: 'CPU' },
  { value: 'gpu', label: 'GPU' },
  { value: 'memory', label: 'メモリ' },
  { value: 'storage', label: 'ストレージ' },
  { value: 'motherboard', label: 'マザーボード' },
  { value: 'psu', label: '電源' },
  { value: 'case', label: 'ケース' },
  { value: 'os', label: 'OS' },
]

interface RakutenItem {
  name: string
  price: number
  url: string
  imageUrl: string | null
  shopName: string
  itemCode: string
  genreId: string
}

interface ExistingPart {
  id: number
  name: string
  category: string
  maker: string
  price: number
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price)
}

function RakutenItemCard({
  item,
  onRegister,
  onLink,
}: {
  item: RakutenItem
  onRegister: (item: RakutenItem) => void
  onLink: (item: RakutenItem) => void
}) {
  return (
    <Card padding="md" shadow="sm" className="hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {item.imageUrl && (
          <div className="flex-shrink-0 w-20 h-20">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-contain rounded"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h3>
          <p className="text-lg font-bold text-custom-blue mt-1">{formatPrice(item.price)}</p>
          <p className="text-xs text-gray-500">{item.shopName}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onRegister(item)}>
          パーツ登録
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onLink(item)}>
          既存パーツに紐付け
        </Button>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs text-blue-600 hover:underline"
        >
          楽天で見る
          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </Card>
  )
}

function LinkModal({
  item,
  onClose,
  onConfirm,
}: {
  item: RakutenItem
  onClose: () => void
  onConfirm: (partType: string, partId: number) => void
}) {
  const { data: session } = useSession()
  const [searchCategory, setSearchCategory] = useState('')
  const [parts, setParts] = useState<ExistingPart[]>([])
  const [searching, setSearching] = useState(false)

  const searchParts = async () => {
    if (!session?.accessToken) return
    setSearching(true)
    try {
      const params = new URLSearchParams({ per_page: '50' })
      if (searchCategory) params.set('category', searchCategory)
      const response = await api.get<{ data: ExistingPart[] }>(`/parts?${params}`)
      setParts(response.data || [])
    } catch {
      setParts([])
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">既存パーツに紐付け</h2>
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{item.name}</p>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <Select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              options={CATEGORIES}
            />
            <Button size="sm" onClick={searchParts} disabled={searching}>
              {searching ? '検索中...' : '検索'}
            </Button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {parts.map((part) => (
              <button
                key={`${part.category}-${part.id}`}
                onClick={() => onConfirm(part.category, part.id)}
                className="w-full text-left p-3 border rounded hover:bg-blue-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 mr-2">
                      {part.category}
                    </span>
                    <span className="text-sm font-medium">{part.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{formatPrice(part.price)}</span>
                </div>
              </button>
            ))}
            {parts.length === 0 && !searching && (
              <p className="text-center text-gray-500 py-4">カテゴリを選んで検索してください</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
          <Button variant="secondary" onClick={onClose}>閉じる</Button>
        </div>
      </div>
    </div>
  )
}

export default function RakutenImportPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { addToast } = useToast()

  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')
  const [items, setItems] = useState<RakutenItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [linkItem, setLinkItem] = useState<RakutenItem | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!keyword.trim() || !session?.accessToken) return

    setLoading(true)
    try {
      const params = new URLSearchParams({ keyword: keyword.trim() })
      if (category) params.set('category', category)
      const response = await api.get<{ data: { items: RakutenItem[]; totalCount: number } }>(
        `/admin/rakuten_search?${params}`,
        session.accessToken
      )
      setItems(response.data.items || [])
      setTotalCount(response.data.totalCount || 0)
    } catch (error) {
      const message = error instanceof Error ? error.message : '楽天APIの検索に失敗しました'
      addToast({ type: 'error', message })
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = (item: RakutenItem) => {
    // PartFormにプリフィルして遷移
    const params = new URLSearchParams({
      name: item.name,
      price: String(item.price),
      rakuten_url: item.url,
      rakuten_image_url: item.imageUrl || '',
    })
    if (category) params.set('category', category)
    router.push(`/admin/parts/new?${params}`)
  }

  const handleLink = async (partType: string, partId: number) => {
    if (!linkItem || !session?.accessToken) return

    try {
      await api.post(
        `/admin/parts/${partId}/link_rakuten`,
        {
          part_type: partType,
          rakuten_url: linkItem.url,
          rakuten_image_url: linkItem.imageUrl,
          item_price: linkItem.price,
        },
        session.accessToken
      )
      addToast({ type: 'success', message: '楽天情報を紐付けました' })
      setLinkItem(null)
    } catch {
      addToast({ type: 'error', message: '紐付けに失敗しました' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">楽天から登録</h1>
        <Button variant="secondary" onClick={() => router.push('/admin/parts')}>
          パーツ一覧に戻る
        </Button>
      </div>

      <Card padding="lg" shadow="sm">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="キーワードを入力（例: RTX 4070）"
              required
            />
          </div>
          <div className="w-full sm:w-40">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={CATEGORIES}
            />
          </div>
          <Button type="submit" disabled={loading || !keyword.trim()}>
            {loading ? '検索中...' : '検索'}
          </Button>
        </form>
      </Card>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          <p className="text-sm text-gray-600">{totalCount}件中 {items.length}件を表示</p>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <RakutenItemCard
                key={item.itemCode}
                item={item}
                onRegister={handleRegister}
                onLink={() => setLinkItem(item)}
              />
            ))}
          </div>
        </>
      )}

      {!loading && items.length === 0 && keyword && (
        <Card padding="lg" shadow="sm" className="text-center py-12">
          <p className="text-gray-500">検索結果がありません</p>
        </Card>
      )}

      {linkItem && (
        <LinkModal
          item={linkItem}
          onClose={() => setLinkItem(null)}
          onConfirm={handleLink}
        />
      )}
    </div>
  )
}
