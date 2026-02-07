import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '利用規約',
  description: 'RigLabの利用規約です。サービスをご利用いただく前に必ずお読みください。',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>

      <p className="text-sm text-gray-500 mb-8">最終更新日: 2026年2月7日</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">第1条（適用）</h2>
          <p className="text-gray-700 leading-relaxed">
            本利用規約（以下「本規約」）は、RigLab（以下「本サービス」）の利用条件を定めるものです。
            ユーザーの皆様には、本規約に同意いただいた上で本サービスをご利用いただきます。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">第2条（サービス内容）</h2>
          <p className="text-gray-700 leading-relaxed">
            本サービスは、PC自作における構成の提案・シミュレーションを目的としたWebアプリケーションです。
            主な機能は以下の通りです。
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
            <li>予算・用途に基づくPC構成の提案（おまかせ構成）</li>
            <li>パーツを自由に選択してPC構成を作成（カスタム構成）</li>
            <li>構成の保存・共有</li>
            <li>パーツ互換性チェック</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">第3条（アカウント）</h2>
          <p className="text-gray-700 leading-relaxed">
            本サービスの一部機能を利用するためにはアカウント登録が必要です。
            ユーザーは正確な情報を登録し、自己の責任においてアカウントを管理するものとします。
            アカウント情報の不正利用により生じた損害について、運営者は一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">第4条（禁止事項）</h2>
          <p className="text-gray-700 leading-relaxed">
            ユーザーは、本サービスの利用にあたり以下の行為を行ってはなりません。
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
            <li>法令または公序良俗に違反する行為</li>
            <li>本サービスの運営を妨害する行為</li>
            <li>他のユーザーの情報を不正に取得する行為</li>
            <li>本サービスのシステムに対する不正アクセス</li>
            <li>APIへの過度なリクエスト送信（スクレイピング等）</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">第5条（免責事項）</h2>
          <p className="text-gray-700 leading-relaxed">
            本サービスが提供するPC構成の提案は参考情報であり、パーツの互換性・動作・価格の正確性を保証するものではありません。
            実際のPC組み立て・購入はユーザー自身の判断と責任において行ってください。
            本サービスの利用により生じたいかなる損害についても、運営者は一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">第6条（知的財産権）</h2>
          <p className="text-gray-700 leading-relaxed">
            本サービスに関する知的財産権は運営者に帰属します。
            ユーザーが作成した構成データについては、ユーザー自身が自由に利用できますが、
            本サービスのシステム・デザイン・コンテンツを無断で複製・転用することは禁止します。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">第7条（サービスの変更・停止）</h2>
          <p className="text-gray-700 leading-relaxed">
            運営者は、事前の通知なく本サービスの内容を変更、または提供を停止することがあります。
            これによりユーザーに生じた損害について、運営者は一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">第8条（規約の変更）</h2>
          <p className="text-gray-700 leading-relaxed">
            運営者は、必要に応じて本規約を変更することがあります。
            変更後の利用規約は、本サービス上に掲載した時点で効力を生じるものとします。
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">第9条（準拠法・管轄）</h2>
          <p className="text-gray-700 leading-relaxed">
            本規約の解釈には日本法を準拠法とします。
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
          トップページに戻る
        </Link>
      </div>
    </div>
  )
}
