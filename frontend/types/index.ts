// ============================================
// User
// ============================================
export interface User {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

// ============================================
// Parts - Base
// ============================================
export interface BasePart {
  id: number
  name: string
  maker: string
  price: number
  specs: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// ============================================
// Parts - CPU
// ============================================
export type SocketType = 'LGA1700' | 'LGA1200' | 'AM5' | 'AM4'
export type MemoryType = 'DDR4' | 'DDR5'

export interface PartsCpu extends BasePart {
  socket: SocketType
  tdp: number
  memoryType: MemoryType
}

// ============================================
// Parts - GPU
// ============================================
export interface PartsGpu extends BasePart {
  tdp: number
  lengthMm: number
}

// ============================================
// Parts - Memory
// ============================================
export interface PartsMemory extends BasePart {
  memoryType: MemoryType
}

// ============================================
// Parts - Storage
// ============================================
export interface PartsStorage extends BasePart {}

// ============================================
// Parts - OS
// ============================================
export interface PartsOs extends BasePart {}

// ============================================
// Parts - Motherboard
// ============================================
export type FormFactor = 'ATX' | 'mATX' | 'ITX'

export interface PartsMotherboard extends BasePart {
  socket: SocketType
  memoryType: MemoryType
  formFactor: FormFactor
}

// ============================================
// Parts - PSU
// ============================================
export type PsuFormFactor = 'ATX' | 'SFX'

export interface PartsPsu extends BasePart {
  wattage: number
  formFactor: PsuFormFactor
}

// ============================================
// Parts - Case
// ============================================
export interface PartsCase extends BasePart {
  formFactor: FormFactor
  maxGpuLengthMm: number
}

// ============================================
// Parts - Union Type
// ============================================
export type Part =
  | PartsCpu
  | PartsGpu
  | PartsMemory
  | PartsStorage
  | PartsOs
  | PartsMotherboard
  | PartsPsu
  | PartsCase

export type PartType =
  | 'cpu'
  | 'gpu'
  | 'memory'
  | 'storage'
  | 'os'
  | 'motherboard'
  | 'psu'
  | 'case'

// ============================================
// PC Entrust Set (Preset)
// ============================================
export type BudgetRange = 'under_100k' | '100k_300k' | 'over_300k' | 'any'
export type UseCase = 'gaming' | 'creative' | 'office'

export interface PcEntrustSet {
  id: number
  name: string
  description?: string
  budgetRange: BudgetRange
  useCase: UseCase
  cpu: PartsCpu | null
  gpu: PartsGpu | null
  memory: PartsMemory | null
  storage1: PartsStorage | null
  storage2: PartsStorage | null
  storage3: PartsStorage | null
  os?: PartsOs | null
  motherboard?: PartsMotherboard | null
  psu?: PartsPsu | null
  case?: PartsCase | null
  totalPrice: number
  createdAt?: string
  updatedAt?: string
}

// ============================================
// PC Custom Set (Build)
// ============================================
export interface PcCustomSet {
  id: number
  userId: number
  name: string
  shareToken: string
  cpu: PartsCpu
  gpu: PartsGpu
  memory: PartsMemory
  storage1: PartsStorage
  storage2: PartsStorage | null
  storage3: PartsStorage | null
  os: PartsOs
  motherboard: PartsMotherboard
  psu: PartsPsu
  case: PartsCase
  totalPrice: number
  createdAt: string
  updatedAt: string
}

// ============================================
// API Request Types
// ============================================
export interface CreateBuildRequest {
  name: string
  cpuId: number
  gpuId: number
  memoryId: number
  storage1Id: number
  storage2Id?: number
  storage3Id?: number
  osId: number
}

export interface UpdateBuildRequest extends Partial<CreateBuildRequest> {}

export interface SearchPresetsParams {
  budgetRange?: BudgetRange
  useCase?: UseCase
}

// ============================================
// Compatibility Check
// ============================================
export interface CompatibilityResult {
  compatible: boolean
  issues: CompatibilityIssue[]
}

export interface CompatibilityIssue {
  type: 'socket' | 'memory' | 'gpu_length' | 'power'
  message: string
  severity: 'error' | 'warning'
}

// ============================================
// Price History & Buy Advice
// ============================================
export interface PriceHistory {
  price: number
  source: string
  fetchedAt: string
}

export interface PriceTrend {
  direction: 'up' | 'down' | 'stable'
  changePercent: number
  minPrice: number
  maxPrice: number
  avgPrice: number
}

export interface PriceHistoryResponse {
  partType: string
  partId: number
  partName: string
  currentPrice: number
  initialPrice: number | null
  priceSinceLaunch: number | null
  rakutenUrl: string | null
  rakutenImageUrl: string | null
  histories: PriceHistory[]
  trend: PriceTrend | null
}

export type BuyVerdict = 'buy_now' | 'wait' | 'neutral'

export interface BuyAdvice {
  verdict: BuyVerdict
  message: string
  confidence: number
  trendSummary: {
    direction: 'up' | 'down' | 'stable'
    changePercent: number
    minPrice: number
    maxPrice: number
    avgPrice: number
    currentPrice: number
  } | null
}

export interface BuyAdviceSummary {
  bestDeals: {
    partType: string
    partId: number
    partName: string
    currentPrice: number
    changePercent: number
    verdict: BuyVerdict
    message: string
  }[]
  categoryTrends: {
    category: string
    label: string
    avgChangePercent: number
    direction: 'up' | 'down' | 'stable'
    partCount: number
  }[]
  biggestDrops: {
    partType: string
    partId: number
    partName: string
    currentPrice: number
    changePercent: number
    verdict: BuyVerdict
    message: string
  }[]
  biggestRises: {
    partType: string
    partId: number
    partName: string
    currentPrice: number
    changePercent: number
    verdict: BuyVerdict
    message: string
  }[]
}
