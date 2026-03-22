"use client"

import { useState } from "react"
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

const CONDUCTOR = {
  nombre: "Juan Pérez García",
  placas: "ABC-123-D",
  unidad: "Kenworth T680",
  address: "GASENDER7K3XPWQHBN4MJFV2DLC5RTYE6A8",
  saldo: 2450.0,
  limiteMax: 5000.0,
  escrowDisponible: 3200.0,
  precioDiesel: 25.0,
}

const HISTORIAL = [
  {
    id: "ESC-0012",
    fecha: "2024-03-20",
    litros: 180,
    monto: 4500,
    estado: "completada",
    ubicacion: "Gasolinera Central CDMX",
  },
  {
    id: "ESC-0011",
    fecha: "2024-03-18",
    litros: 120,
    monto: 3000,
    estado: "completada",
    ubicacion: "Estación Reforma",
  },
  {
    id: "ESC-0010",
    fecha: "2024-03-15",
    litros: 90,
    monto: 2250,
    estado: "pendiente",
    ubicacion: "Gasolinera Norte",
  },
]

function truncateAddress(addr: string) {
  return `${addr.slice(0, 8)}...${addr.slice(-8)}`
}

export default function ConductorWalletPage() {
  const [copied, setCopied] = useState(false)
  const [litros, setLitros] = useState("")
  const [isRequesting, setIsRequesting] = useState(false)

  const montoCalculado = litros
    ? (parseFloat(litros) * CONDUCTOR.precioDiesel).toFixed(2)
    : ""

  const porcentajeUsado =
    ((CONDUCTOR.limiteMax - CONDUCTOR.escrowDisponible) / CONDUCTOR.limiteMax) * 100

  function copyAddress() {
    navigator.clipboard.writeText(CONDUCTOR.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function solicitarEscrow() {
    if (!litros || parseFloat(litros) <= 0) {
      toast.error("Ingresa una cantidad de litros válida")
      return
    }
    const monto = parseFloat(montoCalculado)
    if (monto > CONDUCTOR.escrowDisponible) {
      toast.error("El monto supera el límite disponible en escrow")
      return
    }

    setIsRequesting(true)
    try {
      const payload = {
        signer: CONDUCTOR.address,
        engagementId: `TANKO-${Date.now()}`,
        roles: {
          sender: CONDUCTOR.address,
          approver: "GAPPROVER1234567890ABCDEFGHIJ",
          receiver: CONDUCTOR.address,
        },
        amount: String(Math.round(monto * 10000000)),
        description: `Carga de ${litros}L de Diesel - ${CONDUCTOR.unidad}`,
        trustline: {
          address: "CBIELTK6YBZJU5UP2WWQ",
          decimals: 10000000,
        },
      }

      const res = await fetch("http://127.0.0.1:3001/api/v1/escrow/single/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok) {
        toast.success(`Solicitud enviada: ${litros}L · $${parseFloat(montoCalculado).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`, {
          description: (
            <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-black/10 p-2 text-xs font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
          ),
          duration: 12000,
        })
        setLitros("")
      } else {
        toast.error("El backend rechazó la solicitud", {
          description: (
            <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-black/10 p-2 text-xs font-mono">
              {JSON.stringify(data, null, 2)}
            </pre>
          ),
          duration: 10000,
        })
      }
    } catch (err) {
      toast.error("Error de conexión con el backend", { description: String(err) })
    } finally {
      setIsRequesting(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-10">

      {/* ── WALLET CARD ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-900 p-6 text-white shadow-2xl shadow-indigo-500/40">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/5" />

        {/* top row */}
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

        {/* conductor info */}
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-widest text-white/50">Conductor</p>
          <p className="mt-0.5 text-xl font-bold">{CONDUCTOR.nombre}</p>
          <p className="text-sm text-white/60">{CONDUCTOR.unidad} · {CONDUCTOR.placas}</p>
        </div>

        {/* address */}
        <button
          onClick={copyAddress}
          className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 font-mono text-xs text-white/70 backdrop-blur-sm transition hover:bg-white/20 active:scale-95"
        >
          {truncateAddress(CONDUCTOR.address)}
          {copied
            ? <CheckCheck className="h-3.5 w-3.5 text-green-300" />
            : <Copy className="h-3.5 w-3.5" />}
        </button>

        {/* balance */}
        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-widest text-white/50">Saldo disponible</p>
          <p className="mt-1 text-4xl font-black tracking-tight">
            ${CONDUCTOR.saldo.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            <span className="ml-2 text-base font-normal text-white/50">MXN</span>
          </p>
        </div>
      </div>

      {/* ── LÍMITE / BARRA ── */}
      <Card className="border-border">
        <CardContent className="pt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Límite máximo de escrow</span>
            <span className="font-bold text-foreground">
              ${CONDUCTOR.limiteMax.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* barra */}
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
              style={{ width: `${porcentajeUsado}%` }}
            />
          </div>

          <div className="mt-2.5 flex justify-between text-xs text-muted-foreground">
            <span>Utilizado: ${(CONDUCTOR.limiteMax - CONDUCTOR.escrowDisponible).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
            <span>Disponible: <strong className="text-foreground">${CONDUCTOR.escrowDisponible.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</strong></span>
          </div>

          {/* stats row */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                <Droplets className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Litros máx.</p>
                <p className="text-sm font-bold text-foreground">
                  {(CONDUCTOR.escrowDisponible / CONDUCTOR.precioDiesel).toFixed(0)} L
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Precio diesel</p>
                <p className="text-sm font-bold text-foreground">${CONDUCTOR.precioDiesel}/L</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── SOLICITAR FONDOS ── */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-violet-600" />
            Solicitar al Escrow
          </CardTitle>
          <CardDescription>Solicita fondos para tu próxima carga de combustible</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="litros" className="text-xs font-medium">Litros a cargar</Label>
              <div className="relative">
                <Droplets className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="litros"
                  type="number"
                  placeholder="0"
                  min={1}
                  max={CONDUCTOR.escrowDisponible / CONDUCTOR.precioDiesel}
                  value={litros}
                  onChange={(e) => setLitros(e.target.value)}
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
                  value={montoCalculado ? parseFloat(montoCalculado).toLocaleString("es-MX", { minimumFractionDigits: 2 }) : ""}
                  placeholder="0.00"
                  className="cursor-default pl-6 bg-muted/50 font-semibold"
                />
              </div>
            </div>
          </div>

          {litros && parseFloat(litros) > 0 && (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-xs text-violet-800 dark:border-violet-800/40 dark:bg-violet-900/20 dark:text-violet-300">
              <strong>{litros}L</strong> de Diesel · <strong>${parseFloat(montoCalculado).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</strong> MXN
              {parseFloat(montoCalculado) > CONDUCTOR.escrowDisponible && (
                <p className="mt-1 font-semibold text-red-600 dark:text-red-400">
                  ⚠ Supera el límite disponible (${CONDUCTOR.escrowDisponible.toLocaleString("es-MX")})
                </p>
              )}
            </div>
          )}

          <Button
            onClick={solicitarEscrow}
            disabled={isRequesting || !litros || parseFloat(litros) <= 0}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60"
          >
            {isRequesting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowUpRight className="mr-2 h-4 w-4" />
            )}
            {isRequesting ? "Enviando solicitud..." : "Solicitar fondos"}
          </Button>
        </CardContent>
      </Card>

      {/* ── HISTORIAL ── */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Historial de solicitudes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0">
          {HISTORIAL.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  tx.estado === "completada"
                    ? "bg-emerald-500/10"
                    : tx.estado === "pendiente"
                    ? "bg-amber-500/10"
                    : "bg-red-500/10"
                }`}>
                  {tx.estado === "completada" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : tx.estado === "pendiente" ? (
                    <Clock className="h-5 w-5 text-amber-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{tx.id}</p>
                  <p className="text-xs text-muted-foreground">{tx.ubicacion}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">
                    ${tx.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">{tx.litros}L · {tx.fecha}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  tx.estado === "completada"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}>
                  {tx.estado === "completada" ? "Completada" : "Pendiente"}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
