import 'next-auth'
import type { User } from '@/types'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: User['role']
    }
    accessToken: string
    client: string
    uid: string
  }

  interface User {
    id: string
    name: string
    email: string
    role: User['role']
    accessToken: string
    client: string
    uid: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: User['role']
    accessToken: string
    client: string
    uid: string
  }
}
