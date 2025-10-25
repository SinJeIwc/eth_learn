import { NextResponse } from 'next/server';

async function refreshToken(refreshToken: string) {
  const tokenUrl = 'https://login.xsolla.com/api/oauth2/token';

  const params = new URLSearchParams();
  params.set('grant_type', 'refresh_token');
  params.set('refresh_token', refreshToken);

  const clientId = process.env.NEXT_PUBLIC_XSOLLA_CLIENT_ID;
  const clientSecret = process.env.XSOLLA_CLIENT_SECRET;
  if (clientId) params.set('client_id', clientId);
  if (clientSecret) params.set('client_secret', clientSecret);

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Refresh failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function POST(req: Request) {
  // read refresh token cookie
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(cookieHeader.split(';').map(c=>c.split('=').map(s=>s.trim())));
  const storedRefresh = cookies['xsolla_refresh_token'];

  if (!storedRefresh) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  try {
    const tokenResponse = await refreshToken(storedRefresh);

    const accessToken = tokenResponse.access_token;
    const refreshTokenStr = tokenResponse.refresh_token || storedRefresh;
    const expiresIn = tokenResponse.expires_in || 3600;

    const response = NextResponse.json({ ok: true });

    response.cookies.set('xsolla_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn,
    });

    response.cookies.set('xsolla_refresh_token', refreshTokenStr, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error: any) {
    console.error('Refresh token error', error);
    return NextResponse.json({ error: 'Refresh failed', detail: String(error) }, { status: 500 });
  }
}

export const runtime = 'nodejs';
