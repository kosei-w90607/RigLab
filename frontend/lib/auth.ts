import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import * as jose from 'jose'
import type { User } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'development-secret-key-for-riglab'

// Generate HS256 JWT for Rails backend compatibility
async function generateAccessToken(payload: {
  sub: string
  email: string
  name: string
  role: string
}): Promise<string> {
  const secret = new TextEncoder().encode(NEXTAUTH_SECRET)
  const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
  return jwt
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'メールアドレス', type: 'email' },
        password: { label: 'パスワード', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user: {
                email: credentials.email,
                password: credentials.password,
              },
            }),
          })

          if (!response.ok) {
            return null
          }

          const data = await response.json()

          // Return user object that will be available in JWT callback
          return {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in - add user data to token
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as User['role']
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
  // JWT is signed with NEXTAUTH_SECRET env var
  // The same secret must be set in Rails backend for verification
}
