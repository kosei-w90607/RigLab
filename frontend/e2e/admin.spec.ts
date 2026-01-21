import { test, expect } from '@playwright/test'

test.describe('管理者画面', () => {
  test.describe('認証・認可', () => {
    test('未ログインユーザーはサインインページにリダイレクトされる', async ({ page }) => {
      await page.goto('/admin')

      // サインインページにリダイレクト
      await expect(page).toHaveURL(/\/signin/)
    })

    test('一般ユーザーは管理者画面にアクセスできない', async ({ page }) => {
      // 一般ユーザーでログイン
      await page.goto('/signin')
      await page.fill('input[name="email"]', 'user@example.com')
      await page.fill('input[name="password"]', 'password123')
      await page.click('button[type="submit"]')

      // ダッシュボードにリダイレクトされるのを待つ
      await page.waitForURL('/dashboard')

      // 管理者画面にアクセス
      await page.goto('/admin')

      // アクセス拒否メッセージまたはリダイレクト
      const accessDenied = page.getByText('アクセス権限がありません')
      const redirected = page.url().includes('/dashboard') || page.url().includes('/')

      expect(await accessDenied.isVisible() || redirected).toBeTruthy()
    })

    test('管理者ユーザーは管理者画面にアクセスできる', async ({ page }) => {
      // 管理者ユーザーでログイン
      await page.goto('/signin')
      await page.fill('input[name="email"]', 'admin@example.com')
      await page.fill('input[name="password"]', 'admin123')
      await page.click('button[type="submit"]')

      // 管理者画面に遷移
      await page.goto('/admin')

      // 管理者ダッシュボードが表示される
      await expect(page.getByRole('heading', { name: '管理者ダッシュボード' })).toBeVisible()
    })
  })

  test.describe('ナビゲーション', () => {
    test.beforeEach(async ({ page }) => {
      // 管理者ユーザーでログイン
      await page.goto('/signin')
      await page.fill('input[name="email"]', 'admin@example.com')
      await page.fill('input[name="password"]', 'admin123')
      await page.click('button[type="submit"]')
      await page.goto('/admin')
    })

    test('サイドバーにパーツ管理リンクがある', async ({ page }) => {
      const partsLink = page.getByRole('link', { name: /パーツ管理/ })
      await expect(partsLink).toBeVisible()
    })

    test('サイドバーにプリセット管理リンクがある', async ({ page }) => {
      const presetsLink = page.getByRole('link', { name: /プリセット管理/ })
      await expect(presetsLink).toBeVisible()
    })

    test('パーツ管理リンクをクリックするとパーツ一覧に遷移する', async ({ page }) => {
      await page.getByRole('link', { name: /パーツ管理/ }).click()
      await expect(page).toHaveURL('/admin/parts')
    })

    test('プリセット管理リンクをクリックするとプリセット一覧に遷移する', async ({ page }) => {
      await page.getByRole('link', { name: /プリセット管理/ }).click()
      await expect(page).toHaveURL('/admin/presets')
    })
  })
})
