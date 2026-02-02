'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/app/components/ui/Card'
import { Button } from '@/app/components/ui/Button'
import { Select } from '@/app/components/ui/Select'
import { Skeleton } from '@/app/components/ui/Skeleton'
import { ScrollToTopButton } from '@/app/components/ui/ScrollToTopButton'
import { api, ApiResponse, ApiClientError } from '@/lib/api'

const ROLES = [
  { value: 'user', label: 'ユーザー' },
  { value: 'admin', label: '管理者' },
]

interface User {
  id: number
  email: string
  name: string | null
  role: string
  confirmed: boolean
  created_at: string
  updated_at: string
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function getRoleLabel(role: string): string {
  const found = ROLES.find((r) => r.value === role)
  return found?.label || role
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const fetchUsers = useCallback(async () => {
    if (!session?.accessToken) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
      })

      const data = await api.get<ApiResponse<User[]>>(
        `/admin/users?${params}`,
        session.accessToken
      )

      setUsers(data.data || [])
      setTotalPages(Math.ceil((data.meta?.total || 0) / (data.meta?.per_page || 20)))
    } catch (error) {
      console.error('ユーザーの取得に失敗:', error)
    } finally {
      setLoading(false)
    }
  }, [page, session?.accessToken])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!session?.accessToken) return

    setUpdatingId(userId)
    try {
      await api.patch<{ data: User }>(
        `/admin/users/${userId}`,
        { role: newRole },
        session.accessToken
      )
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      )
    } catch (error) {
      console.error('ロール変更に失敗:', error)
      if (error instanceof ApiClientError) {
        alert(`ロール変更に失敗しました: ${error.message}`)
      } else {
        alert('ロール変更に失敗しました')
      }
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ユーザー管理</h1>
      </div>

      {/* ユーザー一覧 */}
      <Card padding="none" shadow="sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  メールアドレス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  名前
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ロール
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登録日
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    ユーザーが登録されていません
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        options={ROLES}
                        disabled={updatingId === user.id || user.id === Number(session?.user?.id)}
                        className={`w-32 ${user.id === Number(session?.user?.id) ? 'opacity-50' : ''}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.confirmed ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          確認済み
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          未確認
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            前へ
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            次へ
          </Button>
        </div>
      )}

      {/* 注意書き */}
      <div className="text-sm text-gray-500">
        <p>※ 自分自身のロールは変更できません。</p>
      </div>

      {/* トップへ戻るボタン */}
      <ScrollToTopButton />
    </div>
  )
}
