import { getAuthInstance } from '../../../../lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthInstance();
    return auth.handler(request);
  } catch {
    return NextResponse.json({ ok: false, message: 'Auth handler fallback' }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthInstance();
    return auth.handler(request);
  } catch {
    return NextResponse.json({ ok: false, message: 'Auth handler fallback' }, { status: 200 });
  }
}
