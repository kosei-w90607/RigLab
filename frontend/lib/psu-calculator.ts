/** TDP合計に対する余裕率 */
export const PSU_OVERHEAD_MULTIPLIER = 1.5

/** ベース加算ワット数（W） */
export const PSU_BASE_WATTAGE = 100

/** CPU + GPU の TDP から推奨 PSU ワット数を計算する */
export function calculateRecommendedPsuWattage(cpuTdp: number, gpuTdp: number): number {
  return Math.ceil((cpuTdp + gpuTdp) * PSU_OVERHEAD_MULTIPLIER + PSU_BASE_WATTAGE)
}
