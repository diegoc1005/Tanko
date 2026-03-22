import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { peticionId, montoAprobado } = body

    return NextResponse.json({
      id: peticionId,
      estado: 'APROBADA',
      montoAprobado: montoAprobado || 0,
      approvedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
