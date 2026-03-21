import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@generated/prisma/client'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tanko'
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { peticionId, motivo } = body

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Solo administradores pueden rechazar peticiones' },
        { status: 403 }
      )
    }

    const peticion = await prisma.peticionFondo.findUnique({
      where: { id: peticionId },
    })

    if (!peticion) {
      return NextResponse.json(
        { error: 'Petición no encontrada' },
        { status: 404 }
      )
    }

    if (peticion.estado !== 'PENDIENTE') {
      return NextResponse.json(
        { error: 'La petición ya fue procesada' },
        { status: 400 }
      )
    }

    if (peticion.empresaId !== session.user.empresaId) {
      return NextResponse.json(
        { error: 'No tienes permisos sobre esta petición' },
        { status: 403 }
      )
    }

    const updatedPeticion = await prisma.peticionFondo.update({
      where: { id: peticionId },
      data: {
        estado: 'RECHAZADA',
        rejectedAt: new Date(),
        motivo: motivo || peticion.motivo,
      },
    })

    return NextResponse.json(updatedPeticion)
  } catch (error: any) {
    console.error('Error rejecting peticion:', error)
    return NextResponse.json(
      { error: error.message || 'Error al rechazar petición' },
      { status: 500 }
    )
  }
}
