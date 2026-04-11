"use client"

import { useState, useEffect } from "react"
import {
  Fuel,
  Copy,
  CheckCheck,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  Droplets,
  TrendingUp,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { useAuth } from "@/providers/auth-provider"

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:3001"

interface DriverData {
  id: string
  name: string
  email: string
  stellarPubKey: string
  units: Array<{
    id: string
    plates: string
    make: string
    model: string
  }>
}

interface FundRequest {
  id: string
  liters: number
  amount: number
  description: string
  status: string
  contractId: string | null
  createdAt: string
}

interface DriverStats {
  escrowLimit: number
  escrowUsed: number
  escrowAvailable: number
  stellarBalance: number
  pendingApprovals: number
  totalSpend: number
  totalLiters: number
  recentRequests: Array<{
    id: string
    liters: number
    amount: number
    status: string
    createdAt: string
  }>
}

interface EscrowConfig {
  usdcAddress: string
  decimals: number
  platformFee: number
  dieselPrice: number
}

function truncate(addr: string) {
  return `${addr.slice(0, 8)}…${addr.slice(-8)}`
}

export default function DriverWalletPage() {
  const { address: walletAddress, isConnected } = useAuth()
  const [copied, setCopied] = useState(false)
  const [liters, setLiters] = useState("")
  const [isRequesting, setIsRequesting] = useState(false)
  const [driverData, setDriverData] = useState<DriverData | null>(null)
  const [driverStats, setDriverStats] = useState<DriverStats | null>(null)
  const [escrowConfig, setEscrowConfig] = useState<EscrowConfig | null>(null)
  const [loading, setLoading] = useState(true)

  const dieselPrice = escrowConfig?.dieselPrice || 25.0
  const calculatedAmount = liters ? (parseFloat(liters) * dieselPrice).toFixed(2) : ""
  
  const escrowLimit = driverStats?.escrowLimit ?? 5000.0
  const escrowUsed = driverStats?.escrowUsed ?? 0
  const escrowAvailable = driverStats?.escrowAvailable ?? 0
  const usedPct = escrowLimit > 0 ? ((escrowLimit - escrowAvailable) / escrowLimit) * 100 : 0

  useEffect(() => {
    async function fetchData() {
      if (!walletAddress) {
        setLoading(false)
        return
      }

      try {
        const [configRes, driverStatsRes, userRes] = await Promise.all([
          fetch(`${BACKEND}/api/v1/config/escrow`),
          fetch(`${BACKEND}/api/v1/driver/${walletAddress}/stats`),
          fetch(`${BACKEND}/api/v1/users/stellar/${walletAddress}`),
        ])

        if (configRes.ok) {
          const configData = await configRes.json()
          setEscrowConfig(configData.data)
        }

        if (driverStatsRes.ok) {
          const statsData = await driverStatsRes.json()
          if (statsData.success) {
            setDriverStats(statsData.data)
          }
        }

        if (userRes.ok) {
          const userData = await userRes.json()
          if (userData.success) {
            setDriverData(userData.data)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [walletAddress])

  function copyAddress() {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function requestFunds() {
    if (!liters || parseFloat(liters) <= 0) {
      toast.error("Ingresa un número válido de litros")
      return
    }

    if (walletAddress && parseFloat(calculatedAmount) > escrowAvailable) {
      toast.error("La cantidad excede el límite disponible del escrow")
      return
    }

    if (!isConnected || !walletAddress) {
      toast.error("Wallet no conectada", { description: "Conecta tu wallet Freighter primero." })
      return
    }

    setIsRequesting(true)
    try {
      const payload = {
        driverPubKey: walletAddress,
        managerPubKey: walletAddress,
        liters: parseFloat(liters),
        amount: parseFloat(calculatedAmount) * 10000000,
        description: `Solicitud de ${liters}L de diésel`,
      }

      const res = await fetch(`${BACKEND}/api/v1/funds/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        toast.success(
          `Solicitud enviada: ${liters}L · $${parseFloat(calculatedAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
          { duration: 8000 }
        )
        setDriverStats(prev => prev ? {
          ...prev,
          escrowUsed: prev.escrowUsed + parseFloat(calculatedAmount),
          escrowAvailable: prev.escrowAvailable - parseFloat(calculatedAmount),
        } : null)
        setLiters("")
      } else {
        toast.error("Error al enviar solicitud", { description: data.error || "Intenta de nuevo" })
      }
    } catch (err) {
      toast.error("Error de conexión", { description: String(err) })
    } finally {
      setIsRequesting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "RELEASED":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      case "APPROVED":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "REJECTED":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-amber-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "RELEASED":
        return "Completado"
      case "APPROVED":
        return "Aprobado"
      case "REJECTED":
        return "Rechazado"
      default:
        return "Pendiente"
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-900 p-6 text-white shadow-2xl shadow-indigo-500/40">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/5" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Fuel className="h-5 w-5 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-white/80">TANKO</span>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
            Testnet · Stellar
          </span>
        </div>

        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-widest text-white/50">Conductor</p>
          <p className="mt-0.5 text-xl font-bold">{driverData?.name || "Usuario"}</p>
          {driverData?.units && driverData.units.length > 0 && (
            <p className="text-sm text-white/60">
              {driverData.units[0].make} {driverData.units[0].model} · {driverData.units[0].plates}
            </p>
          )}
        </div>

        <button
          onClick={copyAddress}
          className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 font-mono text-xs text-white/70 backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
        >
          {walletAddress ? truncate(walletAddress) : "No conectado"}
          {copied
            ? <CheckCheck className="h-3.5 w-3.5 text-green-300" />
            : <Copy className="h-3.5 w-3.5" />}
        </button>

        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-widest text-white/50">Balance disponible</p>
          <p className="mt-1 text-4xl font-black tracking-tight">
            ${escrowAvailable.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            <span className="ml-2 text-base font-normal text-white/50">USD</span>
          </p>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Límite máximo de escrow</span>
            <span className="font-bold text-foreground">
              ${escrowLimit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <div className="mt-2.5 flex justify-between text-xs text-muted-foreground">
            <span>Usado: ${escrowUsed.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            <span>Disponible: <strong className="text-foreground">${escrowAvailable.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                <Droplets className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Litros máximos</p>
                <p className="text-sm font-bold text-foreground">
                  {dieselPrice > 0 ? (escrowAvailable / dieselPrice).toFixed(0) : 0} L
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Precio diésel</p>
                <p className="text-sm font-bold text-foreground">${dieselPrice.toFixed(2)}/L</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-violet-600" />
            Solicitar de Escrow
          </CardTitle>
          <CardDescription>Solicita fondos para tu próxima carga de combustible</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="liters" className="text-xs font-medium">Litros necesarios</Label>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="liters"
                  type="number"
                  placeholder="0"
                  min={1}
                  max={dieselPrice > 0 ? escrowAvailable / dieselPrice : 0}
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Monto calculado</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
                <Input
                  readOnly
                  value={calculatedAmount ? parseFloat(calculatedAmount).toLocaleString("en-US", { minimumFractionDigits: 2 }) : ""}
                  placeholder="0.00"
                  className="cursor-default pl-6 bg-muted/50 font-semibold"
                />
              </div>
            </div>
          </div>

          {liters && parseFloat(liters) > 0 && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs text-violet-800 dark:border-violet-800/40 dark:bg-violet-900/20 dark:text-violet-300">
              <strong>{liters}L</strong> Diésel · <strong>${parseFloat(calculatedAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> USD
              {parseFloat(calculatedAmount) > escrowAvailable && (
                <p className="mt-1 font-semibold text-red-600 dark:text-red-400">
                  ⚠ Excede el límite disponible (${escrowAvailable.toLocaleString("en-US", { minimumFractionDigits: 2 })})
                </p>
              )}
            </div>
          )}

          <Button
            onClick={requestFunds}
            disabled={isRequesting || !liters || parseFloat(liters) <= 0 || !isConnected || parseFloat(calculatedAmount) > escrowAvailable}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60"
          >
            {isRequesting
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <ArrowUpRight className="mr-2 h-4 w-4" />}
            {isRequesting ? "Enviando solicitud…" : isConnected ? "Solicitar fondos" : "Conecta wallet primero"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Historial de solicitudes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0">
          {driverStats?.recentRequests && driverStats.recentRequests.length > 0 ? driverStats.recentRequests.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  tx.status === "RELEASED" ? "bg-emerald-500/10"
                  : tx.status === "APPROVED" ? "bg-blue-500/10"
                  : tx.status === "REJECTED" ? "bg-red-500/10"
                  : "bg-amber-500/10"
                }`}>
                  {getStatusIcon(tx.status)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {tx.liters}L de diésel
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    ${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.liters}L</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  tx.status === "RELEASED" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : tx.status === "APPROVED" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : tx.status === "REJECTED" ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}>
                  {getStatusLabel(tx.status)}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          )) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tienes solicitudes aún
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
