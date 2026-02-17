import { test, expect } from '@playwright/test'

const timestamp = Date.now()
const generateTestEmail = () => `test-${timestamp}-${Math.random().toString(36).slice(2, 7)}@example.com`
const BACKEND_URL = 'http://localhost:3001'
const LETTER_OPENER_URL = `${BACKEND_URL}/letter_opener`

async function isBackendAvailable(): Promise<boolean> {
  try {
    const response = await fetch(BACKEND_URL, { signal: AbortSignal.timeout(3000) })
    return response.ok
  } catch {
    return false
  }
}

test.describe('メール認証フロー (統合テスト)', () => {
  let backendAvailable: boolean

  test.beforeAll(async () => {
    backendAvailable = await isBackendAvailable()
  })

  test.describe('Scenario 1: signup → verify → signin', () => {
    test.describe.configure({ mode: 'serial' })

    const testEmail = generateTestEmail()
    const testPassword = 'password123'
    const testName = `E2E-${timestamp}`

    test('サインアップで確認メール送信画面が表示される', async ({ page }) => {
      test.skip(!backendAvailable, 'バックエンドが起動していません')

      await page.goto('/signup')

      await page.getByLabel('ユーザー名').fill(testName)
      await page.getByLabel('メールアドレス').fill(testEmail)
      await page.getByLabel('パスワード', { exact: true }).fill(testPassword)
      await page.getByLabel('パスワード（確認）').fill(testPassword)

      await page.getByRole('button', { name: '登録する' }).click()

      await expect(
        page.getByRole('heading', { name: '確認メールを送信しました' })
      ).toBeVisible({ timeout: 10000 })

      await expect(page.getByText(testEmail)).toBeVisible()
    })

    test('letter_opener から認証リンクでメール確認できる', async ({ page }) => {
      test.skip(!backendAvailable, 'バックエンドが起動していません')

      // letter_opener にアクセスしてメール一覧を表示
      await page.goto(LETTER_OPENER_URL)
      await page.waitForLoadState('networkidle')

      // テスト対象メールアドレスのメールをクリック
      const emailLink = page.locator(`a[target="mail"]`, { hasText: testEmail }).first()
      await expect(emailLink).toBeVisible({ timeout: 8000 })
      await emailLink.click()

      // 認証リンクを取得（ページ直接 or iframe 内を探索）
      let verifyUrl: string | null = null

      // まずページ上のすべてのフレームから検索
      await page.waitForTimeout(2000)
      for (const frame of page.frames()) {
        const link = frame.locator('a[href*="verify-email?token="]').first()
        if (await link.count() > 0) {
          verifyUrl = await link.getAttribute('href')
          break
        }
      }

      expect(verifyUrl).toBeTruthy()

      // 認証リンクに遷移（フロントエンドのURLに正規化）
      const url = new URL(verifyUrl!, 'http://localhost:3000')
      await page.goto(`/verify-email?token=${url.searchParams.get('token')}`)

      await expect(
        page.getByRole('heading', { name: 'メールアドレスを確認しました' })
      ).toBeVisible({ timeout: 10000 })
    })

    test('確認済みアカウントでサインインしてダッシュボードに遷移する', async ({ page }) => {
      test.skip(!backendAvailable, 'バックエンドが起動していません')

      await page.goto('/signin')

      await page.getByLabel('メールアドレス').fill(testEmail)
      await page.getByLabel('パスワード').fill(testPassword)

      await page.getByRole('button', { name: 'ログイン', exact: true }).click()

      await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
    })
  })

  test.describe('Scenario 2: 未確認 signin → 再送', () => {
    test.describe.configure({ mode: 'serial' })

    const unconfirmedEmail = generateTestEmail()
    const testPassword = 'password123'

    test.beforeAll(async ({ browser }) => {
      // UI 経由で未確認アカウントを作成
      const available = await isBackendAvailable()
      if (!available) return

      const context = await browser.newContext()
      const page = await context.newPage()

      await page.goto('http://localhost:3000/signup')
      await page.getByLabel('ユーザー名').fill(`Unconfirmed-${Date.now()}`)
      await page.getByLabel('メールアドレス').fill(unconfirmedEmail)
      await page.getByLabel('パスワード', { exact: true }).fill(testPassword)
      await page.getByLabel('パスワード（確認）').fill(testPassword)
      await page.getByRole('button', { name: '登録する' }).click()

      await expect(
        page.getByRole('heading', { name: '確認メールを送信しました' })
      ).toBeVisible({ timeout: 10000 })

      await context.close()
    })

    test('未確認アカウントでログイン時にエラーが表示される', async ({ page }) => {
      test.skip(!backendAvailable, 'バックエンドが起動していません')

      await page.goto('/signin')

      await page.getByLabel('メールアドレス').fill(unconfirmedEmail)
      await page.getByLabel('パスワード').fill(testPassword)

      await page.getByRole('button', { name: 'ログイン', exact: true }).click()

      await expect(
        page.getByText('メールアドレスが未確認です')
      ).toBeVisible({ timeout: 10000 })
    })

    test('確認メール再送ボタンが動作する', async ({ page }) => {
      test.skip(!backendAvailable, 'バックエンドが起動していません')

      await page.goto('/signin')

      await page.getByLabel('メールアドレス').fill(unconfirmedEmail)
      await page.getByLabel('パスワード').fill(testPassword)

      await page.getByRole('button', { name: 'ログイン', exact: true }).click()

      // 再送ボタンが表示される
      const resendButton = page.getByRole('button', { name: '確認メールを再送する' })
      await expect(resendButton).toBeVisible({ timeout: 10000 })

      // 再送ボタンをクリック
      await resendButton.click()

      // 送信完了メッセージが表示される
      await expect(
        page.getByText('確認メールを再送しました。')
      ).toBeVisible({ timeout: 10000 })
    })
  })
})

test.describe('Google ボタン表示', () => {
  // NOTE: 現状 Google ボタンは ENV に関係なく常に表示される。
  // 将来的に NEXT_PUBLIC_GOOGLE_ENABLED 等で条件描画する場合は
  // このテストを更新する。

  test('サインインページに Google ログインボタンが表示される', async ({ page }) => {
    await page.goto('/signin')

    await expect(
      page.getByRole('button', { name: 'Googleでログイン' })
    ).toBeVisible()
  })

  test('サインアップページに Google 登録ボタンが表示される', async ({ page }) => {
    await page.goto('/signup')

    await expect(
      page.getByRole('button', { name: 'Googleで登録' })
    ).toBeVisible()
  })
})
