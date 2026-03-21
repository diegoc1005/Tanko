import { 
  Percent, 
  Zap, 
  MapPin, 
  BarChart3, 
  CreditCard, 
  Users,
  CheckCircle2
} from "lucide-react"

const benefits = [
  {
    icon: Percent,
    title: "Comisiones Más Bajas",
    description: "Ofrecemos las comisiones más competitivas del mercado. Ahorra hasta un 60% en comparación con otros proveedores de monederos electrónicos.",
    features: [
      "Solo 0.5% por transacción",
      "Sin costos ocultos",
      "Ahorro garantizado"
    ]
  },
  {
    icon: Zap,
    title: "Registro Ultrarrápido",
    description: "Completa tu registro en menos de 5 minutos. Proceso simplificado sin papeleo innecesario ni largos tiempos de espera.",
    features: [
      "Registro en 5 minutos",
      "Verificación automática",
      "Activación inmediata"
    ]
  },
  {
    icon: MapPin,
    title: "Red de Estaciones",
    description: "Accede a más de 5,000 estaciones de servicio en todo el país. Encuentra la estación más cercana con nuestro mapa interactivo.",
    features: [
      "Cobertura nacional",
      "Mapa en tiempo real",
      "Beneficios exclusivos"
    ]
  },
  {
    icon: BarChart3,
    title: "Control Total de Gastos",
    description: "Monitorea cada transacción con reportes detallados. Visualiza el consumo por unidad, ubicación y período de tiempo.",
    features: [
      "Reportes en tiempo real",
      "Análisis por unidad",
      "Exportación de datos"
    ]
  },
  {
    icon: CreditCard,
    title: "Pagos Seguros",
    description: "Tecnología de encriptación de última generación. Tus transacciones están protegidas con los más altos estándares de seguridad.",
    features: [
      "Encriptación SSL",
      "Protección antifraude",
      "Transacciones seguras"
    ]
  },
  {
    icon: Users,
    title: "Gestión de Flotas",
    description: "Administra múltiples unidades y conductores desde un solo panel. Control centralizado para empresas de cualquier tamaño.",
    features: [
      "Múltiples usuarios",
      "Límites por unidad",
      "Alertas personalizadas"
    ]
  }
]

export function BenefitsSection() {
  return (
    <section id="beneficios" className="bg-card py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Beneficios
          </span>
          <h2 className="mt-6 text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Lo que nos diferencia del resto
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Diseñado para empresas de transporte y flotillas que buscan optimizar sus gastos en combustible con la mejor tecnología y servicio.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group rounded-2xl border border-border bg-background p-8 transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                <benefit.icon className="h-7 w-7 text-primary" />
              </div>
              
              <h3 className="mb-3 text-xl font-semibold text-foreground">
                {benefit.title}
              </h3>
              
              <p className="mb-6 text-muted-foreground">
                {benefit.description}
              </p>
              
              <ul className="space-y-2">
                {benefit.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
