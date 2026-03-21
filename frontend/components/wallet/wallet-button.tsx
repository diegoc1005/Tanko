'use client'

import { useState } from 'react'
import { useWallet } from '@/providers/wallet-provider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Wallet, AlertCircle } from 'lucide-react'

interface WalletButtonProps {
  className?: string
}

export function WalletButton({ className }: WalletButtonProps) {
  const { isConnected, isConnecting, address, connect, disconnect, error } = useWallet()
  const [showModal, setShowModal] = useState(false)

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-sm font-medium">Wallet Conectada</p>
          <p className="text-xs text-muted-foreground font-mono">
            {address.slice(0, 8)}...{address.slice(-8)}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={disconnect}>
          Desconectar
        </Button>
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={connect}
        disabled={isConnecting}
        className={className}
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            <Wallet className="mr-2 h-4 w-4" />
            Conectar Wallet
          </>
        )}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar Wallet</DialogTitle>
            <DialogDescription>
              Selecciona tu wallet para conectarte a Tanko
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Button
              onClick={() => {
                connect()
                setShowModal(false)
              }}
              className="w-full"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Freighter Wallet
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default WalletButton
