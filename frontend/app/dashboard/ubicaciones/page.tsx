"use client"

import { useState, useEffect } from "react"
import { 
  MapPin, 
  Search,
  Fuel,
  Loader2,
  AlertCircle,
  Star,
  Clock,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:3001"

interface Location {
  id: string
  name: string
  address: string
  city?: string
  coordinates?: string
  hours?: string
  services?: string[]
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchLocations() {
      console.log(`[Locations] Fetching from ${BACKEND}/api/v1/stats/recent-transactions`)
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`${BACKEND}/api/v1/stats/recent-transactions?limit=100`)
        console.log(`[Locations] Response status: ${res.status}`)

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }

        const data = await res.json()
        console.log(`[Locations] Response:`, data)

        if (data.success && data.data) {
          const uniqueStations = new Map<string, Location>()
          data.data.forEach((tx: any) => {
            if (tx.station && !uniqueStations.has(tx.station)) {
              uniqueStations.set(tx.station, {
                id: tx.id,
                name: tx.station,
                address: tx.station,
                city: "México",
              })
            }
          })
          setLocations(Array.from(uniqueStations.values()))
        } else {
          setLocations([])
        }
      } catch (err) {
        console.error("[Locations] Error fetching data:", err)
        setError(err instanceof Error ? err.message : "Error de conexión")
        setLocations([])
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  const filteredLocations = locations.filter(loc =>
    loc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.city?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando ubicaciones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-destructive">Error al cargar ubicaciones</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ubicaciones</h1>
        <p className="text-muted-foreground">Gasolineras donde la flota ha cargado combustible</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gasolineras</CardTitle>
          <CardDescription>Estaciones donde se han registrado cargas de combustible</CardDescription>
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
          {filteredLocations.length > 0 ? (
            <div className="space-y-4">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-start gap-4 rounded-xl border border-border p-4 transition-all hover:border-primary/30"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Fuel className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{location.name}</h4>
                    <p className="text-sm text-muted-foreground">{location.address}</p>
                    {location.city && (
                      <p className="text-xs text-muted-foreground">{location.city}</p>
                    )}
                    {location.coordinates && (
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        {location.coordinates}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {location.hours && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {location.hours}
                      </div>
                    )}
                    {location.services && location.services.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {location.services.map((service, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">No hay ubicaciones registradas</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
