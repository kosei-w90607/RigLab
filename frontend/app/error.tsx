'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          エラーが発生しました
        </h2>
        <p className="text-gray-600 mb-6">
          申し訳ありません。予期しないエラーが発生しました。
          <br />
          再度お試しください。
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-custom-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          もう一度試す
        </button>
      </div>
    </div>
  )
}
