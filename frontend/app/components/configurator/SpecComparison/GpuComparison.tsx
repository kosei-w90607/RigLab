'use client'

import { useMemo } from 'react'
import type { PartsGpu } from '@/types'
import { GPU_BENCHMARKS, type GpuBenchmark } from '@/app/data/benchmarks'
import { useSortableData } from './useSortableData'

interface Props {
  gpus: PartsGpu[]
}

interface GpuTableRow {
  fullName: string
  timeSpyScore: number
  vram: number
  memoryType: string
  tdp: number
  price: number
  costPerformance: number
  barColor: string
}

function getGpuBarColor(maker: string): string {
  switch (maker) {
    case 'NVIDIA': return 'bg-green-500'
    case 'AMD': return 'bg-red-500'
    case 'Intel': return 'bg-blue-500'
    default: return 'bg-gray-500'
  }
}

function SortIcon({ column, sortKey, sortOrder }: {
  column: string
  sortKey: string
  sortOrder: 'asc' | 'desc'
}) {
  if (column === sortKey) {
    return <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
  }
  return <span className="ml-1 text-gray-400 dark:text-gray-500">⇅</span>
}

export function GpuComparison({ gpus }: Props) {
  const data: GpuTableRow[] = useMemo(() => {
    return gpus
      .map((gpu) => {
        const benchmark = GPU_BENCHMARKS.find((b: GpuBenchmark) => b.name === gpu.name)
        if (!benchmark) return null
        const specs = gpu.specs as Record<string, unknown>
        const score = benchmark.timeSpyScore
        const costPerf = Math.round((score / gpu.price) * 100) / 100
        return {
          fullName: gpu.name,
          timeSpyScore: score,
          vram: specs.vram as number,
          memoryType: specs.memoryType as string,
          tdp: gpu.tdp,
          price: gpu.price,
          costPerformance: costPerf,
          barColor: getGpuBarColor(gpu.maker),
        }
      })
      .filter((item): item is GpuTableRow => item !== null)
  }, [gpus])

  const maxScore = useMemo(
    () => Math.max(...data.map((d) => d.timeSpyScore), 1),
    [data]
  )

  const { sortedData, sortKey, sortOrder, requestSort } = useSortableData(
    data,
    'timeSpyScore',
    'desc'
  )

  if (data.length === 0) return null

  const columns: { key: keyof GpuTableRow; label: string }[] = [
    { key: 'timeSpyScore', label: 'Time Spy' },
    { key: 'vram', label: 'VRAM' },
    { key: 'memoryType', label: 'メモリ' },
    { key: 'tdp', label: 'TDP' },
    { key: 'price', label: '参考価格' },
    { key: 'costPerformance', label: 'コスパ' },
  ]

  return (
    <div className="space-y-4">
      <div className="text-sm text-base-content/70 space-y-1">
        <p><strong>VRAM</strong>：GPU専用メモリ。高解像度テクスチャや4Kゲーミングに必要です。</p>
        <p><strong>メモリタイプ</strong>：VRAMの規格。GDDR6X/GDDR7は高帯域幅を提供します。</p>
        <p><strong>TDP</strong>：消費電力の目安。電源容量選びの参考になります。</p>
        <p><strong>3DMark Time Spy</strong>：GPU性能を測定する業界標準ベンチマーク。スコアが高いほど高性能です。</p>
        <p><strong>コスパ</strong>：1円あたりの3DMark Time Spyスコアです（小数点第3位を四捨五入）。</p>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra table-xs table-fixed w-full">
          <thead>
            <tr>
              <th className="w-44">
                <button
                  type="button"
                  className="flex items-center"
                  onClick={() => requestSort('fullName')}
                >
                  製品名
                  <SortIcon column="fullName" sortKey={sortKey as string} sortOrder={sortOrder} />
                </button>
              </th>
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className={col.key === 'timeSpyScore' ? 'w-40' : 'whitespace-nowrap text-right'}
                  aria-sort={
                    sortKey === col.key
                      ? sortOrder === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                >
                  <button
                    type="button"
                    className={`flex items-center ${col.key === 'timeSpyScore' ? '' : 'ml-auto'}`}
                    onClick={() => requestSort(col.key)}
                  >
                    {col.label}
                    <SortIcon column={col.key as string} sortKey={sortKey as string} sortOrder={sortOrder} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((gpu) => {
              const pct = (gpu.timeSpyScore / maxScore) * 100
              return (
                <tr key={gpu.fullName}>
                  <td className="font-medium text-xs truncate" title={gpu.fullName}>
                    {gpu.fullName}
                  </td>
                  <td className="p-1">
                    <div className="relative h-5 w-full rounded bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`absolute inset-y-0 left-0 rounded ${gpu.barColor}`}
                        style={{ width: `${pct}%`, minWidth: '3rem' }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white drop-shadow-sm">
                        {gpu.timeSpyScore.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="text-right whitespace-nowrap">{gpu.vram}GB</td>
                  <td className="text-right whitespace-nowrap">{gpu.memoryType}</td>
                  <td className="text-right whitespace-nowrap">{gpu.tdp}W</td>
                  <td className="text-right whitespace-nowrap">¥{gpu.price.toLocaleString()}</td>
                  <td className="text-right whitespace-nowrap">{gpu.costPerformance.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
