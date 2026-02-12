import NextAuth, { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import * as jose from 'jose'

// サーバーサイド用（Docker内部通信）
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://localhost:3001/api/v1'
const AUTH_SECRET = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'development-secret-key-for-riglab'

class RateLimitedError extends CredentialsSignin {
  code = 'rate_limited'
}

class ServerError extends CredentialsSignin {
  code = 'server_error'
}

// Generate HS256 JWT for Rails backend compatibility
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
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
          console.error('[authorize] fetch failed:', error)
          throw new ServerError()
        }

        if (response.status === 429) {
          console.error('[authorize] rate limited by backend')
          throw new RateLimitedError()
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
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id
        token.role = (user as { role: string }).role
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as 'user' | 'admin'
        session.user.email = token.email as string
        session.user.name = token.name as string

        // Generate HS256 JWT for Rails backend API calls
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: AUTH_SECRET,
})
