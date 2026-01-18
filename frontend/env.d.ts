declare namespace NodeJS {
  interface ProcessEnv {
    // API
    NEXT_PUBLIC_API_URL: string

    // NextAuth.js
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string

    // Node environment
    NODE_ENV: 'development' | 'production' | 'test'
  }
}
