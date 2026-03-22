import { NextRequest, NextResponse } from 'next/server'

const MOCK_PETICIONES = [
  {
    id: 'demo-1',
    estado: 'PENDIENTE',
    montoSolicitado: 2500,
    tipoCombustible: 'DIESEL',
    litros: 100,
    precioLitro: 25,
    createdAt: new Date().toISOString(),
    conductor: { usuario: { nombre: 'Conductor Demo', email: 'conductor@tanko.mx', stellarAddress: null } },
    ubicacion: null,
  },
]

export async function GET() {
  return NextResponse.json(MOCK_PETICIONES)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { monto, tipoCombustible, litros, precioLitro, motivo } = body

    const nueva = {
      id: `demo-${Date.now()}`,
      estado: 'PENDIENTE',
      montoSolicitado: monto,
      tipoCombustible,
      litros: litros || null,
      precioLitro: precioLitro || null,
      motivo: motivo || null,
      createdAt: new Date().toISOString(),
      conductor: { usuario: { nombre: 'Conductor Demo', email: 'conductor@tanko.mx' } },
      ubicacion: null,
    }

    return NextResponse.json(nueva)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
