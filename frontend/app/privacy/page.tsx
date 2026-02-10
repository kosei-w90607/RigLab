import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: 'RigLabのプライバシーポリシーです。個人情報の取り扱いについてご確認ください。',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">プライバシーポリシー</h1>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">最終更新日: 2026年2月7日</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">1. はじめに</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            RigLab（以下「本サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
            本プライバシーポリシーは、本サービスにおける個人情報の取り扱いについて定めるものです。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">2. 取得する情報</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            本サービスでは、以下の情報を取得することがあります。
          </p>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">2.1 ユーザーが提供する情報</h3>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>アカウント登録時のメールアドレス、ユーザー名</li>
            <li>ユーザーが作成したPC構成データ</li>
          </ul>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">2.2 自動的に取得される情報</h3>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>IPアドレス</li>
            <li>ブラウザの種類・バージョン</li>
            <li>アクセス日時</li>
            <li>参照元URL</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">3. 利用目的</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            取得した情報は、以下の目的で利用します。
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mt-2 space-y-1">
            <li>本サービスの提供・運営</li>
            <li>ユーザー認証およびアカウント管理</li>
            <li>サービスの改善・新機能の開発</li>
            <li>不正利用の防止</li>
            <li>お問い合わせへの対応</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">4. 第三者提供</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            運営者は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mt-2 space-y-1">
            <li>ユーザーの同意がある場合</li>
            <li>法令に基づく場合</li>
            <li>人の生命・身体・財産の保護に必要な場合</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">5. Cookieの使用</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            本サービスでは、ユーザー認証（セッション管理）のためにCookieを使用しています。
            Cookieは、ユーザーのブラウザに保存される小さなデータファイルです。
            ブラウザの設定によりCookieを無効にすることができますが、
            その場合、本サービスの一部機能が利用できなくなることがあります。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">6. エラートラッキング</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            本サービスでは、サービス品質の向上を目的として、エラートラッキングサービス（Sentry）を使用することがあります。
            エラー発生時に技術的な情報（エラー内容、ブラウザ情報等）が送信される場合がありますが、
            個人を特定する情報は含まれません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">7. データの保護</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            運営者は、個人情報の漏洩・紛失・改ざんを防止するため、適切なセキュリティ対策を講じます。
            通信はHTTPSにより暗号化され、パスワードはハッシュ化して保存されます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">8. ユーザーの権利</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            ユーザーは、自身の個人情報について以下の権利を有します。
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mt-2 space-y-1">
            <li>個人情報の開示請求</li>
            <li>個人情報の訂正・削除請求</li>
            <li>アカウントの削除</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
            これらのご要望は、お問い合わせフォームよりご連絡ください。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">9. ポリシーの変更</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            運営者は、必要に応じて本プライバシーポリシーを変更することがあります。
            変更後のポリシーは、本サービス上に掲載した時点で効力を生じるものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">10. お問い合わせ</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            個人情報の取り扱いに関するお問い合わせは、本サービスのお問い合わせフォームよりご連絡ください。
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
          トップページに戻る
        </Link>
      </div>
    </div>
  )
}
