import NextAuth, { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import * as jose from 'jose'
import type { Provider } from 'next-auth/providers'

// サーバーサイド用（Docker内部通信）
const INTERNAL_API_URL = (() => {
  const url = process.env.INTERNAL_API_URL
  if (!url && process.env.NODE_ENV === 'production') {
    throw new Error('INTERNAL_API_URL must be set in production')
  }
  return url || 'http://localhost:3001/api/v1'
})()
const AUTH_SECRET = (() => {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET or NEXTAUTH_SECRET must be set in production')
  }
  return secret || 'development-secret-key-for-riglab'
})()

class RateLimitedError extends CredentialsSignin {
  code = 'rate_limited'
}

class ServerError extends CredentialsSignin {
  code = 'server_error'
}

class EmailNotConfirmedError extends CredentialsSignin {
  code = 'email_not_confirmed'
}

class PasswordNotSetError extends CredentialsSignin {
  code = 'password_not_set'
}

// Rails バックエンド互換の HS256 JWT を生成
async function generateAccessToken(payload: {
  sub: string
  email: string
  name: string
  role: string
}): Promise<string> {
  const secret = new TextEncoder().encode(AUTH_SECRET)
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
  return jwt
}

// プロバイダーリストの構築（環境変数が設定されている場合のみ Google を含む）
const providers: Provider[] = [
  Credentials({
    name: 'credentials',
    credentials: {
      email: { label: 'メールアドレス', type: 'email' },
      password: { label: 'パスワード', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null
      }

      let response: Response
      try {
        response = await fetch(`${INTERNAL_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user: {
              email: credentials.email,
              password: credentials.password,
            },
          }),
        })
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[authorize] fetch failed:', error)
        }
        throw new ServerError()
      }

      if (response.status === 429) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[authorize] rate limited by backend')
        }
        throw new RateLimitedError()
      }

      if (response.status === 403) {
        const data = await response.json()
        if (data.error === 'email_not_confirmed') {
          throw new EmailNotConfirmedError()
        }
        if (data.error === 'password_not_set') {
          throw new PasswordNotSetError()
        }
      }

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      }
    },
  }),
]

// Google プロバイダー（設定されている場合のみ）
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  )
}

// サインインフロー中に OAuth データを一時保存
let oauthUserData: { id: string; role: string; email: string; name: string } | null = null

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        // Google でメール未確認の場合は拒否
        if (!profile?.email_verified) {
          return false
        }

        try {
          const response = await fetch(`${INTERNAL_API_URL}/auth/oauth`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Internal-Secret': AUTH_SECRET,
            },
            body: JSON.stringify({
              provider: 'google',
              uid: profile.sub,
              email: profile.email,
              name: profile.name,
              avatar_url: profile.picture,
              email_verified: true,
            }),
          })

          if (!response.ok) {
            return false
          }

          const data = await response.json()
          oauthUserData = {
            id: data.id,
            role: data.role,
            email: data.email,
            name: data.name,
          }
          return true
        } catch {
          return false
        }
      }

      return true
    },

    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && oauthUserData) {
        // Rails API レスポンスのデータを使用
        token.id = oauthUserData.id
        token.role = oauthUserData.role
        token.email = oauthUserData.email
        token.name = oauthUserData.name
        oauthUserData = null
      } else if (user) {
        // 認証情報によるサインイン
        token.id = user.id
        token.role = (user as { role: string }).role
        token.email = user.email
        token.name = user.name
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'user' | 'admin'
        session.user.email = token.email as string
        session.user.name = token.name as string

        // Rails バックエンド API 呼び出し用の HS256 JWT を生成
        session.accessToken = await generateAccessToken({
          sub: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as string,
        })
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 14 * 24 * 60 * 60, // 14日間
  },
  secret: AUTH_SECRET,
})
