"use client"

import { useState } from "react"
import { 
  MapPin, 
  Search,
  Fuel,
  Navigation,
  Clock,
  Star,
  TrendingUp
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const locations = [
  {
    id: 1,
    nombre: "Gasolinera Central CDMX",
    direccion: "Av. Insurgentes Sur 1234, Col. Del Valle",
    ciudad: "Ciudad de México",
    coordenadas: "19.3910, -99.1787",
    transacciones: 156,
    litrosTotales: 28080,
    montoTotal: 702000,
    calificacion: 4.8,
    horario: "24 horas",
    servicios: ["Magna", "Premium", "Diesel"],
    position: { top: "25%", left: "35%" }
  },
  {
    id: 2,
    nombre: "Estación Reforma",
    direccion: "Paseo de la Reforma 567, Col. Juárez",
    ciudad: "Ciudad de México",
    coordenadas: "19.4284, -99.1558",
    transacciones: 98,
    litrosTotales: 17640,
    montoTotal: 441000,
    calificacion: 4.6,
    horario: "6:00 AM - 11:00 PM",
    servicios: ["Magna", "Premium", "Diesel"],
    position: { top: "30%", left: "55%" }
  },
  {
    id: 3,
    nombre: "Gasolinera Norte",
    direccion: "Blvd. Manuel Ávila Camacho 890",
    ciudad: "Naucalpan",
    coordenadas: "19.4876, -99.2234",
    transacciones: 72,
    litrosTotales: 12960,
    montoTotal: 324000,
    calificacion: 4.5,
    horario: "24 horas",
    servicios: ["Magna", "Premium"],
    position: { top: "15%", left: "45%" }
  },
  {
    id: 4,
    nombre: "Estación Sur Express",
    direccion: "Calzada de Tlalpan 2345",
    ciudad: "Ciudad de México",
    coordenadas: "19.3012, -99.1456",
    transacciones: 124,
    litrosTotales: 22320,
    montoTotal: 558000,
    calificacion: 4.7,
    horario: "24 horas",
    servicios: ["Magna", "Premium", "Diesel"],
    position: { top: "65%", left: "40%" }
  },
  {
    id: 5,
    nombre: "Gasolinera Oriente",
    direccion: "Av. Zaragoza 678, Col. Balbuena",
    ciudad: "Ciudad de México",
    coordenadas: "19.4123, -99.0987",
    transacciones: 85,
    litrosTotales: 15300,
    montoTotal: 382500,
    calificacion: 4.4,
    horario: "5:00 AM - 12:00 AM",
    servicios: ["Magna", "Premium", "Diesel"],
    position: { top: "35%", left: "75%" }
  },
  {
    id: 6,
    nombre: "Gasolinera Querétaro Centro",
    direccion: "Av. Constituyentes 456, Centro",
    ciudad: "Querétaro",
    coordenadas: "20.5881, -100.3899",
    transacciones: 45,
    litrosTotales: 8100,
    montoTotal: 198450,
    calificacion: 4.6,
    horario: "24 horas",
    servicios: ["Magna", "Premium", "Diesel"],
    position: { top: "20%", left: "60%" }
  },
]

export default function UbicacionesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState(locations[0])

  const filteredLocations = locations.filter(loc =>
    loc.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.direccion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.ciudad.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalTransacciones = locations.reduce((acc, loc) => acc + loc.transacciones, 0)
  const totalLitros = locations.reduce((acc, loc) => acc + loc.litrosTotales, 0)
  const totalMonto = locations.reduce((acc, loc) => acc + loc.montoTotal, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ubicaciones</h1>
        <p className="text-muted-foreground">Historial de estaciones de servicio utilizadas</p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transacciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                {totalTransacciones.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Litros Totales
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
              Monto Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                ${totalMonto.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mapa de Cargas</CardTitle>
            <CardDescription>Ubicaciones donde se ha cargado combustible</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-muted">
              {/* Map background with grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
              
              {/* Map content - simulated roads */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 50 L100 50" stroke="currentColor" strokeWidth="0.5" className="text-border" fill="none" />
                <path d="M50 0 L50 100" stroke="currentColor" strokeWidth="0.5" className="text-border" fill="none" />
                <path d="M0 25 L100 75" stroke="currentColor" strokeWidth="0.3" className="text-border" fill="none" />
                <path d="M0 75 L100 25" stroke="currentColor" strokeWidth="0.3" className="text-border" fill="none" />
                <path d="M25 0 L25 100" stroke="currentColor" strokeWidth="0.3" className="text-border" fill="none" />
                <path d="M75 0 L75 100" stroke="currentColor" strokeWidth="0.3" className="text-border" fill="none" />
              </svg>

              {/* Station markers */}
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all ${
                    selectedLocation.id === location.id
                      ? "bg-primary text-primary-foreground scale-110 z-10 shadow-lg"
                      : "bg-card text-primary border-2 border-primary hover:scale-105"
                  }`}
                  style={{ top: location.position.top, left: location.position.left }}
                  aria-label={`Seleccionar ${location.nombre}`}
                >
                  <Fuel className="h-5 w-5" />
                </button>
              ))}

              {/* Map legend */}
              <div className="absolute bottom-4 left-4 flex items-center gap-4 rounded-lg bg-card/90 px-4 py-2 text-xs backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                    <Fuel className="h-2 w-2 text-primary-foreground" />
                  </span>
                  <span className="text-muted-foreground">Estación con cargas</span>
                </div>
              </div>
            </div>

            {/* Selected location details */}
            {selectedLocation && (
              <div className="mt-4 rounded-xl border border-primary bg-primary/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">{selectedLocation.nombre}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedLocation.direccion}</p>
                    <p className="text-sm text-muted-foreground">{selectedLocation.ciudad}</p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    <Star className="h-3 w-3 fill-primary" />
                    {selectedLocation.calificacion}
                  </span>
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border pt-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{selectedLocation.transacciones}</p>
                    <p className="text-xs text-muted-foreground">Transacciones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{selectedLocation.litrosTotales.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Litros</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">${(selectedLocation.montoTotal / 1000).toFixed(0)}k</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location list */}
        <Card>
          <CardHeader>
            <CardTitle>Estaciones</CardTitle>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar estación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] space-y-3 overflow-y-auto pr-2">
              {filteredLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => setSelectedLocation(location)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    selectedLocation.id === location.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{location.nombre}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{location.ciudad}</p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      <Star className="h-3 w-3 fill-primary" />
                      {location.calificacion}
                    </span>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {location.transacciones} cargas
                    </span>
                    <span className="font-semibold text-primary">
                      ${(location.montoTotal / 1000).toFixed(0)}k
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {location.horario}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
