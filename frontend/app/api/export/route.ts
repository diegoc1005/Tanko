import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ data: [], message: 'Export not available in demo mode' })
}

export async function POST() {
  return NextResponse.json({ data: [], message: 'Export not available in demo mode' })
}
