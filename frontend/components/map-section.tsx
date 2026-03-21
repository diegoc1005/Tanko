"use client"

import { useState } from "react"
import { MapPin, Navigation, Fuel, Clock, Phone, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const stations = [
  {
    id: 1,
    name: "Gasolinera Central CDMX",
    address: "Av. Insurgentes Sur 1234, Col. Del Valle",
    city: "Ciudad de México",
    distance: "0.5 km",
    rating: 4.8,
    hours: "24 horas",
    phone: "+52 55 1234 5678",
    services: ["Magna", "Premium", "Diesel"],
    position: { top: "25%", left: "35%" }
  },
  {
    id: 2,
    name: "Estación Reforma",
    address: "Paseo de la Reforma 567, Col. Juárez",
    city: "Ciudad de México",
    distance: "1.2 km",
    rating: 4.6,
    hours: "6:00 AM - 11:00 PM",
    phone: "+52 55 2345 6789",
    services: ["Magna", "Premium", "Diesel"],
    position: { top: "30%", left: "55%" }
  },
  {
    id: 3,
    name: "Gasolinera Norte",
    address: "Blvd. Manuel Ávila Camacho 890",
    city: "Naucalpan",
    distance: "3.5 km",
    rating: 4.5,
    hours: "24 horas",
    phone: "+52 55 3456 7890",
    services: ["Magna", "Premium"],
    position: { top: "15%", left: "45%" }
  },
  {
    id: 4,
    name: "Estación Sur Express",
    address: "Calzada de Tlalpan 2345",
    city: "Ciudad de México",
    distance: "4.8 km",
    rating: 4.7,
    hours: "24 horas",
    phone: "+52 55 4567 8901",
    services: ["Magna", "Premium", "Diesel"],
    position: { top: "65%", left: "40%" }
  },
  {
    id: 5,
    name: "Gasolinera Oriente",
    address: "Av. Zaragoza 678, Col. Balbuena",
    city: "Ciudad de México",
    distance: "5.2 km",
    rating: 4.4,
    hours: "5:00 AM - 12:00 AM",
    phone: "+52 55 5678 9012",
    services: ["Magna", "Premium", "Diesel"],
    position: { top: "35%", left: "75%" }
  }
]

export function MapSection() {
  const [selectedStation, setSelectedStation] = useState(stations[0])
  const [searchQuery, setSearchQuery] = useState("")

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <section id="mapa" className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Ubicaciones
          </span>
          <h2 className="mt-6 text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Encuentra estaciones cercanas
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Más de 5,000 estaciones de servicio afiliadas en todo el país donde puedes cargar combustible y recibir beneficios exclusivos.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-muted">
              {/* Map background with grid pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
              
              {/* Map content - simulated roads */}
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Main roads */}
                <path d="M0 50 L100 50" stroke="currentColor" strokeWidth="0.5" className="text-border" fill="none" />
                <path d="M50 0 L50 100" stroke="currentColor" strokeWidth="0.5" className="text-border" fill="none" />
                <path d="M0 25 L100 75" stroke="currentColor" strokeWidth="0.3" className="text-border" fill="none" />
                <path d="M0 75 L100 25" stroke="currentColor" strokeWidth="0.3" className="text-border" fill="none" />
                <path d="M25 0 L25 100" stroke="currentColor" strokeWidth="0.3" className="text-border" fill="none" />
                <path d="M75 0 L75 100" stroke="currentColor" strokeWidth="0.3" className="text-border" fill="none" />
              </svg>

              {/* Station markers */}
              {stations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => setSelectedStation(station)}
                  className={`absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-all ${
                    selectedStation.id === station.id
                      ? "bg-primary text-primary-foreground scale-110 z-10 shadow-lg"
                      : "bg-card text-primary border-2 border-primary hover:scale-105"
                  }`}
                  style={{ top: station.position.top, left: station.position.left }}
                  aria-label={`Seleccionar ${station.name}`}
                >
                  <Fuel className="h-5 w-5" />
                </button>
              ))}

              {/* User location indicator */}
              <div 
                className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ top: "50%", left: "50%" }}
              >
                <span className="absolute h-6 w-6 animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                  <Navigation className="h-2.5 w-2.5 text-white" />
                </span>
              </div>

              {/* Map legend */}
              <div className="absolute bottom-4 left-4 flex items-center gap-4 rounded-lg bg-card/90 px-4 py-2 text-xs backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500">
                    <Navigation className="h-2 w-2 text-white" />
                  </span>
                  <span className="text-muted-foreground">Tu ubicación</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                    <Fuel className="h-2 w-2 text-primary-foreground" />
                  </span>
                  <span className="text-muted-foreground">Estación</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar estación o dirección..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
              {filteredStations.map((station) => (
                <button
                  key={station.id}
                  onClick={() => setSelectedStation(station)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    selectedStation.id === station.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{station.name}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{station.address}</p>
                    </div>
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      <Star className="h-3 w-3 fill-primary" />
                      {station.rating}
                    </span>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {station.distance}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {station.hours}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {station.services.map((service) => (
                      <span
                        key={service}
                        className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {selectedStation && (
              <div className="rounded-xl border border-primary bg-primary/5 p-4">
                <h4 className="font-semibold text-foreground">{selectedStation.name}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{selectedStation.address}, {selectedStation.city}</p>
                
                <div className="mt-4 flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Navigation className="mr-2 h-4 w-4" />
                    Cómo llegar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
