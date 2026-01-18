import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-custom-blue mb-4">404</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          ページが見つかりません
        </h2>
        <p className="text-gray-600 mb-6">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-custom-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          トップページへ戻る
        </Link>
      </div>
    </div>
  )
}
