import { test, expect } from '@playwright/test'

test.describe('セキュリティヘッダー検証', () => {
  test('レスポンスに必要なセキュリティヘッダーが含まれる', async ({ page }) => {
    const response = await page.goto('/')
    expect(response).not.toBeNull()
    const headers = response!.headers()

    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-xss-protection']).toBe('1; mode=block')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['permissions-policy']).toBe('geolocation=(), microphone=(), camera=()')
    expect(headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains')
  })

  test('CSP に nonce ベースの script-src が含まれる', async ({ page }) => {
    const response = await page.goto('/')
    expect(response).not.toBeNull()
    const csp = response!.headers()['content-security-policy']

    expect(csp).toContain("default-src 'self'")
    expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=]+' 'strict-dynamic'/)
    expect(csp).not.toContain("'unsafe-inline'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("base-uri 'self'")
    expect(csp).toContain("form-action 'self'")
  })

  test('各リクエストで異なる nonce が生成される', async ({ page }) => {
    const response1 = await page.goto('/')
    const csp1 = response1!.headers()['content-security-policy']
    const nonce1 = csp1.match(/nonce-([A-Za-z0-9+/=]+)/)?.[1]

    const response2 = await page.goto('/')
    const csp2 = response2!.headers()['content-security-policy']
    const nonce2 = csp2.match(/nonce-([A-Za-z0-9+/=]+)/)?.[1]

    expect(nonce1).toBeDefined()
    expect(nonce2).toBeDefined()
    expect(nonce1).not.toBe(nonce2)
  })
})

test.describe('callbackUrl オープンリダイレクト防止', () => {
  test.describe('サインインページ', () => {
    test('外部URL（https）が無視される', async ({ page }) => {
      await page.goto('/signin?callbackUrl=https://evil.com')

      await expect(page).toHaveURL('/signin?callbackUrl=https://evil.com')
      await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()

      const link = page.getByRole('link', { name: '新規登録' })
      await expect(link).toHaveAttribute('href', '/signup')
    })

    test('プロトコル相対URL（//）が無視される', async ({ page }) => {
      await page.goto('/signin?callbackUrl=//evil.com')

      await expect(page).toHaveURL('/signin?callbackUrl=//evil.com')
      await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()

      const link = page.getByRole('link', { name: '新規登録' })
      await expect(link).toHaveAttribute('href', '/signup')
    })

    test('javascript: スキームが無視される', async ({ page }) => {
      await page.goto('/signin?callbackUrl=javascript:alert(1)')

      await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()

      const link = page.getByRole('link', { name: '新規登録' })
      await expect(link).toHaveAttribute('href', '/signup')
    })

    test('正当な相対パスが保持される', async ({ page }) => {
      await page.goto('/signin?callbackUrl=/mypage')

      await expect(page).toHaveURL('/signin?callbackUrl=/mypage')
      await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()

      const link = page.getByRole('link', { name: '新規登録' })
      await expect(link).toHaveAttribute('href', '/signup?callbackUrl=%2Fmypage')
    })
  })

  test.describe('サインアップページ', () => {
    test('外部URL（https）が無視される', async ({ page }) => {
      await page.goto('/signup?callbackUrl=https://evil.com')

      await expect(page).toHaveURL('/signup?callbackUrl=https://evil.com')
      await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible()
      await expect(page.getByRole('button', { name: '登録する' })).toBeVisible()

      const link = page.locator('main').getByRole('link', { name: 'ログイン' })
      await expect(link).toHaveAttribute('href', '/signin')
    })

    test('プロトコル相対URL（//）が無視される', async ({ page }) => {
      await page.goto('/signup?callbackUrl=//evil.com')

      await expect(page).toHaveURL('/signup?callbackUrl=//evil.com')
      await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible()

      const link = page.locator('main').getByRole('link', { name: 'ログイン' })
      await expect(link).toHaveAttribute('href', '/signin')
    })

    test('javascript: スキームが無視される', async ({ page }) => {
      await page.goto('/signup?callbackUrl=javascript:alert(1)')

      await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible()

      const link = page.locator('main').getByRole('link', { name: 'ログイン' })
      await expect(link).toHaveAttribute('href', '/signin')
    })

    test('正当な相対パスが保持される', async ({ page }) => {
      await page.goto('/signup?callbackUrl=/mypage')

      await expect(page).toHaveURL('/signup?callbackUrl=/mypage')
      await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible()

      const link = page.locator('main').getByRole('link', { name: 'ログイン' })
      await expect(link).toHaveAttribute('href', '/signin?callbackUrl=%2Fmypage')
    })
  })
})
