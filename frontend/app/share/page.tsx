'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { api, ApiClientError } from '@/lib/api'
import { useToast } from '@/app/components/ui/Toast'

interface SharedPart {
  id: number
  name: string
  maker: string
  price: number
}

interface SharedBuild {
  name: string | null
  cpu: SharedPart | null
  gpu: SharedPart | null
  memory: SharedPart | null
  storage1: SharedPart | null
  storage2: SharedPart | null
  storage3: SharedPart | null
  os: SharedPart | null
  motherboard: SharedPart | null
  psu: SharedPart | null
  case: SharedPart | null
  serverTotalPrice: number | null
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
    <tr className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <td className="py-3 text-gray-500 dark:text-gray-400 w-32">{label}</td>
      <td className="py-3 text-gray-900 dark:text-gray-100">{name}</td>
      <td className="py-3 text-right text-gray-600 dark:text-gray-400">{formatPrice(price)}</td>
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

export default function SharePage() {
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  // Hydration Error防止: クライアントマウント後にのみレンダリング
  useEffect(() => {
    setMounted(true)
  }, [])

  const shareToken = searchParams.get('token')

  const [build, setBuild] = useState<SharedBuild>({
    name: null,
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
    serverTotalPrice: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const emptyBuild: SharedBuild = {
      name: null,
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
      serverTotalPrice: null,
    }

    const parseParts = (parts: { category: string; part: { id: number; name: string; maker: string; price: number } }[]): SharedBuild => {
      const result = { ...emptyBuild }
      let storageIndex = 1
      for (const p of parts) {
        const partData = { ...p.part } as unknown
        if (p.category === 'storage') {
          const key = `storage${storageIndex}` as keyof SharedBuild
          ;(result as unknown as Record<string, unknown>)[key] = partData
          storageIndex++
        } else {
          ;(result as unknown as Record<string, unknown>)[p.category] = partData
        }
      }
      return result
    }

    const fetchSharedBuild = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (!shareToken) {
          setError('共有URLが無効です')
          return
        }

        // ?token=xxx - share_tokensから取得
        const response = await api.get<{ data: { token: string; totalPrice: number; parts: { category: string; part: { id: number; name: string; maker: string; price: number } }[] } }>(`/share_tokens/${shareToken}`)
        const parsed = parseParts(response.data.parts)
        parsed.serverTotalPrice = response.data.totalPrice
        setBuild(parsed)
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.message)
        } else {
          setError('構成の取得に失敗しました')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchSharedBuild()
  }, [shareToken])

  const totalPrice = build.serverTotalPrice ??
    ((build.cpu?.price || 0) +
    (build.gpu?.price || 0) +
    (build.memory?.price || 0) +
    (build.storage1?.price || 0) +
    (build.storage2?.price || 0) +
    (build.storage3?.price || 0) +
    (build.os?.price || 0) +
    (build.motherboard?.price || 0) +
    (build.psu?.price || 0) +
    (build.case?.price || 0))

  const buildConfiguratorUrl = () => {
    const params = new URLSearchParams()
    if (build.cpu?.id) params.set('cpu', String(build.cpu.id))
    if (build.gpu?.id) params.set('gpu', String(build.gpu.id))
    if (build.memory?.id) params.set('memory', String(build.memory.id))
    if (build.storage1?.id) params.set('storage1', String(build.storage1.id))
    if (build.storage2?.id) params.set('storage2', String(build.storage2.id))
    if (build.storage3?.id) params.set('storage3', String(build.storage3.id))
    if (build.os?.id) params.set('os', String(build.os.id))
    if (build.motherboard?.id) params.set('motherboard', String(build.motherboard.id))
    if (build.psu?.id) params.set('psu', String(build.psu.id))
    if (build.case?.id) params.set('case', String(build.case.id))
    return `/configurator?${params.toString()}`
  }

  const { addToast } = useToast()

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      addToast({ type: 'success', message: 'URLをコピーしました' })
    } catch {
      addToast({ type: 'error', message: 'コピーに失敗しました' })
    }
  }

  // Hydration Error防止: クライアントマウント前はスケルトンを表示
  if (!mounted) {
    return (
      <div className="flex-1 px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <SkeletonDetail />
        </div>
      </div>
    )
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {build.name || '共有構成'}
              </h1>
              <Button variant="secondary" onClick={handleCopyUrl}>
                URLをコピー
              </Button>
            </div>

            {/* Parts List */}
            <Card padding="lg" shadow="md" className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">選択パーツ</h2>
              <table className="w-full text-sm">
                <tbody>
                  <PartRow label="CPU" name={build.cpu?.name} price={build.cpu?.price} />
                  <PartRow label="GPU" name={build.gpu?.name} price={build.gpu?.price} />
                  <PartRow label="Memory" name={build.memory?.name} price={build.memory?.price} />
                  <PartRow label="Storage(1)" name={build.storage1?.name} price={build.storage1?.price} />
                  <PartRow label="Storage(2)" name={build.storage2?.name} price={build.storage2?.price} />
                  <PartRow label="Storage(3)" name={build.storage3?.name} price={build.storage3?.price} />
                  <PartRow label="OS" name={build.os?.name} price={build.os?.price} />
                </tbody>
              </table>

              {(build.motherboard || build.psu || build.case) && (
                <>
                  <h3 className="text-md font-bold text-gray-900 dark:text-gray-100 mt-6 mb-4">自動推奨パーツ</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <PartRow label="マザーボード" name={build.motherboard?.name} price={build.motherboard?.price} />
                      <PartRow label="電源" name={build.psu?.name} price={build.psu?.price} />
                      <PartRow label="ケース" name={build.case?.name} price={build.case?.price} />
                    </tbody>
                  </table>
                </>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-gray-100">合計</span>
                <span className="text-2xl font-bold text-custom-blue">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </Card>

            {/* Actions */}
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                この構成をベースに自分の構成を作成できます
              </p>
              <Link
                href={buildConfiguratorUrl()}
              >
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
