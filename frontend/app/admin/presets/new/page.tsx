'use client'

import Link from 'next/link'
import { PresetForm } from '../_components/PresetForm'

export default function NewPresetPage() {
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/presets"
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">プリセット新規登録</h1>
      </div>

      {/* フォーム */}
      <PresetForm />
    </div>
  )
}
