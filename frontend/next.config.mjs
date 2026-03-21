import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load the single root .env before Next.js processes environment variables.
// process.loadEnvFile is available in Node 20+.
try {
  process.loadEnvFile(path.join(__dirname, '../.env'))
} catch {
  // Running standalone without monorepo root — variables must be set manually.
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Tells Next.js that the workspace root is the monorepo root,
  // silencing the multiple-lockfiles warning.
  outputFileTracingRoot: path.join(__dirname, '../'),
}

export default nextConfig
