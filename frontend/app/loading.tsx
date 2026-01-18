export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-custom-blue border-t-transparent" />
      <p className="mt-4 text-gray-600">読み込み中...</p>
    </div>
  )
}
