"use client"

import { useState } from "react"
import { 
  Search, 
  Download,
  Filter,
  Fuel,
  MapPin,
  Calendar,
  User,
  Car,
  TrendingUp,
  ShieldCheck,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const ESCROW_PAYLOAD = {
  signer: "GAPPROVER1234567890",
  engagementId: "TANKO-DEMO-001",
  roles: {
    sender: "GASENDER1234567890",
    approver: "GAPPROVER1234567890",
    receiver: "GARECEIVER1234567890",
  },
  amount: "5000000",
  description: "Carga de 50L autorizada",
  trustline: {
    address: "CBIELTK6YBZJU5UP2WWQ",
    decimals: 10000000,
  },
}

const consumptions = [
  {
    id: 1,
    fecha: "2024-03-20T10:32:00",
    usuario: "Juan Pérez García",
    unidad: "Kenworth T680",
    placas: "ABC-123-D",
    ubicacion: "Gasolinera Central CDMX",
    direccion: "Av. Insurgentes Sur 1234, Col. Del Valle",
    coordenadas: "19.3910, -99.1787",
    tipoCombustible: "Diesel",
    litros: 180,
    precioLitro: 25.00,
    monto: 4500
  },
  {
    id: 2,
    fecha: "2024-03-20T09:15:00",
    usuario: "María García López",
    unidad: "Freightliner Cascadia",
    placas: "DEF-456-E",
    ubicacion: "Estación Reforma",
    direccion: "Paseo de la Reforma 567, Col. Juárez",
    coordenadas: "19.4284, -99.1558",
    tipoCombustible: "Diesel",
    litros: 128,
    precioLitro: 25.00,
    monto: 3200
  },
  {
    id: 3,
    fecha: "2024-03-19T18:45:00",
    usuario: "Carlos López Martínez",
    unidad: "Volvo VNL 860",
    placas: "GHI-789-F",
    ubicacion: "Gasolinera Norte",
    direccion: "Blvd. Manuel Ávila Camacho 890",
    coordenadas: "19.4876, -99.2234",
    tipoCombustible: "Diesel",
    litros: 204,
    precioLitro: 25.00,
    monto: 5100
  },
  {
    id: 4,
    fecha: "2024-03-19T15:20:00",
    usuario: "Ana Martínez Rodríguez",
    unidad: "International LT",
    placas: "JKL-012-G",
    ubicacion: "Estación Sur Express",
    direccion: "Calzada de Tlalpan 2345",
    coordenadas: "19.3012, -99.1456",
    tipoCombustible: "Diesel",
    litros: 112,
    precioLitro: 25.00,
    monto: 2800
  },
  {
    id: 5,
    fecha: "2024-03-19T11:00:00",
    usuario: "Roberto Sánchez Fernández",
    unidad: "Peterbilt 579",
    placas: "MNO-345-H",
    ubicacion: "Gasolinera Oriente",
    direccion: "Av. Zaragoza 678, Col. Balbuena",
    coordenadas: "19.4123, -99.0987",
    tipoCombustible: "Diesel",
    litros: 168,
    precioLitro: 25.00,
    monto: 4200
  },
  {
    id: 6,
    fecha: "2024-03-18T14:30:00",
    usuario: "Juan Pérez García",
    unidad: "Kenworth T680",
    placas: "ABC-123-D",
    ubicacion: "Gasolinera Querétaro Centro",
    direccion: "Av. Constituyentes 456, Centro",
    coordenadas: "20.5881, -100.3899",
    tipoCombustible: "Diesel",
    litros: 195,
    precioLitro: 24.50,
    monto: 4777.50
  },
  {
    id: 7,
    fecha: "2024-03-18T08:15:00",
    usuario: "María García López",
    unidad: "Freightliner Cascadia",
    placas: "DEF-456-E",
    ubicacion: "Estación Guadalajara Norte",
    direccion: "Periférico Norte 789",
    coordenadas: "20.7214, -103.3978",
    tipoCombustible: "Diesel",
    litros: 156,
    precioLitro: 24.80,
    monto: 3868.80
  },
  {
    id: 8,
    fecha: "2024-03-17T16:45:00",
    usuario: "Carlos López Martínez",
    unidad: "Volvo VNL 860",
    placas: "GHI-789-F",
    ubicacion: "Gasolinera Monterrey Sur",
    direccion: "Av. Garza Sada 234",
    coordenadas: "25.6504, -100.2893",
    tipoCombustible: "Diesel",
    litros: 220,
    precioLitro: 24.60,
    monto: 5412
  },
]

export default function ConsumosPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPeriod, setFilterPeriod] = useState("all")
  const [isCreatingEscrow, setIsCreatingEscrow] = useState(false)

  async function createEscrow() {
    setIsCreatingEscrow(true)
    try {
      const res = await fetch("http://127.0.0.1:3001/api/v1/escrow/single/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ESCROW_PAYLOAD),
      })
      const data = await res.json()
      const jsonBlock = (
        <pre className="mt-2 max-h-52 overflow-auto rounded-md bg-black/10 p-2 text-xs font-mono leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      )
      if (res.ok) {
        toast.success("Escrow creado exitosamente", {
          description: jsonBlock,
          duration: 12000,
        })
      } else {
        toast.error("El servidor devolvió un error", {
          description: jsonBlock,
          duration: 12000,
        })
      }
    } catch (err) {
      toast.error("Error de conexión con el backend", {
        description: String(err),
        duration: 8000,
      })
    } finally {
      setIsCreatingEscrow(false)
    }
  }

  const filteredConsumptions = consumptions.filter(c =>
    c.usuario.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.unidad.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.placas.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ubicacion.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalMonto = filteredConsumptions.reduce((acc, c) => acc + c.monto, 0)
  const totalLitros = filteredConsumptions.reduce((acc, c) => acc + c.litros, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Consumos</h1>
          <p className="text-muted-foreground">Historial de cargas de combustible</p>
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            onClick={createEscrow}
            disabled={isCreatingEscrow}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-70"
          >
            {isCreatingEscrow ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="mr-2 h-4 w-4" />
            )}
            {isCreatingEscrow ? "Creando escrow..." : "Crear Escrow (Trustless Work)"}
          </Button>

          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar Datos
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Consumido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                ${totalMonto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Litros Cargados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Fuel className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {totalLitros.toLocaleString()} L
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transacciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {filteredConsumptions.length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Registro de Consumos</CardTitle>
              <CardDescription>
                Detalle de todas las cargas de combustible realizadas
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredConsumptions.map((consumption) => (
              <div 
                key={consumption.id}
                className="rounded-xl border border-border bg-background p-5 transition-all hover:border-primary/30"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Fuel className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">
                          ${consumption.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {consumption.litros} L
                        </span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {consumption.tipoCombustible}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {consumption.usuario}
                        </span>
                        <span className="flex items-center gap-1">
                          <Car className="h-3.5 w-3.5" />
                          {consumption.unidad} ({consumption.placas})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start gap-2 lg:items-end">
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{consumption.ubicacion}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{consumption.direccion}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(consumption.fecha).toLocaleString("es-MX", {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                  <span>Precio/L: ${consumption.precioLitro.toFixed(2)}</span>
                  <span>Coordenadas: {consumption.coordenadas}</span>
                  <span>ID: #{consumption.id.toString().padStart(6, "0")}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
