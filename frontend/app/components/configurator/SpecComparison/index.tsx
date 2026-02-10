'use client'

import type { PartsCpu, PartsGpu } from '@/types'
import { CpuComparison } from './CpuComparison'
import { GpuComparison } from './GpuComparison'

interface Props {
  cpus: PartsCpu[]
  gpus: PartsGpu[]
}

export function SpecComparisonSection({ cpus, gpus }: Props) {
  return (
    <div className="mt-8 space-y-4">
      {/* CPU 性能比較 */}
      <div className="collapse collapse-arrow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <input type="checkbox" />
        <div className="collapse-title text-lg font-bold">
          CPU 性能比較表
        </div>
        <div className="collapse-content">
          <CpuComparison cpus={cpus} />
        </div>
      </div>

      {/* GPU 性能比較 */}
      <div className="collapse collapse-arrow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
        <input type="checkbox" />
        <div className="collapse-title text-lg font-bold">
          GPU 性能比較表
        </div>
        <div className="collapse-content">
          <GpuComparison gpus={gpus} />
        </div>
      </div>
    </div>
  )
}
