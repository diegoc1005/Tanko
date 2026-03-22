'use client'

import { WalletProvider } from '@/providers/wallet-provider'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  )
}
