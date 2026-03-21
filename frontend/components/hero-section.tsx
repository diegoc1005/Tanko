"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Percent, Zap, MapPin, Shield } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.05),transparent_50%)]" />
      
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            Más de 5,000 estaciones afiliadas
          </div>
          
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            El monedero electrónico para
            <span className="text-primary"> combustibles </span>
            más inteligente
          </h1>
          
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
            Comisiones más bajas del mercado, registro ultrarrápido y acceso a la red de estaciones de servicio más grande. Controla tus gastos de combustible de manera eficiente.
          </p>
          
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="#registro">
                Solicitar Monedero
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
              <Link href="#mapa">
                Ver Estaciones Cercanas
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Percent className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">0.5%</span>
            <span className="text-sm text-muted-foreground">Comisión más baja</span>
          </div>
          
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">5 min</span>
            <span className="text-sm text-muted-foreground">Registro rápido</span>
          </div>
          
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">5,000+</span>
            <span className="text-sm text-muted-foreground">Estaciones afiliadas</span>
          </div>
          
          <div className="flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center shadow-sm">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">100%</span>
            <span className="text-sm text-muted-foreground">Seguro y confiable</span>
          </div>
        </div>
      </div>
    </section>
  )
}
