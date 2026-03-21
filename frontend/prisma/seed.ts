import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../app/generated/prisma/client'
import { Keypair } from '@stellar/stellar-sdk'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tanko'
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

// Precios de combustible (simulados en USD por litro)
const PRECIOS_COMBUSTIBLE: Record<string, number> = {
  magna: 22.50,
  premium: 25.00,
  diesel: 24.50,
}

// Ubicaciones de ejemplo
const UBICACIONES_DATA = [
  { nombre: 'Gasolinera Central CDMX', direccion: 'Av. Insurgentes Sur 1234, CDMX', latitud: 19.3910, longitud: -99.1787 },
  { nombre: 'Estación Reforma', direccion: 'Paseo de la Reforma 567, CDMX', latitud: 19.4284, longitud: -99.1558 },
  { nombre: 'Gasolinera Norte Monterrey', direccion: 'Av. Eugenio Garza Sada 890, MTY', latitud: 25.6473, longitud: -100.2896 },
  { nombre: 'Estación Guadalajara Centro', direccion: 'Av. Vallarta 2345, GDL', latitud: 20.6597, longitud: -103.3496 },
  { nombre: 'Gasolinera Querétaro', direccion: 'Blvd. Bernardo Quintana 123, QRO', latitud: 20.5888, longitud: -100.3899 },
  { nombre: 'Estación Puebla Centro', direccion: 'Diagonal Defensores de la República 456, PUE', latitud: 19.0514, longitud: -98.2176 },
]

// Conductores de ejemplo
const CONDUCTORES_DATA = [
  { nombre: 'Juan Pérez García', email: 'juan.perez@transportesnorte.com' },
  { nombre: 'María García López', email: 'maria.garcia@transportesnorte.com' },
  { nombre: 'Carlos López Hernández', email: 'carlos.lopez@transportesnorte.com' },
  { nombre: 'Ana Martínez Rodríguez', email: 'ana.martinez@transportesnorte.com' },
  { nombre: 'Roberto Sánchez Torres', email: 'roberto.sanchez@transportesnorte.com' },
  { nombre: 'Laura Jiménez Flores', email: 'laura.jimenez@transportesnorte.com' },
  { nombre: 'Miguel Ángel Ruiz', email: 'miguel.ruiz@transportesnorte.com' },
  { nombre: 'Sofia Hernández Díaz', email: 'sofia.hernandez@transportesnorte.com' },
]

async function main() {
  console.log('🌱 Iniciando seed de Tanko...\n')

  // 1. Limpiar datos existentes
  console.log('🧹 Limpiando datos existentes...')
  await prisma.transaccion.deleteMany()
  await prisma.peticionFondo.deleteMany()
  await prisma.ubicacion.deleteMany()
  await prisma.conductor.deleteMany()
  await prisma.user.deleteMany()
  await prisma.empresa.deleteMany()
  console.log('✅ Datos limpiados\n')

  // 2. Generar wallet para la empresa
  console.log('🔑 Generando wallet para empresa...')
  const empresaKeypair = Keypair.random()
  console.log(`   Public Key: ${empresaKeypair.publicKey()}`)
  console.log(`   Secret Key: ${empresaKeypair.secret()}`)
  console.log('   ⚠️  GUARDA ESTE SECRET KEY EN UN LUGAR SEGURO\n')

  // 3. Crear empresa
  console.log('🏢 Creando empresa...')
  const empresa = await prisma.empresa.create({
    data: {
      nombre: 'Transportes del Norte S.A. de C.V.',
      rfc: 'TNO950215MX5',
      stellarPublicKey: empresaKeypair.publicKey(),
      feeRate: 0.003,
    },
  })
  console.log(`   Empresa creada: ${empresa.nombre}\n`)

  // 4. Crear ubicaciones
  console.log('📍 Creando ubicaciones...')
  const ubicaciones = await Promise.all(
    UBICACIONES_DATA.map(ubicacion => 
      prisma.ubicacion.create({
        data: {
          ...ubicacion,
          empresaId: empresa.id,
        },
      })
    )
  )
  console.log(`   ${ubicaciones.length} ubicaciones creadas\n`)

  // 5. Generar wallets para conductores y crear usuarios
  console.log('👨‍✈️ Creando conductores con wallets...')
  const conductores: Array<{ usuario: any; conductor: any; keypair: any }> = []

  for (const conductorData of CONDUCTORES_DATA) {
    const keypair = Keypair.random()
    
    const usuario = await prisma.user.create({
      data: {
        email: conductorData.email,
        nombre: conductorData.nombre,
        rol: 'CONDUCTOR',
        empresaId: empresa.id,
        stellarAddress: keypair.publicKey(),
      },
    })

    const conductor = await prisma.conductor.create({
      data: {
        stellarPublicKey: keypair.publicKey(),
        limiteCredito: 5000 + Math.floor(Math.random() * 5000),
        usuarioId: usuario.id,
        empresaId: empresa.id,
      },
    })

    conductores.push({ usuario, conductor, keypair })
    console.log(`   ✅ ${conductorData.nombre}`)
    console.log(`      Wallet: ${keypair.publicKey()}`)
  }
  console.log('')

  // 6. Crear admin
  console.log('👤 Creando administrador...')
  const adminKeypair = Keypair.random()
  const admin = await prisma.user.create({
    data: {
      email: 'admin@transportesnorte.com',
      nombre: 'Carlos Administrador',
      rol: 'ADMIN',
      empresaId: empresa.id,
      stellarAddress: adminKeypair.publicKey(),
      password: 'admin123',
    },
  })
  console.log(`   Admin creado: ${admin.email}`)
  console.log(`   Password: admin123 (temporal)`)
  console.log(`   Wallet: ${adminKeypair.publicKey()}\n`)

  // 7. Crear peticiones de ejemplo
  console.log('📝 Creando peticiones de ejemplo...')
  const estadosIniciales = ['PENDIENTE', 'PENDIENTE', 'PENDIENTE', 'APROBADA', 'APROBADA', 'COMPLETADA', 'COMPLETADA', 'RECHAZADA']

  for (let i = 0; i < 8; i++) {
    const conductor = conductores[i % conductores.length]
    const ubicacion = ubicaciones[Math.floor(Math.random() * ubicaciones.length)]
    const tiposCombustible = ['magna', 'premium', 'diesel']
    const tipoCombustible = tiposCombustible[Math.floor(Math.random() * 3)]
    const litros = Math.floor(Math.random() * 200) + 50
    const precioLitro = PRECIOS_COMBUSTIBLE[tipoCombustible]
    const monto = litros * precioLitro

    await prisma.peticionFondo.create({
      data: {
        conductorId: conductor.conductor.id,
        empresaId: empresa.id,
        ubicacionId: ubicacion.id,
        montoSolicitado: monto,
        montoAprobado: estadosIniciales[i] !== 'RECHAZADA' ? monto : null,
        estado: estadosIniciales[i],
        tipoCombustible,
        litros,
        precioLitro,
        motivo: `Carga de ${tipoCombustible} para ruta ${['CDMX-QRO', 'MTY-GDL', 'PUE-MTY', 'CDMX-GDL'][Math.floor(Math.random() * 4)]}`,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        approvedAt: estadosIniciales[i] !== 'PENDIENTE' ? new Date() : undefined,
        completedAt: estadosIniciales[i] === 'COMPLETADA' ? new Date() : undefined,
      },
    })
  }
  console.log('   8 peticiones creadas\n')

  // 8. Crear transacciones de ejemplo
  console.log('💰 Creando transacciones de ejemplo...')
  
  await prisma.transaccion.create({
    data: {
      empresaId: empresa.id,
      tipo: 'DEPOSITO',
      monto: 100000,
      estado: 'CONFIRMADA',
      txHash: 'abc123def456789',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  })

  for (let i = 0; i < 5; i++) {
    const conductor = conductores[i % conductores.length]
    const peticion = await prisma.peticionFondo.findFirst({
      where: { conductorId: conductor.conductor.id, estado: 'COMPLETADA' },
    })

    if (peticion) {
      await prisma.transaccion.create({
        data: {
          empresaId: empresa.id,
          peticionId: peticion.id,
          tipo: 'RELEASE',
          monto: peticion.montoAprobado || peticion.montoSolicitado,
          estado: 'CONFIRMADA',
          txHash: `tx${Date.now()}${i}`,
          feeMonto: (peticion.montoAprobado || peticion.montoSolicitado) * empresa.feeRate,
          createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          confirmedAt: new Date(),
        },
      })
    }
  }
  console.log('   Transacciones creadas\n')

  // Resumen final
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('                    ✅ SEED COMPLETADO                          ')
  console.log('═══════════════════════════════════════════════════════════════\n')
  
  console.log('📋 RESUMEN:')
  console.log(`   • Empresa: ${empresa.nombre}`)
  console.log(`   • Wallet Empresa: ${empresaKeypair.publicKey()}`)
  console.log(`   • Wallet Admin: ${adminKeypair.publicKey()}`)
  console.log(`   • Conductores: ${conductores.length}`)
  console.log(`   • Ubicaciones: ${ubicaciones.length}`)
  console.log(`   • Peticiones: 8`)
  console.log(`   • Transacciones: 6\n`)

  console.log('🔐 CREDENCIALES DE ACCESO:')
  console.log('───────────────────────────────────────────────────────────────')
  console.log('   Admin:')
  console.log('   • Email: admin@transportesnorte.com')
  console.log('   • Password: admin123')
  console.log(`   • Wallet: ${adminKeypair.publicKey()}`)
  console.log('')
  console.log('   Conductores (ejemplo - primer conductor):')
  console.log(`   • Email: juan.perez@transportesnorte.com`)
  console.log(`   • Wallet: ${conductores[0].keypair.publicKey()}`)
  console.log('───────────────────────────────────────────────────────────────\n')

  console.log('⚠️  IMPORTANTE:')
  console.log('   • Las wallets de los conductores son NUEVAS y NO tienen fondos')
  console.log('   • Usa Friendbot para фондиар las cuentas en testnet')
  console.log('   • Cambia las contraseñas en producción\n')

  console.log('🚀 Para comenzar:')
  console.log('   1. Configura las variables de entorno en .env')
  console.log('   2. Ejecuta: npx prisma db push')
  console.log('   3. Ejecuta: npm run db:seed')
  console.log('   4. Ejecuta: npm run dev')
  console.log('   5. Abre: http://localhost:3000\n')

  await pool.end()
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
