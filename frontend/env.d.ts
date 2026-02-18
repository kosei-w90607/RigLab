declare namespace NodeJS {
  interface ProcessEnv {
    // API
    NEXT_PUBLIC_API_URL: string
    INTERNAL_API_URL?: string

    // NextAuth.js
    AUTH_SECRET?: string
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string

    // Node environment
    NODE_ENV: 'development' | 'production' | 'test'
  }
}
