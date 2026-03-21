import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@generated/prisma/client'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tanko'
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'ADMIN' | 'CONDUCTOR'
      stellarAddress?: string | null
      empresaId?: string | null
      conductorId?: string | null
    }
  }

  interface User {
    id: string
    email: string
    nombre: string
    rol: 'ADMIN' | 'CONDUCTOR'
    stellarAddress?: string | null
    empresaId?: string | null
    conductorId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'ADMIN' | 'CONDUCTOR'
    stellarAddress?: string | null
    empresaId?: string | null
    conductorId?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        stellarAddress: { label: 'Wallet Address', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error('Email requerido')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { conductor: true },
        })

        if (!user) {
          throw new Error('Usuario no encontrado')
        }

        if (credentials.password && user.password) {
          if (credentials.password !== user.password) {
            throw new Error('Contraseña incorrecta')
          }
        }

        if (credentials.stellarAddress && user.stellarAddress) {
          if (credentials.stellarAddress !== user.stellarAddress) {
            throw new Error('Wallet no coincide')
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nombre,
          role: user.rol,
          stellarAddress: user.stellarAddress || undefined,
          empresaId: user.empresaId || undefined,
          conductorId: user.conductor?.id || undefined,
        }
      },
    }),
    CredentialsProvider({
      id: 'wallet',
      name: 'Wallet',
      credentials: {
        stellarAddress: { label: 'Wallet Address', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.stellarAddress) {
          throw new Error('Wallet address requerida')
        }

        const user = await prisma.user.findFirst({
          where: { stellarAddress: credentials.stellarAddress },
          include: { conductor: true },
        })

        if (!user) {
          throw new Error('No hay usuario asociado a esta wallet')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.nombre,
          role: user.rol,
          stellarAddress: user.stellarAddress || undefined,
          empresaId: user.empresaId || undefined,
          conductorId: user.conductor?.id || undefined,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.stellarAddress = user.stellarAddress
        token.empresaId = user.empresaId
        token.conductorId = user.conductorId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.stellarAddress = token.stellarAddress
        session.user.empresaId = token.empresaId
        session.user.conductorId = token.conductorId
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default authOptions
