import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get('unitId');
    const userId = searchParams.get('userId');
    const range = searchParams.get('range');

    let endpoint = 'fuel-logs';
    const params: string[] = [];

    if (unitId) params.push(`unitId=${unitId}`);
    if (userId) params.push(`userId=${userId}`);
    if (range) params.push(`range=${range}`);

    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch fuel logs' },
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
    const response = await fetch(`${BACKEND_URL}/api/v1/fuel-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { success: false, error: error.error || 'Failed to create fuel log' },
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
