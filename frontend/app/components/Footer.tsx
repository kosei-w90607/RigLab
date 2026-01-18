import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Copyright */}
          <div className="mb-4 md:mb-0">
            <span>&copy; {currentYear} RigLab</span>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            <Link
              href="/terms"
              className="hover:text-white transition-colors"
            >
              利用規約
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              プライバシー
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
