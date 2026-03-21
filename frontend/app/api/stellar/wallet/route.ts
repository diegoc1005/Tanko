import { NextRequest, NextResponse } from 'next/server'
import { generateKeypair, fundAccountWithFriendbot, accountExists } from '@/lib/stellar/wallet'

export async function POST(request: NextRequest) {
  try {
    // Generar nuevo par de claves
    const keypair = generateKeypair()

    // Verificar si la cuenta ya existe
    const exists = await accountExists(keypair.publicKey)

    // Si no existe y estamos en testnet, фондиар con Friendbot
    if (!exists) {
      const funded = await fundAccountWithFriendbot(keypair.publicKey)
      
      if (!funded) {
        return NextResponse.json(
          { error: 'Error al фондиар la cuenta con Friendbot' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      publicKey: keypair.publicKey,
      secretKey: keypair.secretKey,
      funded: true,
    })
  } catch (error: any) {
    console.error('Error generating wallet:', error)
    return NextResponse.json(
      { error: error.message || 'Error al generar wallet' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Endpoint de verificación de salud
  return NextResponse.json({
    status: 'ok',
    network: process.env.STELLAR_NETWORK || 'testnet',
    horizon: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  })
}
