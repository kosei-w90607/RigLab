import { api, ApiClientError } from './api'

interface SharePayload {
  cpu_id?: number | null
  gpu_id?: number | null
  memory_id?: number | null
  storage1_id?: number | null
  storage2_id?: number | null
  storage3_id?: number | null
  os_id?: number | null
  motherboard_id?: number | null
  psu_id?: number | null
  case_id?: number | null
}

interface ShareTokenResponse {
  data: {
    token: string
    url: string
  }
}

export async function createShareUrl(parts: SharePayload): Promise<string> {
  // null/undefined値を除外
  const cleanedParts = Object.fromEntries(
    Object.entries(parts).filter(([, v]) => v != null)
  )

  const response = await api.post<ShareTokenResponse>('/share_tokens', cleanedParts)
  return `${window.location.origin}${response.data.url}`
}

export async function shareConfiguration(
  parts: SharePayload,
  title: string,
  text: string
): Promise<void> {
  const shareUrl = await createShareUrl(parts)

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: shareUrl })
    } catch (err) {
      // ユーザーがシェアをキャンセルした場合はエラーとしない
      if (err instanceof Error && err.name === 'AbortError') {
        return
      }
      throw err
    }
  } else {
    await navigator.clipboard.writeText(shareUrl)
  }
}

export { ApiClientError }
