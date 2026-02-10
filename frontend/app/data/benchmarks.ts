// CPU Benchmark Data (Cinebench R23 + PassMark CPU Mark scores - public benchmark references)
export interface CpuBenchmark {
  name: string
  multiScore: number
  singleScore: number
  passMarkScore: number
}

export const CPU_BENCHMARKS: CpuBenchmark[] = [
  // Intel 13th/14th Gen
  { name: 'Intel Core i5-13400F', multiScore: 14311, singleScore: 1796, passMarkScore: 25013 },
  { name: 'Intel Core i5-14400F', multiScore: 16124, singleScore: 1791, passMarkScore: 25618 },
  { name: 'Intel Core i7-13700F', multiScore: 25403, singleScore: 2026, passMarkScore: 38031 },
  { name: 'Intel Core i7-14700F', multiScore: 34805, singleScore: 2097, passMarkScore: 41463 },
  { name: 'Intel Core i9-14900K', multiScore: 38497, singleScore: 2358, passMarkScore: 58454 },
  { name: 'Intel Core i5-14400', multiScore: 16900, singleScore: 1790, passMarkScore: 25306 },
  // Intel 15th Gen Arrow Lake
  { name: 'Intel Core Ultra 5 245K', multiScore: 25099, singleScore: 2118, passMarkScore: 43292 },
  { name: 'Intel Core Ultra 7 265K', multiScore: 37273, singleScore: 2303, passMarkScore: 58720 },
  { name: 'Intel Core Ultra 9 285K', multiScore: 41583, singleScore: 2318, passMarkScore: 67384 },
  // AMD Ryzen 7000
  { name: 'AMD Ryzen 5 7600', multiScore: 14389, singleScore: 1851, passMarkScore: 27014 },
  { name: 'AMD Ryzen 5 7600X', multiScore: 15204, singleScore: 1951, passMarkScore: 28321 },
  { name: 'AMD Ryzen 7 7700X', multiScore: 20001, singleScore: 1989, passMarkScore: 35582 },
  { name: 'AMD Ryzen 7 7800X3D', multiScore: 17762, singleScore: 1817, passMarkScore: 34287 },
  { name: 'AMD Ryzen 9 7900X', multiScore: 29242, singleScore: 2033, passMarkScore: 51292 },
  { name: 'AMD Ryzen 9 7950X', multiScore: 38165, singleScore: 2059, passMarkScore: 62238 },
  // AMD Ryzen 9000
  { name: 'AMD Ryzen 5 9600X', multiScore: 16284, singleScore: 2119, passMarkScore: 30029 },
  { name: 'AMD Ryzen 7 9700X', multiScore: 19539, singleScore: 2160, passMarkScore: 37105 },
  { name: 'AMD Ryzen 7 9800X3D', multiScore: 23349, singleScore: 2072, passMarkScore: 39975 },
  { name: 'AMD Ryzen 9 9900X', multiScore: 32626, singleScore: 2232, passMarkScore: 54444 },
  { name: 'AMD Ryzen 9 9900X3D', multiScore: 34524, singleScore: 2258, passMarkScore: 56262 },
  { name: 'AMD Ryzen 9 9950X', multiScore: 42074, singleScore: 2243, passMarkScore: 65839 },
  { name: 'AMD Ryzen 9 9950X3D', multiScore: 42369, singleScore: 2240, passMarkScore: 70190 },
]

// GPU Benchmark Data (3DMark Time Spy scores)
export interface GpuBenchmark {
  name: string
  timeSpyScore: number
}

export const GPU_BENCHMARKS: GpuBenchmark[] = [
  // NVIDIA RTX 40 Series
  { name: 'NVIDIA GeForce RTX 4060', timeSpyScore: 10615 },
  { name: 'NVIDIA GeForce RTX 4060 Ti', timeSpyScore: 13494 },
  { name: 'NVIDIA GeForce RTX 4060 Ti 16GB', timeSpyScore: 13494 },
  { name: 'NVIDIA GeForce RTX 4070', timeSpyScore: 17887 },
  { name: 'NVIDIA GeForce RTX 4070 Super', timeSpyScore: 21035 },
  { name: 'NVIDIA GeForce RTX 4070 Ti Super', timeSpyScore: 24314 },
  { name: 'NVIDIA GeForce RTX 4080 Super', timeSpyScore: 28304 },
  { name: 'NVIDIA GeForce RTX 4090', timeSpyScore: 36328 },
  // NVIDIA RTX 50 Series
  { name: 'NVIDIA GeForce RTX 5070', timeSpyScore: 22544 },
  { name: 'NVIDIA GeForce RTX 5070 Ti', timeSpyScore: 27607 },
  { name: 'NVIDIA GeForce RTX 5080', timeSpyScore: 33116 },
  { name: 'NVIDIA GeForce RTX 5090', timeSpyScore: 47510 },
  // AMD Radeon RX 7000
  { name: 'AMD Radeon RX 7600', timeSpyScore: 10990 },
  { name: 'AMD Radeon RX 7700 XT', timeSpyScore: 17075 },
  { name: 'AMD Radeon RX 7800 XT', timeSpyScore: 20086 },
  { name: 'AMD Radeon RX 7900 XT', timeSpyScore: 26829 },
  // AMD Radeon RX 9000
  { name: 'AMD Radeon RX 9070', timeSpyScore: 26876 },
  { name: 'AMD Radeon RX 9070 XT', timeSpyScore: 30445 },
  // Intel Arc
  { name: 'Intel Arc B580', timeSpyScore: 14701 },
]
