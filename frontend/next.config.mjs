import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

try {
  process.loadEnvFile(path.join(__dirname, '../.env'))
} catch {
  // Running standalone — set variables manually.
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: path.join(__dirname, '../'),
}

export default nextConfig
