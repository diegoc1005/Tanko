"use client"

import { 
  Fuel, 
  Users, 
  Car, 
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"

const stats = [
  {
    title: "Total Consumido",
    value: "$1,234,567",
    change: "+12.5%",
    trend: "up",
    icon: Fuel,
    description: "Este mes"
  },
  {
    title: "Usuarios Activos",
    value: "248",
    change: "+8",
    trend: "up",
    icon: Users,
    description: "Nuevos este mes"
  },
  {
    title: "Unidades Registradas",
    value: "312",
    change: "+15",
    trend: "up",
    icon: Car,
    description: "Total activas"
  },
  {
    title: "Litros Cargados",
    value: "45,678",
    change: "-2.3%",
    trend: "down",
    icon: TrendingUp,
    description: "Este mes"
  },
]

const consumptionData = [
  { mes: "Ene", consumo: 85000, litros: 3200 },
  { mes: "Feb", consumo: 92000, litros: 3450 },
  { mes: "Mar", consumo: 78000, litros: 2980 },
  { mes: "Abr", consumo: 105000, litros: 4100 },
  { mes: "May", consumo: 112000, litros: 4350 },
  { mes: "Jun", consumo: 98000, litros: 3800 },
]

const recentTransactions = [
  {
    id: 1,
    usuario: "Juan Pérez",
    unidad: "Kenworth T680",
    placas: "ABC-123-D",
    ubicacion: "Gasolinera Central CDMX",
    monto: 4500,
    litros: 180,
    fecha: "Hoy, 10:32 AM"
  },
  {
    id: 2,
    usuario: "María García",
    unidad: "Freightliner Cascadia",
    placas: "DEF-456-E",
    ubicacion: "Estación Reforma",
    monto: 3200,
    litros: 128,
    fecha: "Hoy, 09:15 AM"
  },
  {
    id: 3,
    usuario: "Carlos López",
    unidad: "Volvo VNL",
    placas: "GHI-789-F",
    ubicacion: "Gasolinera Norte",
    monto: 5100,
    litros: 204,
    fecha: "Ayer, 06:45 PM"
  },
  {
    id: 4,
    usuario: "Ana Martínez",
    unidad: "International LT",
    placas: "JKL-012-G",
    ubicacion: "Estación Sur Express",
    monto: 2800,
    litros: 112,
    fecha: "Ayer, 03:20 PM"
  },
  {
    id: 5,
    usuario: "Roberto Sánchez",
    unidad: "Peterbilt 579",
    placas: "MNO-345-H",
    ubicacion: "Gasolinera Oriente",
    monto: 4200,
    litros: 168,
    fecha: "Ayer, 11:00 AM"
  },
]

const topUnits = [
  { unidad: "Kenworth T680", placas: "ABC-123-D", consumo: 85000, litros: 3400 },
  { unidad: "Freightliner Cascadia", placas: "DEF-456-E", consumo: 72000, litros: 2880 },
  { unidad: "Volvo VNL", placas: "GHI-789-F", consumo: 68000, litros: 2720 },
  { unidad: "International LT", placas: "JKL-012-G", consumo: 55000, litros: 2200 },
  { unidad: "Peterbilt 579", placas: "MNO-345-H", consumo: 48000, litros: 1920 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Resumen General</h1>
        <p className="text-muted-foreground">Vista general del uso del monedero electrónico</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-primary" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                )}
                <span className={stat.trend === "up" ? "text-primary" : "text-destructive"}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Consumo Mensual</CardTitle>
            <CardDescription>Consumo en pesos de los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="mes" 
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Consumo"]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="consumo" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Litros por Mes</CardTitle>
            <CardDescription>Litros de combustible cargados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={consumptionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="mes" 
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    className="text-xs text-muted-foreground"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString()} L`, "Litros"]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="litros" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transacciones Recientes</CardTitle>
            <CardDescription>Últimas cargas de combustible registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Fuel className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.usuario}</p>
                      <p className="text-xs text-muted-foreground">{tx.unidad} - {tx.placas}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">${tx.monto.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{tx.litros} L</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unidades con Mayor Consumo</CardTitle>
            <CardDescription>Top 5 unidades por consumo este mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topUnits.map((unit, index) => (
                <div 
                  key={unit.placas} 
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{unit.unidad}</p>
                      <p className="text-xs text-muted-foreground">{unit.placas}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">${unit.consumo.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{unit.litros.toLocaleString()} L</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
