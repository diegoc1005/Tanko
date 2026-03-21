import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@generated/prisma/client'
import pg from 'pg'
import { 
  exportTransacciones, 
  exportPeticiones, 
  exportConductores,
  exportReporteMensual,
  generateFilename,
  TransaccionExport,
  PeticionExport,
  ConductorExport,
  ReporteMensualExport
} from '@/lib/excel/export'

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
    const tipo = searchParams.get('tipo') || 'transacciones'
    const periodo = searchParams.get('periodo')

    if (!session.user.empresaId) {
      return NextResponse.json(
        { error: 'No tienes empresa asociada' },
        { status: 403 }
      )
    }

    let buffer: Buffer
    let filename: string

    switch (tipo) {
      case 'transacciones': {
        const transacciones = await prisma.transaccion.findMany({
          where: { empresaId: session.user.empresaId },
          include: {
            peticion: {
              include: {
                conductor: {
                  include: {
                    usuario: {
                      select: { nombre: true },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        const data: TransaccionExport[] = transacciones.map(t => ({
          id: t.id,
          fecha: t.createdAt.toISOString(),
          tipo: t.tipo,
          monto: t.monto,
          fee: t.feeMonto || 0,
          estado: t.estado,
          txHash: t.txHash || '-',
          conductor: t.peticion?.conductor?.usuario?.nombre || '-',
          peticionId: t.peticionId || undefined,
        }))

        buffer = exportTransacciones(data, {
          filename: generateFilename('tanko_transacciones'),
          sheetName: 'Transacciones',
        })
        filename = generateFilename('tanko_transacciones')
        break
      }

      case 'peticiones': {
        const peticiones = await prisma.peticionFondo.findMany({
          where: { empresaId: session.user.empresaId },
          include: {
            conductor: {
              include: {
                usuario: {
                  select: { nombre: true },
                },
              },
            },
            ubicacion: true,
          },
          orderBy: { createdAt: 'desc' },
        })

        const data: PeticionExport[] = peticiones.map(p => ({
          id: p.id,
          fechaSolicitud: p.createdAt.toISOString(),
          conductor: p.conductor.usuario.nombre,
          tipoCombustible: p.tipoCombustible,
          litros: p.litros || 0,
          montoSolicitado: p.montoSolicitado,
          montoAprobado: p.montoAprobado,
          estado: p.estado,
          ubicacion: p.ubicacion?.nombre || '-',
          motivo: p.motivo || '-',
        }))

        buffer = exportPeticiones(data, {
          filename: generateFilename('tanko_peticiones'),
          sheetName: 'Peticiones',
        })
        filename = generateFilename('tanko_peticiones')
        break
      }

      case 'conductores': {
        const conductores = await prisma.conductor.findMany({
          where: { empresaId: session.user.empresaId },
          include: {
            usuario: {
              select: {
                nombre: true,
                email: true,
                stellarAddress: true,
              },
            },
            peticiones: true,
          },
        })

        const data: ConductorExport[] = conductores.map(c => ({
          id: c.id,
          nombre: c.usuario.nombre,
          email: c.usuario.email,
          walletStellar: c.stellarPublicKey,
          limiteCredito: c.limiteCredito,
          totalPeticiones: c.peticiones.length,
          peticionesPendientes: c.peticiones.filter((p: any) => p.estado === 'PENDIENTE').length,
          peticionesAprobadas: c.peticiones.filter((p: any) => p.estado === 'APROBADA' || p.estado === 'COMPLETADA').length,
          peticionesRechazadas: c.peticiones.filter((p: any) => p.estado === 'RECHAZADA').length,
        }))

        buffer = exportConductores(data, {
          filename: generateFilename('tanko_conductores'),
          sheetName: 'Conductores',
        })
        filename = generateFilename('tanko_conductores')
        break
      }

      case 'reporte-mensual': {
        const empresa = await prisma.empresa.findUnique({
          where: { id: session.user.empresaId },
        })

        const now = new Date()
        const mesActual = periodo ? new Date(periodo) : now
        const inicioMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1)
        const finMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0)

        const transacciones = await prisma.transaccion.findMany({
          where: {
            empresaId: session.user.empresaId,
            createdAt: {
              gte: inicioMes,
              lte: finMes,
            },
          },
          include: {
            peticion: {
              include: {
                conductor: {
                  include: {
                    usuario: { select: { nombre: true } },
                  },
                },
              },
            },
          },
        })

        const peticiones = await prisma.peticionFondo.findMany({
          where: {
            empresaId: session.user.empresaId,
            createdAt: {
              gte: inicioMes,
              lte: finMes,
            },
          },
          include: {
            conductor: {
              include: {
                usuario: { select: { nombre: true } },
              },
            },
            ubicacion: true,
          },
        })

        const conductoresActivos = new Set(
          peticiones.map(p => p.conductorId)
        ).size

        const reporteData: ReporteMensualExport = {
          periodo: `${inicioMes.toLocaleDateString('es-MX')} - ${finMes.toLocaleDateString('es-MX')}`,
          empresa: empresa?.nombre || 'Unknown',
          totalFondos: transacciones
            .filter(t => t.tipo === 'DEPOSITO')
            .reduce((sum, t) => sum + t.monto, 0),
          totalLiberado: transacciones
            .filter(t => t.tipo === 'RELEASE')
            .reduce((sum, t) => sum + t.monto, 0),
          totalFees: transacciones.reduce((sum, t) => sum + (t.feeMonto || 0), 0),
          numTransacciones: transacciones.length,
          numPeticiones: peticiones.length,
          numPeticionesAprobadas: peticiones.filter(p => p.estado === 'APROBADA' || p.estado === 'COMPLETADA').length,
          numPeticionesRechazadas: peticiones.filter(p => p.estado === 'RECHAZADA').length,
          conductorsActivos,
        }

        const txData: TransaccionExport[] = transacciones.map(t => ({
          id: t.id,
          fecha: t.createdAt.toISOString(),
          tipo: t.tipo,
          monto: t.monto,
          fee: t.feeMonto || 0,
          estado: t.estado,
          txHash: t.txHash || '-',
          conductor: t.peticion?.conductor?.usuario?.nombre || '-',
        }))

        const petData: PeticionExport[] = peticiones.map(p => ({
          id: p.id,
          fechaSolicitud: p.createdAt.toISOString(),
          conductor: p.conductor.usuario.nombre,
          tipoCombustible: p.tipoCombustible,
          litros: p.litros || 0,
          montoSolicitado: p.montoSolicitado,
          montoAprobado: p.montoAprobado,
          estado: p.estado,
          ubicacion: p.ubicacion?.nombre || '-',
          motivo: p.motivo || '-',
        }))

        buffer = exportReporteMensual(reporteData, txData, petData)
        filename = generateFilename(`tanko_reporte_${inicioMes.toISOString().slice(0, 7)}`)
        break
      }

      default:
        return NextResponse.json(
          { error: 'Tipo de exportación no válido' },
          { status: 400 }
        )
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error: any) {
    console.error('Error exporting data:', error)
    return NextResponse.json(
      { error: error.message || 'Error al exportar datos' },
      { status: 500 }
    )
  }
}
