import 'dotenv/config';
import { defineConfig } from 'prisma/config';
import path from 'path';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  migrate: {
    adapter: async () => {
      const { PrismaPostgres } = await import('@prisma/adapter-pg');
      const { Pool } = await import('pg');
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
      return new PrismaPostgres(pool);
    },
  },
});
