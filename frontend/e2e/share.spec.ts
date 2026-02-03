import { test, expect } from '@playwright/test'

test.describe('構成共有フロー', () => {
  test.describe('共有ページ表示', () => {
    test('パラメータなしでアクセスするとエラーが表示される', async ({ page }) => {
      await page.goto('/share')

      // エラーメッセージが表示される
      await expect(page.getByText('共有URLが無効です')).toBeVisible()

      // トップに戻るボタンが表示される
      await expect(page.getByRole('link', { name: 'トップに戻る' })).toBeVisible()
    })

    test('トップに戻るボタンが動作する', async ({ page }) => {
      await page.goto('/share')

      // エラー状態でトップに戻るボタンをクリック
      await page.getByRole('link', { name: 'トップに戻る' }).click()

      // トップページに遷移
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('共有構成の表示', () => {
    test.skip('有効なパラメータで共有構成が表示される', async ({ page }) => {
      // このテストはシードデータの存在が前提
      // 例: /share?cpu=1&gpu=1&memory=1
      await page.goto('/share?cpu=1')
      await page.waitForLoadState('networkidle')

      // 共有構成タイトルが表示される
      await expect(page.getByRole('heading', { name: '共有構成' })).toBeVisible()

      // URLコピーボタンが表示される
      await expect(page.getByRole('button', { name: 'URLをコピー' })).toBeVisible()

      // カスタマイズボタンが表示される
      await expect(page.getByRole('link', { name: 'この構成をカスタマイズ' })).toBeVisible()
    })

    test.skip('カスタマイズボタンでカスタム構成ページに遷移する', async ({ page }) => {
      // このテストはシードデータの存在が前提
      await page.goto('/share?cpu=1')
      await page.waitForLoadState('networkidle')

      // カスタマイズボタンをクリック
      await page.getByRole('link', { name: 'この構成をカスタマイズ' }).click()

      // カスタム構成ページに遷移（パラメータ付き）
      await expect(page).toHaveURL(/\/configurator\?/)
      await expect(page.url()).toContain('cpu=1')
    })
  })
})
