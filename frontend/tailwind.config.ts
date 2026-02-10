import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['variant', '&:is([data-theme="dark"] *):not([data-theme="light"] *)'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#38D1EC',
      },
      backgroundPosition: {
        'center-80': 'center 80%',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark'],
    base: false,
    styled: true,
  },
}

export default config
