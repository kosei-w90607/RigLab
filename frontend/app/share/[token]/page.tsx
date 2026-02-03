'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { api, ApiClientError } from '@/lib/api'

interface Part {
  id: number
  name: string
  maker: string
  price: number
}

interface PartEntry {
  category: string
  part: Part
}

interface ShareTokenData {
  token: string
  totalPrice: number
  parts: PartEntry[]
  createdAt: string
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price)
}

function PartRow({
  label,
  name,
  price,
}: {
  label: string
  name: string | undefined
  price: number | undefined
}) {
  if (!name || price === undefined) return null

  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="py-3 text-gray-500 w-32">{label}</td>
      <td className="py-3 text-gray-900">{name}</td>
      <td className="py-3 text-right text-gray-600">{formatPrice(price)}</td>
    </tr>
  )
}

function SkeletonDetail() {
  return (
    <Card padding="lg" shadow="md">
      <Skeleton className="h-8 w-64 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    </Card>
  )
}

export default function ShareTokenPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [data, setData] = useState<ShareTokenData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchShareToken = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await api.get<{ data: ShareTokenData }>(`/share_tokens/${token}`)
        setData(response.data)
      } catch (err) {
        if (err instanceof ApiClientError) {
          if (err.status === 404) {
            setError('共有データが見つかりません')
          } else {
            setError(err.message)
          }
        } else {
          setError('データの取得に失敗しました')
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchShareToken()
    } else {
      setError('共有URLが無効です')
      setIsLoading(false)
    }
  }, [token])

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('URLをコピーしました')
    } catch {
      alert('コピーに失敗しました')
    }
  }

  const buildConfiguratorUrl = () => {
    if (!data) return '/configurator'

    const paramsMap: Record<string, string> = {}
    data.parts.forEach((entry, index) => {
      const { category, part } = entry
      if (category === 'storage') {
        const storageIndex = data.parts.filter((e, i) => i < index && e.category === 'storage').length + 1
        paramsMap[`storage${storageIndex}`] = part.id.toString()
      } else {
        paramsMap[category] = part.id.toString()
      }
    })

    const searchParams = new URLSearchParams(paramsMap)
    return `/configurator?${searchParams.toString()}`
  }

  const getPartByCategory = (category: string, index?: number): Part | undefined => {
    if (!data) return undefined

    if (category === 'storage' && index !== undefined) {
      const storages = data.parts.filter((e) => e.category === 'storage')
      return storages[index]?.part
    }

    return data.parts.find((e) => e.category === category)?.part
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <Card padding="lg" shadow="md" className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/">
            <Button variant="primary">トップに戻る</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        {isLoading ? (
          <SkeletonDetail />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                共有構成
              </h1>
              <Button variant="secondary" onClick={handleCopyUrl}>
                URLをコピー
              </Button>
            </div>

            {/* Parts List */}
            <Card padding="lg" shadow="md" className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">選択パーツ</h2>
              <table className="w-full text-sm">
                <tbody>
                  <PartRow label="CPU" name={getPartByCategory('cpu')?.name} price={getPartByCategory('cpu')?.price} />
                  <PartRow label="GPU" name={getPartByCategory('gpu')?.name} price={getPartByCategory('gpu')?.price} />
                  <PartRow label="Memory" name={getPartByCategory('memory')?.name} price={getPartByCategory('memory')?.price} />
                  <PartRow label="Storage(1)" name={getPartByCategory('storage', 0)?.name} price={getPartByCategory('storage', 0)?.price} />
                  <PartRow label="Storage(2)" name={getPartByCategory('storage', 1)?.name} price={getPartByCategory('storage', 1)?.price} />
                  <PartRow label="Storage(3)" name={getPartByCategory('storage', 2)?.name} price={getPartByCategory('storage', 2)?.price} />
                  <PartRow label="OS" name={getPartByCategory('os')?.name} price={getPartByCategory('os')?.price} />
                  <PartRow label="マザーボード" name={getPartByCategory('motherboard')?.name} price={getPartByCategory('motherboard')?.price} />
                  <PartRow label="電源" name={getPartByCategory('psu')?.name} price={getPartByCategory('psu')?.price} />
                  <PartRow label="ケース" name={getPartByCategory('case')?.name} price={getPartByCategory('case')?.price} />
                </tbody>
              </table>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-medium text-gray-900">合計</span>
                <span className="text-2xl font-bold text-custom-blue">
                  {formatPrice(data?.totalPrice || 0)}
                </span>
              </div>
            </Card>

            {/* Actions */}
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                この構成をベースに自分の構成を作成できます
              </p>
              <Link href={buildConfiguratorUrl()}>
                <Button variant="primary" size="lg">
                  この構成をカスタマイズ
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
