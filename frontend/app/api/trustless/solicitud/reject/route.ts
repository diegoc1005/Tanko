import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { peticionId, motivo } = body

    return NextResponse.json({
      id: peticionId,
      estado: 'RECHAZADA',
      motivo: motivo || null,
      rejectedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
