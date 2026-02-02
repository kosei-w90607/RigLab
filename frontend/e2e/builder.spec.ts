import { test, expect } from '@playwright/test'

test.describe('おまかせ構成フロー', () => {
  test.describe('おまかせ構成ページ', () => {
    test('ページが正しく表示される', async ({ page }) => {
      await page.goto('/builder')

      // タイトル確認
      await expect(page.getByRole('heading', { name: 'おまかせ構成' })).toBeVisible()

      // 予算選択カード確認
      await expect(page.getByRole('heading', { name: '予算を選択' })).toBeVisible()
      await expect(page.getByRole('button', { name: '〜15万円' })).toBeVisible()
      await expect(page.getByRole('button', { name: '15〜30万円' })).toBeVisible()
      await expect(page.getByRole('button', { name: '30万円〜' })).toBeVisible()
      await expect(page.getByRole('button', { name: '指定しない' })).toBeVisible()

      // 用途選択カード確認
      await expect(page.getByRole('heading', { name: '用途を選択' })).toBeVisible()
      // 用途ボタンはaria-pressedを持つボタンとして確認
      await expect(page.locator('button[aria-pressed]').filter({ hasText: 'ゲーム' })).toBeVisible()
      await expect(page.locator('button[aria-pressed]').filter({ hasText: 'クリエイティブ' })).toBeVisible()
      await expect(page.locator('button[aria-pressed]').filter({ hasText: '事務・普段使い' })).toBeVisible()

      // 検索ボタン確認（初期状態はdisabled）
      const searchButton = page.getByRole('button', { name: '構成を探す' })
      await expect(searchButton).toBeVisible()
      await expect(searchButton).toBeDisabled()
    })

    test('予算を選択するとボタンが有効になる', async ({ page }) => {
      await page.goto('/builder')

      const searchButton = page.getByRole('button', { name: '構成を探す' })
      await expect(searchButton).toBeDisabled()

      // 予算を選択
      await page.getByRole('button', { name: '15〜30万円' }).click()

      // ボタンが有効になる
      await expect(searchButton).toBeEnabled()
    })

    test('用途を選択するとボタンが有効になる', async ({ page }) => {
      await page.goto('/builder')

      const searchButton = page.getByRole('button', { name: '構成を探す' })
      await expect(searchButton).toBeDisabled()

      // 用途を選択（ゲームボタンをクリック）
      await page.locator('button[aria-pressed]').filter({ hasText: 'ゲーム' }).click()

      // ボタンが有効になる
      await expect(searchButton).toBeEnabled()
    })

    test('複数の用途を選択できる', async ({ page }) => {
      await page.goto('/builder')

      // ゲームを選択
      const gamingButton = page.locator('button[aria-pressed]').filter({ hasText: 'ゲーム' })
      await gamingButton.click()

      // クリエイティブを追加選択
      const creativeButton = page.locator('button[aria-pressed]').filter({ hasText: 'クリエイティブ' })
      await creativeButton.click()

      // 両方選択状態
      await expect(gamingButton).toHaveAttribute('aria-pressed', 'true')
      await expect(creativeButton).toHaveAttribute('aria-pressed', 'true')
    })
  })

  test.describe('結果ページへの遷移', () => {
    test('予算と用途を選択して検索すると結果ページに遷移する', async ({ page }) => {
      await page.goto('/builder')

      // 予算選択
      await page.getByRole('button', { name: '15〜30万円' }).click()

      // 用途選択
      await page.locator('button[aria-pressed]').filter({ hasText: 'ゲーム' }).click()

      // 検索ボタンクリック
      await page.getByRole('button', { name: '構成を探す' }).click()

      // 結果ページに遷移
      await expect(page).toHaveURL(/\/builder\/result\?/)
      await expect(page.url()).toContain('budget=100k-300k')
      await expect(page.url()).toContain('usages=gaming')
    })

    test('検索結果ページにタイトルが表示される', async ({ page }) => {
      await page.goto('/builder/result?budget=100k-300k&usages=gaming')

      await expect(page.getByRole('heading', { name: '検索結果' })).toBeVisible()
      // 選択条件も表示される（パンくずリストやサブタイトルで確認）
      await expect(page.locator('text=ゲーム').first()).toBeVisible()
      await expect(page.locator('text=15〜30万円').first()).toBeVisible()
    })

    test('条件を変更するリンクが動作する', async ({ page }) => {
      await page.goto('/builder/result?budget=100k-300k&usages=gaming')

      // ローディング完了を待つ
      await page.waitForLoadState('networkidle')

      // 条件変更ボタンを見つけてクリック
      const changeButton = page.getByRole('link', { name: '条件を変更する' })
      await changeButton.first().click()

      // おまかせ構成ページに戻る
      await expect(page).toHaveURL('/builder')
    })
  })
})
