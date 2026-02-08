import Link from 'next/link'
import { Card } from './components/ui/Card'
import { Button } from './components/ui/Button'
import { BuyNowSection } from './components/home/BuyNowSection'
import { PriceTrendsSection } from './components/home/PriceTrendsSection'
import { RankingSection } from './components/home/RankingSection'

export default function Home() {
  return (
    <div className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            RigLab
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400">
            あなただけのPC構成を見つけよう
          </p>
        </div>

        {/* Feature Cards */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
          {/* Builder Card */}
          <Card
            padding="lg"
            shadow="md"
            hoverable
            className="flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 mb-4 rounded-full bg-custom-blue bg-opacity-10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-custom-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              おまかせで選ぶ
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              予算・用途から
              <br />
              最適構成を提案
            </p>
            <Link href="/builder" className="w-full">
              <Button variant="primary" size="lg" className="w-full">
                Builder
              </Button>
            </Link>
          </Card>

          {/* Configurator Card */}
          <Card
            padding="lg"
            shadow="md"
            hoverable
            className="flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 mb-4 rounded-full bg-custom-blue bg-opacity-10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-custom-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              自分で選ぶ
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              パーツを自由に
              <br />
              カスタマイズ
            </p>
            <Link href="/configurator" className="w-full">
              <Button variant="primary" size="lg" className="w-full">
                Configurator
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* About Section */}
      <section className="w-full max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            RigLabとは
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            RigLabは、はじめてのPC構成づくりをサポートするツールです。ここで作った構成を元にPCショップで相談したり、自分なりにパーツを調べるきっかけとしてご活用ください。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: 構成をサクッと作る */}
          <Card padding="lg" shadow="sm" className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-custom-blue bg-opacity-10 flex items-center justify-center">
              <svg className="w-6 h-6 text-custom-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">構成をサクッと作る</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              予算と用途から最適な構成を提案。自分でパーツを選んでカスタマイズも可能。
            </p>
          </Card>

          {/* Card 2: 価格をチェック */}
          <Card padding="lg" shadow="sm" className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-custom-blue bg-opacity-10 flex items-center justify-center">
              <svg className="w-6 h-6 text-custom-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">価格をチェック</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              PCパーツの価格推移を追跡。買い時がひと目でわかります。
            </p>
          </Card>

          {/* Card 3: たたき台として活用 */}
          <Card padding="lg" shadow="sm" className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-custom-blue bg-opacity-10 flex items-center justify-center">
              <svg className="w-6 h-6 text-custom-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">たたき台として活用</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              作った構成はショップへの相談用に共有OK。まずはここから、自作PCの第一歩を。
            </p>
          </Card>
        </div>

        <p className="text-xs text-gray-400 text-center">
          ※ RigLabは構成検討の参考ツールです。最終的なパーツ選びは専門店への相談や、ご自身での確認をおすすめします。
        </p>
      </section>

      {/* Dynamic Sections - graceful degradation when no data */}
      <div className="flex flex-col items-center">
        <BuyNowSection />
        <PriceTrendsSection />
        <RankingSection />
      </div>
    </div>
  )
}
