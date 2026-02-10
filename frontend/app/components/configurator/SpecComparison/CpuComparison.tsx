'use client'

import { useMemo } from 'react'
import type { PartsCpu } from '@/types'
import { CPU_BENCHMARKS, type CpuBenchmark } from '@/app/data/benchmarks'
import { useSortableData } from './useSortableData'

interface Props {
  cpus: PartsCpu[]
}

interface CpuTableRow {
  fullName: string
  passMarkScore: number
  cores: number
  threads: number
  baseClock: number
  boostClock: number
  tdp: number
  price: number
  costPerformance: number
  barColor: string
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

export function CpuComparison({ cpus }: Props) {
  const data: CpuTableRow[] = useMemo(() => {
    return cpus
      .map((cpu) => {
        const benchmark = CPU_BENCHMARKS.find((b: CpuBenchmark) => b.name === cpu.name)
        if (!benchmark) return null
        const specs = cpu.specs as Record<string, unknown>
        const score = benchmark.passMarkScore
        const costPerf = Math.round((score / cpu.price) * 100) / 100
        return {
          fullName: cpu.name,
          passMarkScore: score,
          cores: specs.cores as number,
          threads: specs.threads as number,
          baseClock: specs.baseClock as number,
          boostClock: specs.boostClock as number,
          tdp: cpu.tdp,
          price: cpu.price,
          costPerformance: costPerf,
          barColor: cpu.maker === 'Intel' ? 'bg-blue-500' : 'bg-red-500',
        }
      })
      .filter((item): item is CpuTableRow => item !== null)
  }, [cpus])

  const maxScore = useMemo(
    () => Math.max(...data.map((d) => d.passMarkScore), 1),
    [data]
  )

  const { sortedData, sortKey, sortOrder, requestSort } = useSortableData(
    data,
    'passMarkScore',
    'desc'
  )

  if (data.length === 0) return null

  const columns: { key: keyof CpuTableRow; label: string }[] = [
    { key: 'passMarkScore', label: 'PassMark' },
    { key: 'cores', label: 'コア' },
    { key: 'threads', label: 'スレッド' },
    { key: 'baseClock', label: '定格' },
    { key: 'boostClock', label: '最大' },
    { key: 'tdp', label: 'TDP' },
    { key: 'price', label: '参考価格' },
    { key: 'costPerformance', label: 'コスパ' },
  ]

  return (
    <div className="space-y-4">
      <div className="text-sm text-base-content/70 space-y-1">
        <p><strong>コア数</strong>：並列処理の能力。マルチタスクや動画エンコードに影響します。</p>
        <p><strong>クロック</strong>：1秒間の処理速度。ゲームなどシングルスレッド性能に影響します。</p>
        <p><strong>TDP</strong>：消費電力の目安。冷却や電源容量の参考になります。</p>
        <p><strong>PassMark</strong>：CPU総合性能を測定する業界標準ベンチマーク。スコアが高いほど高性能です。</p>
        <p><strong>コスパ</strong>：1円あたりのPassMarkのスコアです（小数点第3位を四捨五入）。</p>
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
                  className={col.key === 'passMarkScore' ? 'w-40' : 'whitespace-nowrap text-right'}
                  aria-sort={
                    sortKey === col.key
                      ? sortOrder === 'asc' ? 'ascending' : 'descending'
                      : 'none'
                  }
                >
                  <button
                    type="button"
                    className={`flex items-center ${col.key === 'passMarkScore' ? '' : 'ml-auto'}`}
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
            {sortedData.map((cpu) => {
              const pct = (cpu.passMarkScore / maxScore) * 100
              return (
                <tr key={cpu.fullName}>
                  <td className="font-medium text-xs truncate" title={cpu.fullName}>
                    {cpu.fullName}
                  </td>
                  <td className="p-1">
                    <div className="relative h-5 w-full rounded bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`absolute inset-y-0 left-0 rounded ${cpu.barColor}`}
                        style={{ width: `${pct}%`, minWidth: '3rem' }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white drop-shadow-sm">
                        {cpu.passMarkScore.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="text-right whitespace-nowrap">{cpu.cores}</td>
                  <td className="text-right whitespace-nowrap">{cpu.threads}</td>
                  <td className="text-right whitespace-nowrap">{cpu.baseClock}GHz</td>
                  <td className="text-right whitespace-nowrap">{cpu.boostClock}GHz</td>
                  <td className="text-right whitespace-nowrap">{cpu.tdp}W</td>
                  <td className="text-right whitespace-nowrap">¥{cpu.price.toLocaleString()}</td>
                  <td className="text-right whitespace-nowrap">{cpu.costPerformance.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
