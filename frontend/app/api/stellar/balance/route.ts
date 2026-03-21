import { NextRequest, NextResponse } from 'next/server'
import { getAccountInfo, getBalance } from '@/lib/stellar/wallet'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publicKey = searchParams.get('address')
    const assetCode = searchParams.get('asset') || 'XLM'

    if (!publicKey) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    // Obtener balance del activo específico
    const balance = await getBalance(publicKey, assetCode)

    if (balance === null) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      publicKey,
      asset: assetCode,
      balance,
    })
  } catch (error: any) {
    console.error('Error getting balance:', error)
    return NextResponse.json(
      { error: error.message || 'Error getting balance' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { publicKey } = body

    if (!publicKey) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    // Obtener información completa de la cuenta
    const accountInfo = await getAccountInfo(publicKey)

    if (!accountInfo) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(accountInfo)
  } catch (error: any) {
    console.error('Error getting account info:', error)
    return NextResponse.json(
      { error: error.message || 'Error getting account info' },
      { status: 500 }
    )
  }
}
