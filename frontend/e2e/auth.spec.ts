import { test, expect } from '@playwright/test'

// Generate unique email for each test run to avoid conflicts
const generateTestEmail = () => `test-${Date.now()}@example.com`

test.describe('認証機能', () => {
  test.describe('サインアップ', () => {
    test('フォームが正しく表示される', async ({ page }) => {
      await page.goto('/signup')

      // ページタイトル確認
      await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible()

      // フォームフィールド確認
      await expect(page.getByLabel('ユーザー名')).toBeVisible()
      await expect(page.getByLabel('メールアドレス')).toBeVisible()
      await expect(page.getByLabel('パスワード', { exact: true })).toBeVisible()
      await expect(page.getByLabel('パスワード（確認）')).toBeVisible()

      // 送信ボタン確認
      await expect(page.getByRole('button', { name: '登録する' })).toBeVisible()

      // ログインリンク確認
      await expect(page.getByRole('link', { name: 'ログイン' })).toBeVisible()
    })

    test('空のフィールドでバリデーションエラーが表示される', async ({ page }) => {
      await page.goto('/signup')

      // 空のまま送信
      await page.getByRole('button', { name: '登録する' }).click()

      // バリデーションエラー確認
      await expect(page.getByText('ユーザー名を入力してください')).toBeVisible()
      await expect(page.getByText('メールアドレスを入力してください')).toBeVisible()
      await expect(page.getByText('パスワードを入力してください')).toBeVisible()
    })

    test('無効なメールアドレスでエラーが表示される', async ({ page }) => {
      await page.goto('/signup')

      await page.getByLabel('ユーザー名').fill('TestUser')
      // ブラウザバリデーションを通過するが、JSバリデーションで弾かれる形式
      await page.getByLabel('メールアドレス').fill('invalid@nodomain')
      await page.getByLabel('パスワード', { exact: true }).fill('password123')
      await page.getByLabel('パスワード（確認）').fill('password123')

      await page.getByRole('button', { name: '登録する' }).click()

      await expect(page.getByText('メールアドレスの形式が正しくありません')).toBeVisible()
    })

    test('8文字未満のパスワードでエラーが表示される', async ({ page }) => {
      await page.goto('/signup')

      await page.getByLabel('ユーザー名').fill('TestUser')
      await page.getByLabel('メールアドレス').fill('test@example.com')
      await page.getByLabel('パスワード', { exact: true }).fill('pass1')
      await page.getByLabel('パスワード（確認）').fill('pass1')

      await page.getByRole('button', { name: '登録する' }).click()

      await expect(page.getByText('8文字以上で入力してください')).toBeVisible()
    })

    test('数字を含まないパスワードでエラーが表示される', async ({ page }) => {
      await page.goto('/signup')

      await page.getByLabel('ユーザー名').fill('TestUser')
      await page.getByLabel('メールアドレス').fill('test@example.com')
      await page.getByLabel('パスワード', { exact: true }).fill('passwordonly')
      await page.getByLabel('パスワード（確認）').fill('passwordonly')

      await page.getByRole('button', { name: '登録する' }).click()

      await expect(page.getByText('英字と数字を両方含めてください')).toBeVisible()
    })

    test('パスワード不一致でエラーが表示される', async ({ page }) => {
      await page.goto('/signup')

      await page.getByLabel('ユーザー名').fill('TestUser')
      await page.getByLabel('メールアドレス').fill('test@example.com')
      await page.getByLabel('パスワード', { exact: true }).fill('password123')
      await page.getByLabel('パスワード（確認）').fill('different123')

      await page.getByRole('button', { name: '登録する' }).click()

      await expect(page.getByText('パスワードが一致しません')).toBeVisible()
    })

    // バックエンドAPI連携が必要なテスト
    test.skip('登録成功後にホームへリダイレクトされる', async ({ page }) => {
      const testEmail = generateTestEmail()

      await page.goto('/signup')

      await page.getByLabel('ユーザー名').fill('TestUser')
      await page.getByLabel('メールアドレス').fill(testEmail)
      await page.getByLabel('パスワード', { exact: true }).fill('password123')
      await page.getByLabel('パスワード（確認）').fill('password123')

      await page.getByRole('button', { name: '登録する' }).click()

      await expect(page).toHaveURL('/', { timeout: 10000 })
    })
  })

  test.describe('サインイン', () => {
    test('フォームが正しく表示される', async ({ page }) => {
      await page.goto('/signin')

      // ページタイトル確認
      await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()

      // フォームフィールド確認
      await expect(page.getByLabel('メールアドレス')).toBeVisible()
      await expect(page.getByLabel('パスワード')).toBeVisible()

      // 送信ボタン確認
      await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible()

      // 新規登録リンク確認
      await expect(page.getByRole('link', { name: '新規登録' })).toBeVisible()
    })

    // バックエンドAPI連携が必要なテスト
    test.skip('無効な認証情報でエラーが表示される', async ({ page }) => {
      await page.goto('/signin')

      await page.getByLabel('メールアドレス').fill('nonexistent@example.com')
      await page.getByLabel('パスワード').fill('wrongpassword')

      await page.getByRole('button', { name: 'ログイン' }).click()

      await expect(page.getByText('メールアドレスまたはパスワードが正しくありません')).toBeVisible()
    })

    test('新規登録ページへ遷移できる', async ({ page }) => {
      await page.goto('/signin')

      await page.getByRole('link', { name: '新規登録' }).click()

      await expect(page).toHaveURL('/signup')
    })
  })

  test.describe('ページ間遷移', () => {
    test('サインアップからサインインへ遷移できる', async ({ page }) => {
      await page.goto('/signup')

      await page.getByRole('link', { name: 'ログイン' }).click()

      await expect(page).toHaveURL('/signin')
    })

    test('サインインからサインアップへ遷移できる', async ({ page }) => {
      await page.goto('/signin')

      await page.getByRole('link', { name: '新規登録' }).click()

      await expect(page).toHaveURL('/signup')
    })
  })
})
