"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  User, 
  Car, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight,
  Loader2,
  Fuel
} from "lucide-react"

interface FormData {
  nombreUsuario: string
  email: string
  telefono: string
  modeloUnidad: string
  marcaUnidad: string
  anioUnidad: string
  especificaciones: string
  placas: string
  numeroPermiso: string
  vigenciaPermiso: string
}

export function RegistrationForm() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nombreUsuario: "",
    email: "",
    telefono: "",
    modeloUnidad: "",
    marcaUnidad: "",
    anioUnidad: "",
    especificaciones: "",
    placas: "",
    numeroPermiso: "",
    vigenciaPermiso: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsComplete(true)
  }

  const canProceedStep1 = formData.nombreUsuario && formData.email && formData.telefono
  const canProceedStep2 = formData.modeloUnidad && formData.marcaUnidad && formData.placas
  const canSubmit = formData.numeroPermiso && formData.vigenciaPermiso

  if (isComplete) {
    return (
      <section id="registro" className="bg-card py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              Registro Completado
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tu solicitud ha sido enviada exitosamente. Recibirás un correo de confirmación en las próximas horas con los detalles de tu monedero electrónico.
            </p>
            <div className="mt-8 rounded-xl border border-border bg-background p-6">
              <h3 className="font-semibold text-foreground">Resumen del registro</h3>
              <div className="mt-4 space-y-2 text-left text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Usuario:</span>
                  <span className="font-medium text-foreground">{formData.nombreUsuario}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unidad:</span>
                  <span className="font-medium text-foreground">{formData.marcaUnidad} {formData.modeloUnidad}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Placas:</span>
                  <span className="font-medium text-foreground">{formData.placas}</span>
                </div>
              </div>
            </div>
            <Button className="mt-8" onClick={() => {
              setIsComplete(false)
              setStep(1)
              setFormData({
                nombreUsuario: "",
                email: "",
                telefono: "",
                modeloUnidad: "",
                marcaUnidad: "",
                anioUnidad: "",
                especificaciones: "",
                placas: "",
                numeroPermiso: "",
                vigenciaPermiso: ""
              })
            }}>
              Registrar otra unidad
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="registro" className="bg-card py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Registro
          </span>
          <h2 className="mt-6 text-balance text-3xl font-bold tracking-tight text-foreground md:text-5xl">
            Obtén tu monedero electrónico
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Completa el formulario para registrar tu cuenta y tu unidad. El proceso toma menos de 5 minutos.
          </p>
        </div>

        {/* Progress steps */}
        <div className="mx-auto mt-12 max-w-2xl">
          <div className="flex items-center justify-between">
            {[
              { num: 1, icon: User, label: "Datos Personales" },
              { num: 2, icon: Car, label: "Datos de Unidad" },
              { num: 3, icon: FileText, label: "Permisos" }
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors ${
                      step >= s.num
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    step >= s.num ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {s.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`mx-4 h-0.5 w-16 md:w-24 ${
                    step > s.num ? "bg-primary" : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mx-auto mt-12 max-w-2xl">
          <div className="rounded-2xl border border-border bg-background p-8 shadow-sm">
            {/* Step 1: Personal Data */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Datos del Usuario</h3>
                    <p className="text-sm text-muted-foreground">Información del titular del monedero</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombreUsuario">Nombre completo del usuario</Label>
                    <Input
                      id="nombreUsuario"
                      name="nombreUsuario"
                      placeholder="Ej. Juan Pérez García"
                      value={formData.nombreUsuario}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo electrónico</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        name="telefono"
                        type="tel"
                        placeholder="+52 55 1234 5678"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Vehicle Data */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Datos de la Unidad</h3>
                    <p className="text-sm text-muted-foreground">Información del vehículo registrado</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="marcaUnidad">Marca de la unidad</Label>
                      <Input
                        id="marcaUnidad"
                        name="marcaUnidad"
                        placeholder="Ej. Kenworth, Freightliner"
                        value={formData.marcaUnidad}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modeloUnidad">Modelo de la unidad</Label>
                      <Input
                        id="modeloUnidad"
                        name="modeloUnidad"
                        placeholder="Ej. T680, Cascadia"
                        value={formData.modeloUnidad}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="anioUnidad">Año</Label>
                      <Input
                        id="anioUnidad"
                        name="anioUnidad"
                        type="number"
                        placeholder="Ej. 2023"
                        min="1990"
                        max="2026"
                        value={formData.anioUnidad}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="placas">Placas</Label>
                      <Input
                        id="placas"
                        name="placas"
                        placeholder="Ej. ABC-123-D"
                        value={formData.placas}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="especificaciones">Especificaciones adicionales</Label>
                    <Textarea
                      id="especificaciones"
                      name="especificaciones"
                      placeholder="Capacidad del tanque, tipo de combustible, características especiales..."
                      rows={3}
                      value={formData.especificaciones}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Permits */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Permisos Vigentes</h3>
                    <p className="text-sm text-muted-foreground">Documentación legal de la unidad</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="numeroPermiso">Número de permiso</Label>
                      <Input
                        id="numeroPermiso"
                        name="numeroPermiso"
                        placeholder="Ej. PERM-2024-12345"
                        value={formData.numeroPermiso}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vigenciaPermiso">Vigencia del permiso</Label>
                      <Input
                        id="vigenciaPermiso"
                        name="vigenciaPermiso"
                        type="date"
                        value={formData.vigenciaPermiso}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <CreditCard className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium text-foreground">Tu monedero estará listo</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Una vez completado el registro, recibirás tu tarjeta virtual de inmediato y la tarjeta física en un plazo de 5-7 días hábiles.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    Anterior
                  </Button>
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Fuel className="mr-2 h-4 w-4" />
                        Completar Registro
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
