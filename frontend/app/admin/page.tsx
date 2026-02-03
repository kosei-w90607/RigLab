'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card } from '@/app/components/ui/Card'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { api, ApiResponse } from '@/lib/api'

interface Part {
  id: number
  name: string
}

interface Preset {
  id: number
  name: string
}

interface DashboardStats {
  parts: {
    total: number
    byCategory: Record<string, number>
  }
  presets: {
    total: number
  }
  users: {
    total: number
  }
}

function StatCard({
  title,
  value,
  icon,
  href,
  color = 'blue',
}: {
  title: string
  value: number | string
  icon: React.ReactNode
  href: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  }

  return (
    <Link href={href}>
      <Card padding="lg" shadow="sm" className="hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <div className="text-white">{icon}</div>
          </div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}

function QuickAction({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: React.ReactNode
}) {
  return (
    <Link href={href}>
      <Card padding="md" shadow="sm" className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start gap-3">
          <div className="text-blue-600">{icon}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // パーツ数を取得
        const partsData = await api.get<ApiResponse<Part[]>>('/parts?per_page=1')

        // プリセット数を取得
        const presetsData = await api.get<ApiResponse<Preset[]>>('/presets?per_page=1')

        setStats({
          parts: {
            total: partsData.meta?.total || 0,
            byCategory: {},
          },
          presets: {
            total: presetsData.meta?.total || 0,
          },
          users: {
            total: 0, // ユーザー数APIは管理者APIとして別途実装が必要
          },
        })
      } catch (error) {
        console.error('統計情報の取得に失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">管理ダッシュボード</h1>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="登録パーツ数"
          value={stats?.parts.total || 0}
          href="/admin/parts"
          color="blue"
          icon={
            <svg className="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          }
        />
        <StatCard
          title="プリセット数"
          value={stats?.presets.total || 0}
          href="/admin/presets"
          color="green"
          icon={
            <svg className="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <StatCard
          title="ようこそ"
          value={session?.user?.name || '管理者'}
          href="/admin"
          color="purple"
          icon={
            <svg className="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
      </div>

      {/* クイックアクション */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="パーツを追加"
            description="新しいパーツを登録"
            href="/admin/parts/new"
            icon={
              <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          />
          <QuickAction
            title="プリセットを追加"
            description="新しいプリセットを登録"
            href="/admin/presets/new"
            icon={
              <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          />
          <QuickAction
            title="パーツ一覧"
            description="登録済みパーツを管理"
            href="/admin/parts"
            icon={
              <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            }
          />
          <QuickAction
            title="プリセット一覧"
            description="登録済みプリセットを管理"
            href="/admin/presets"
            icon={
              <svg className="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            }
          />
        </div>
      </div>

      {/* 管理者情報 */}
      <Card padding="lg" shadow="sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">管理者情報</h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-600">名前</dt>
            <dd className="text-gray-900">{session?.user?.name || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">メールアドレス</dt>
            <dd className="text-gray-900">{session?.user?.email || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-600">権限</dt>
            <dd className="text-gray-900">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {session?.user?.role || 'user'}
              </span>
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
