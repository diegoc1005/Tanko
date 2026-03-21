import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@generated/prisma/client'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tanko'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  const pool = new pg.Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter } as any)
} else {
  if (!global.prisma) {
    const pool = new pg.Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    global.prisma = new PrismaClient({ adapter } as any)
  }
  prisma = global.prisma
}

export { prisma }
export default prisma
