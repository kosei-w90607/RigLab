import { test, expect } from '@playwright/test'

test.describe('カスタム構成フロー', () => {
  test.describe('カスタム構成ページ表示', () => {
    test('ページが正しく表示される', async ({ page }) => {
      await page.goto('/configurator')

      // タイトル確認
      await expect(page.getByRole('heading', { name: 'カスタム構成' })).toBeVisible()

      // ローディング終了を待つ
      await page.waitForLoadState('networkidle')

      // パーツ選択エリアが表示される
      // CPUセクションがあることを確認
      await expect(page.getByText('CPU')).toBeVisible()
    })

    test('合計金額が表示される', async ({ page }) => {
      await page.goto('/configurator')

      await page.waitForLoadState('networkidle')

      // 合計金額セクションが表示される
      await expect(page.getByText('合計金額')).toBeVisible()
      // 初期状態は¥0
      await expect(page.getByText('¥0')).toBeVisible()
    })

    test('ログインしていない状態で保存ボタンが表示される', async ({ page }) => {
      await page.goto('/configurator')

      await page.waitForLoadState('networkidle')

      // 保存ボタンが表示される
      const saveButton = page.getByRole('button', { name: '保存' })
      await expect(saveButton).toBeVisible()
    })

    test('共有ボタンが表示される', async ({ page }) => {
      await page.goto('/configurator')

      await page.waitForLoadState('networkidle')

      // 共有ボタンが表示される
      const shareButton = page.getByRole('button', { name: '共有' })
      await expect(shareButton).toBeVisible()
    })
  })

  test.describe('パーツ選択', () => {
    test.skip('CPUを選択すると互換性のあるメモリがフィルタリングされる', async ({ page }) => {
      // このテストはAPIのモックが必要なためスキップ
      // 実際のE2Eテストではシードデータを使用する
      await page.goto('/configurator')
      await page.waitForLoadState('networkidle')

      // CPUセレクトを見つけて選択
      // ※ 実際のセレクト要素のラベルに依存
    })

    test.skip('GPUを選択すると互換性のあるケースがフィルタリングされる', async ({ page }) => {
      // このテストはAPIのモックが必要なためスキップ
      await page.goto('/configurator')
      await page.waitForLoadState('networkidle')
    })
  })

  test.describe('構成保存フロー', () => {
    test('保存ボタンをクリックするとモーダルが表示される', async ({ page }) => {
      await page.goto('/configurator')
      await page.waitForLoadState('networkidle')

      // 保存ボタンをクリック
      const saveButton = page.getByRole('button', { name: '保存' })
      await saveButton.click()

      // 保存モーダルが表示される（構成名入力フィールドがある）
      await expect(page.getByPlaceholder('マイゲーミングPC')).toBeVisible()
      // キャンセルボタンが表示される
      await expect(page.getByRole('button', { name: 'キャンセル' })).toBeVisible()
    })
  })

  test.describe('URLパラメータによる初期化', () => {
    test.skip('URLパラメータでパーツIDを指定すると初期選択される', async ({ page }) => {
      // このテストはシードデータの存在が前提
      // 例: ?cpu=1&gpu=1
      await page.goto('/configurator?cpu=1')
      await page.waitForLoadState('networkidle')

      // CPUが選択されていることを確認
      // 実際の表示に依存
    })
  })
})
