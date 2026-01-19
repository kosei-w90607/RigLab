'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Skeleton } from '@/app/components/ui/Skeleton'
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

interface SharedBuild {
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

export default function SharePage() {
  const searchParams = useSearchParams()

  const cpuId = searchParams.get('cpu')
  const gpuId = searchParams.get('gpu')
  const memoryId = searchParams.get('memory')
  const storage1Id = searchParams.get('storage1')
  const storage2Id = searchParams.get('storage2')
  const storage3Id = searchParams.get('storage3')
  const osId = searchParams.get('os')

  const [build, setBuild] = useState<SharedBuild>({
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchParts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const requests: Promise<{ data: unknown }>[] = []
        const partTypes: (keyof SharedBuild)[] = []

        if (cpuId) {
          requests.push(api.get<{ data: PartsCpu }>(`/parts/${cpuId}`))
          partTypes.push('cpu')
        }
        if (gpuId) {
          requests.push(api.get<{ data: PartsGpu }>(`/parts/${gpuId}`))
          partTypes.push('gpu')
        }
        if (memoryId) {
          requests.push(api.get<{ data: PartsMemory }>(`/parts/${memoryId}`))
          partTypes.push('memory')
        }
        if (storage1Id) {
          requests.push(api.get<{ data: PartsStorage }>(`/parts/${storage1Id}`))
          partTypes.push('storage1')
        }
        if (storage2Id) {
          requests.push(api.get<{ data: PartsStorage }>(`/parts/${storage2Id}`))
          partTypes.push('storage2')
        }
        if (storage3Id) {
          requests.push(api.get<{ data: PartsStorage }>(`/parts/${storage3Id}`))
          partTypes.push('storage3')
        }
        if (osId) {
          requests.push(api.get<{ data: PartsOs }>(`/parts/${osId}`))
          partTypes.push('os')
        }

        const results = await Promise.all(requests)

        const newBuild: SharedBuild = {
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

        results.forEach((result, index) => {
          const partType = partTypes[index]
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          newBuild[partType] = result.data as any
        })

        // Fetch recommended parts if CPU and Memory are available
        if (newBuild.cpu && newBuild.memory) {
          try {
            const recResponse = await api.get<{
              motherboard: PartsMotherboard
              psu: PartsPsu
              case: PartsCase
            }>(`/parts/recommendations?cpu_id=${newBuild.cpu.id}&memory_id=${newBuild.memory.id}${newBuild.gpu ? `&gpu_id=${newBuild.gpu.id}` : ''}`)

            newBuild.motherboard = recResponse.motherboard
            newBuild.psu = recResponse.psu
            newBuild.case = recResponse.case
          } catch {
            // Recommendations are optional
          }
        }

        setBuild(newBuild)
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

    if (cpuId || gpuId || memoryId || storage1Id || osId) {
      fetchParts()
    } else {
      setIsLoading(false)
      setError('共有URLが無効です')
    }
  }, [cpuId, gpuId, memoryId, storage1Id, storage2Id, storage3Id, osId])

  const totalPrice =
    (build.cpu?.price || 0) +
    (build.gpu?.price || 0) +
    (build.memory?.price || 0) +
    (build.storage1?.price || 0) +
    (build.storage2?.price || 0) +
    (build.storage3?.price || 0) +
    (build.os?.price || 0) +
    (build.motherboard?.price || 0) +
    (build.psu?.price || 0) +
    (build.case?.price || 0)

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('URLをコピーしました')
    } catch {
      // Fallback for older browsers
      alert('コピーに失敗しました')
    }
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
                  <h3 className="text-md font-bold text-gray-900 mt-6 mb-4">自動推奨パーツ</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <PartRow label="マザーボード" name={build.motherboard?.name} price={build.motherboard?.price} />
                      <PartRow label="電源" name={build.psu?.name} price={build.psu?.price} />
                      <PartRow label="ケース" name={build.case?.name} price={build.case?.price} />
                    </tbody>
                  </table>
                </>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-medium text-gray-900">合計</span>
                <span className="text-2xl font-bold text-custom-blue">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </Card>

            {/* Actions */}
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                この構成をベースに自分の構成を作成できます
              </p>
              <Link
                href={`/configurator?${searchParams.toString()}`}
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
