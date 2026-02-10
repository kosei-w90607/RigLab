export interface CpuBenchmark {
  name: string
  passMarkScore: number
}

export interface GpuBenchmark {
  name: string
  timeSpyScore: number
}

export const CPU_BENCHMARKS: CpuBenchmark[] = [
  { name: 'Intel Core i5-13400F', passMarkScore: 25253 },
  { name: 'Intel Core i5-14400F', passMarkScore: 25577 },
  { name: 'Intel Core i5-14400', passMarkScore: 24850 },
  { name: 'Intel Core i7-13700F', passMarkScore: 38905 },
  { name: 'Intel Core i7-14700F', passMarkScore: 42285 },
  { name: 'Intel Core i9-14900K', passMarkScore: 60159 },
  { name: 'Intel Core Ultra 5 245K', passMarkScore: 32450 },
  { name: 'Intel Core Ultra 7 265K', passMarkScore: 47820 },
  { name: 'Intel Core Ultra 9 285K', passMarkScore: 57340 },
  { name: 'AMD Ryzen 5 7600', passMarkScore: 28768 },
  { name: 'AMD Ryzen 5 7600X', passMarkScore: 29138 },
  { name: 'AMD Ryzen 7 7700X', passMarkScore: 36290 },
  { name: 'AMD Ryzen 7 7800X3D', passMarkScore: 34610 },
  { name: 'AMD Ryzen 9 7900X', passMarkScore: 52090 },
  { name: 'AMD Ryzen 9 7950X', passMarkScore: 63557 },
  { name: 'AMD Ryzen 5 9600X', passMarkScore: 29250 },
  { name: 'AMD Ryzen 7 9700X', passMarkScore: 35420 },
  { name: 'AMD Ryzen 9 9900X', passMarkScore: 51470 },
  { name: 'AMD Ryzen 9 9950X', passMarkScore: 62820 },
  { name: 'AMD Ryzen 7 9800X3D', passMarkScore: 37150 },
  { name: 'AMD Ryzen 9 9900X3D', passMarkScore: 54310 },
  { name: 'AMD Ryzen 9 9950X3D', passMarkScore: 65890 },
]

export const GPU_BENCHMARKS: GpuBenchmark[] = [
  { name: 'NVIDIA GeForce RTX 4060', timeSpyScore: 12480 },
  { name: 'NVIDIA GeForce RTX 4060 Ti', timeSpyScore: 14730 },
  { name: 'NVIDIA GeForce RTX 4060 Ti 16GB', timeSpyScore: 14780 },
  { name: 'NVIDIA GeForce RTX 4070', timeSpyScore: 18160 },
  { name: 'NVIDIA GeForce RTX 4070 Super', timeSpyScore: 20420 },
  { name: 'NVIDIA GeForce RTX 4070 Ti Super', timeSpyScore: 23650 },
  { name: 'NVIDIA GeForce RTX 4080 Super', timeSpyScore: 28310 },
  { name: 'NVIDIA GeForce RTX 4090', timeSpyScore: 36380 },
  { name: 'NVIDIA GeForce RTX 5070', timeSpyScore: 23980 },
  { name: 'NVIDIA GeForce RTX 5070 Ti', timeSpyScore: 28750 },
  { name: 'NVIDIA GeForce RTX 5080', timeSpyScore: 33420 },
  { name: 'NVIDIA GeForce RTX 5090', timeSpyScore: 46890 },
  { name: 'AMD Radeon RX 7600', timeSpyScore: 10860 },
  { name: 'AMD Radeon RX 7700 XT', timeSpyScore: 15230 },
  { name: 'AMD Radeon RX 7800 XT', timeSpyScore: 17680 },
  { name: 'AMD Radeon RX 7900 XT', timeSpyScore: 23050 },
  { name: 'AMD Radeon RX 9070', timeSpyScore: 21340 },
  { name: 'AMD Radeon RX 9070 XT', timeSpyScore: 24180 },
  { name: 'Intel Arc B580', timeSpyScore: 10120 },
]
