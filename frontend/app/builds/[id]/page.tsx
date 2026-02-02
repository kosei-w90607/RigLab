'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog'
import type { PcCustomSet, PcEntrustSet, BasePart } from '@/types'
import { api, ApiClientError } from '@/lib/api'
import { shareConfiguration } from '@/lib/share'

type BuildData = PcCustomSet | PcEntrustSet

// API response types (snake_case from Rails)
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
  total_price: number
  share_token: string
  parts: ApiPartEntry[]
  user: { id: number; name: string } | null
  created_at: string
  updated_at: string
}

// Transform API part to frontend part type
function transformPart(apiPart: ApiPart): BasePart {
  return {
    id: apiPart.id,
    name: apiPart.name,
    maker: apiPart.maker,
    price: apiPart.price,
    specs: {},
    createdAt: '',
    updatedAt: '',
  }
}

// Transform API response to frontend type
function transformBuildDetail(api: ApiBuildDetail): PcCustomSet {
  // Build a map of parts by category
  const partsByCategory: Record<string, BasePart[]> = {}

  for (const entry of api.parts) {
    if (!partsByCategory[entry.category]) {
      partsByCategory[entry.category] = []
    }
    partsByCategory[entry.category].push(transformPart(entry.part))
  }

  // Get first part of category or create placeholder
  const getPart = (category: string, index = 0): BasePart => {
    const parts = partsByCategory[category] || []
    return parts[index] || { id: 0, name: '未選択', maker: '', price: 0, specs: {}, createdAt: '', updatedAt: '' }
  }

  // Storage parts are all in 'storage' category as array
  const storageParts = partsByCategory['storage'] || []

  return {
    id: api.id,
    userId: api.user?.id || 0,
    name: api.name,
    shareToken: api.share_token,
    cpu: getPart('cpu') as PcCustomSet['cpu'],
    gpu: getPart('gpu') as PcCustomSet['gpu'],
    memory: getPart('memory') as PcCustomSet['memory'],
    storage1: (storageParts[0] || getPart('storage')) as PcCustomSet['storage1'],
    storage2: storageParts[1] ? storageParts[1] as PcCustomSet['storage2'] : null,
    storage3: storageParts[2] ? storageParts[2] as PcCustomSet['storage3'] : null,
    os: getPart('os') as PcCustomSet['os'],
    motherboard: getPart('motherboard') as PcCustomSet['motherboard'],
    psu: getPart('psu') as PcCustomSet['psu'],
    case: getPart('case') as PcCustomSet['case'],
    totalPrice: api.total_price,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
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
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    </Card>
  )
}

export default function BuildDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionResult = useSession()
  const session = sessionResult?.data

  const id = params.id as string
  const isPreset = searchParams.get('type') === 'preset'

  const [build, setBuild] = useState<BuildData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const isOwner = !isPreset && session && build && 'userId' in build && build.userId === Number(session.user?.id)

  useEffect(() => {
    const fetchBuild = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const endpoint = isPreset ? `/presets/${id}` : `/builds/${id}`
        const token = session?.accessToken
        const response = await api.get<{ data: ApiBuildDetail }>(endpoint, token)
        setBuild(transformBuildDetail(response.data))
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

    if (session?.accessToken || isPreset) {
      fetchBuild()
    }
  }, [id, isPreset, session?.accessToken])

  const handleShare = async () => {
    if (!build) return

    setIsSharing(true)
    try {
      await shareConfiguration(
        {
          cpu_id: build.cpu?.id,
          gpu_id: build.gpu?.id,
          memory_id: build.memory?.id,
          storage1_id: build.storage1?.id,
          storage2_id: build.storage2?.id,
          storage3_id: build.storage3?.id,
          os_id: build.os?.id,
          motherboard_id: build.motherboard?.id,
          psu_id: build.psu?.id,
          case_id: build.case?.id,
        },
        build.name,
        `${build.name} - ${formatPrice(build.totalPrice)}`
      )
      // Web Share APIがない環境ではクリップボードにコピー済み
      if (!navigator.share) {
        alert('URLをコピーしました')
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        alert(`共有に失敗しました: ${err.message}`)
      }
    } finally {
      setIsSharing(false)
    }
  }

  const handleDelete = async () => {
    if (!build || isPreset) return

    setIsDeleting(true)
    try {
      await api.delete(`/builds/${id}`, session?.accessToken)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiClientError) {
        alert(`削除に失敗しました: ${err.message}`)
      } else {
        alert('削除に失敗しました。ネットワーク接続を確認してください。')
      }
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
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
        ) : build ? (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {build.name}
              </h1>
              <div className="flex gap-2">
                {isOwner && (
                  <Link href={`/configurator?edit=${id}`}>
                    <Button variant="secondary">編集</Button>
                  </Link>
                )}
                <Button
                  variant="secondary"
                  onClick={handleShare}
                  isLoading={isSharing}
                >
                  共有
                </Button>
              </div>
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
                  {build.storage2 && (
                    <PartRow label="Storage(2)" name={build.storage2.name} price={build.storage2.price} />
                  )}
                  {build.storage3 && (
                    <PartRow label="Storage(3)" name={build.storage3.name} price={build.storage3.price} />
                  )}
                  <PartRow label="OS" name={build.os?.name} price={build.os?.price} />
                </tbody>
              </table>

              <h3 className="text-md font-bold text-gray-900 mt-6 mb-4">自動推奨パーツ</h3>
              <table className="w-full text-sm">
                <tbody>
                  <PartRow label="マザーボード" name={build.motherboard?.name} price={build.motherboard?.price} />
                  <PartRow label="電源" name={build.psu?.name} price={build.psu?.price} />
                  <PartRow label="ケース" name={build.case?.name} price={build.case?.price} />
                </tbody>
              </table>

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                <span className="font-medium text-gray-900">合計</span>
                <span className="text-2xl font-bold text-custom-blue">
                  {formatPrice(build.totalPrice)}
                </span>
              </div>
            </Card>

            {/* Meta Info */}
            <div className="text-sm text-gray-500 mb-6">
              作成日: {build.createdAt ? formatDate(build.createdAt) : '-'}
            </div>

            {/* Delete Button */}
            {isOwner && (
              <div className="text-center">
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  この構成を削除
                </Button>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="構成を削除"
        message="この構成を削除しますか？この操作は取り消せません。"
        confirmLabel="削除する"
        cancelLabel="キャンセル"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
