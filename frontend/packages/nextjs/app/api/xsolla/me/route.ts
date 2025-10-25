import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(cookieHeader.split(';').map(c=>c.split('=').map(s=>s.trim())));
  const accessToken = cookies['xsolla_access_token'];

  if (!accessToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const res = await fetch('https://login.xsolla.com/api/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      // If token expired, ask client to call /api/xsolla/refresh
      return NextResponse.json({ authenticated: false, status: res.status }, { status: 401 });
    }

    const data = await res.json();
    return NextResponse.json({ authenticated: true, user: data });
  } catch (error) {
    console.error('Xsolla /me error', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

export const runtime = 'nodejs';
