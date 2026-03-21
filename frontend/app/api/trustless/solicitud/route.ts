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

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const conductorId = searchParams.get('conductorId')

    let whereClause: any = {}

    if (session.user.empresaId) {
      whereClause.empresaId = session.user.empresaId
    }

    if (session.user.role === 'CONDUCTOR' && session.user.conductorId) {
      whereClause.conductorId = session.user.conductorId
    }

    if (estado) {
      whereClause.estado = estado
    }

    if (conductorId && session.user.role === 'ADMIN') {
      whereClause.conductorId = conductorId
    }

    const peticiones = await prisma.peticionFondo.findMany({
      where: whereClause,
      include: {
        conductor: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                email: true,
                stellarAddress: true,
              },
            },
          },
        },
        ubicacion: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(peticiones)
  } catch (error: any) {
    console.error('Error fetching peticiones:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener peticiones' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { monto, tipoCombustible, litros, precioLitro, ubicacionId, motivo } = body

    if (session.user.role !== 'CONDUCTOR' || !session.user.conductorId) {
      return NextResponse.json(
        { error: 'Solo conductores pueden solicitar fondos' },
        { status: 403 }
      )
    }

    const conductor = await prisma.conductor.findUnique({
      where: { id: session.user.conductorId },
    })

    if (!conductor) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 404 }
      )
    }

    if (monto > conductor.limiteCredito) {
      return NextResponse.json(
        { error: `Monto excede el límite de crédito de ${conductor.limiteCredito}` },
        { status: 400 }
      )
    }

    const peticion = await prisma.peticionFondo.create({
      data: {
        conductorId: conductor.id,
        empresaId: conductor.empresaId,
        montoSolicitado: monto,
        tipoCombustible,
        litros: litros || null,
        precioLitro: precioLitro || null,
        ubicacionId: ubicacionId || null,
        motivo: motivo || null,
        estado: 'PENDIENTE',
      },
      include: {
        conductor: {
          include: {
            usuario: {
              select: {
                nombre: true,
                email: true,
              },
            },
          },
        },
        ubicacion: true,
      },
    })

    return NextResponse.json(peticion)
  } catch (error: any) {
    console.error('Error creating peticion:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear petición' },
      { status: 500 }
    )
  }
}
