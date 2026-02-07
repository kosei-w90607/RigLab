interface ExternalLinkBadgeProps {
  rakutenUrl?: string | null
  amazonUrl?: string | null
}

export function ExternalLinkBadge({ rakutenUrl, amazonUrl }: ExternalLinkBadgeProps) {
  if (!rakutenUrl && !amazonUrl) return null

  return (
    <div className="flex gap-2">
      {rakutenUrl && (
        <a
          href={rakutenUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          楽天
        </a>
      )}
      {amazonUrl && (
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          Amazon
        </a>
      )}
    </div>
  )
}
