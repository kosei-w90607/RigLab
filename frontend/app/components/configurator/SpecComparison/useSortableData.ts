import { useState, useMemo } from 'react'

type SortOrder = 'asc' | 'desc'

export function useSortableData<T>(
  data: T[],
  defaultKey: keyof T,
  defaultOrder: SortOrder = 'desc'
) {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey)
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultOrder)

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      return 0
    })
  }, [data, sortKey, sortOrder])

  const requestSort = (key: keyof T) => {
    if (key === sortKey) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }

  return { sortedData, sortKey, sortOrder, requestSort }
}
