import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverPubKey = searchParams.get('driverPubKey');
    const managerPubKey = searchParams.get('managerPubKey');

    let endpoint = 'funds/request';
    const params: string[] = [];

    if (driverPubKey) params.push(`driver=${driverPubKey}`);
    if (managerPubKey) params.push(`manager=${managerPubKey}`);

    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch fund requests' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await fetch(`${BACKEND_URL}/api/v1/funds/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { success: false, error: error.error || 'Failed to create fund request' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
