import Link from 'next/link'
import { Card } from './components/ui/Card'
import { Button } from './components/ui/Button'

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            RigLab
          </h1>
          <p className="text-xl md:text-2xl text-gray-600">
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              おまかせで選ぶ
            </h2>
            <p className="text-gray-600 mb-6">
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              自分で選ぶ
            </h2>
            <p className="text-gray-600 mb-6">
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
    </div>
  )
}
