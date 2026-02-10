import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'RigLab - カスタムPC構成'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

interface Part {
  name: string
  price: number
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price)
}

async function fetchPartsFromShareToken(token: string): Promise<{ parts: Record<string, Part | null>; totalPrice: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/share_tokens/${token}`)
    if (!response.ok) return { parts: {}, totalPrice: 0 }
    const json = await response.json()
    const data = json.data
    const parts: Record<string, Part | null> = {}
    if (data.parts) {
      for (const p of data.parts) {
        parts[p.category] = p.part
      }
    }
    return { parts, totalPrice: data.totalPrice || data.total_price || 0 }
  } catch {
    return { parts: {}, totalPrice: 0 }
  }
}

export default async function Image({
  params,
  searchParams,
}: {
  params: Record<string, string>
  searchParams: Record<string, string>
}) {
  const shareToken = searchParams.token

  let cpu: Part | null = null
  let gpu: Part | null = null
  let memory: Part | null = null
  let storage: Part | null = null
  let os: Part | null = null
  let totalPrice = 0

  if (shareToken) {
    try {
      const result = await fetchPartsFromShareToken(shareToken)
      cpu = result.parts.cpu || null
      gpu = result.parts.gpu || null
      memory = result.parts.memory || null
      storage = result.parts.storage || null
      os = result.parts.os || null
      totalPrice = result.totalPrice
    } catch {
      // Use default values
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          padding: '40px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#1f2937',
            }}
          >
            RigLab
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: '80%',
            height: '2px',
            backgroundColor: '#e5e7eb',
            marginBottom: '30px',
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '30px',
          }}
        >
          カスタムPC構成
        </div>

        {/* Parts Table */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '80%',
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          {cpu && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <span style={{ color: '#6b7280', fontSize: '24px' }}>CPU</span>
              <span style={{ color: '#1f2937', fontSize: '24px' }}>{cpu.name}</span>
            </div>
          )}
          {gpu && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <span style={{ color: '#6b7280', fontSize: '24px' }}>GPU</span>
              <span style={{ color: '#1f2937', fontSize: '24px' }}>{gpu.name}</span>
            </div>
          )}
          {memory && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <span style={{ color: '#6b7280', fontSize: '24px' }}>Memory</span>
              <span style={{ color: '#1f2937', fontSize: '24px' }}>{memory.name}</span>
            </div>
          )}
          {storage && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid #e5e7eb',
              }}
            >
              <span style={{ color: '#6b7280', fontSize: '24px' }}>Storage</span>
              <span style={{ color: '#1f2937', fontSize: '24px' }}>{storage.name}</span>
            </div>
          )}
          {os && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
              }}
            >
              <span style={{ color: '#6b7280', fontSize: '24px' }}>OS</span>
              <span style={{ color: '#1f2937', fontSize: '24px' }}>{os.name}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            width: '80%',
            height: '2px',
            backgroundColor: '#e5e7eb',
            marginTop: '30px',
            marginBottom: '20px',
          }}
        />

        {/* Total Price */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#3b82f6',
          }}
        >
          合計: {formatPrice(totalPrice)}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
