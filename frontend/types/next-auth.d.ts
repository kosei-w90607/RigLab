import 'next-auth'
import type { User as AppUser } from '@/types'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: AppUser['role']
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: AppUser['role']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    name: string
    email: string
    role: AppUser['role']
  }
}
