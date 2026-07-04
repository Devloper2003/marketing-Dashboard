import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    accounts: [],
    growthData: [],
    recentActivity: [],
    topContent: [],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'disconnect') {
      return NextResponse.json({ success: true, message: 'Account disconnected successfully' });
    }

    if (action === 'connect') {
      return NextResponse.json({ success: true, message: 'Account connected successfully' });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request' }, { status: 400 });
  }
}