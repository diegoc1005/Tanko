'use client'

import { SessionProvider } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

const WalletProvider = dynamic(
  () => import('@/providers/wallet-provider').then((m) => m.WalletProvider),
  { ssr: false }
)

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <WalletProvider>
        {children}
      </WalletProvider>
    </SessionProvider>
  )
}
