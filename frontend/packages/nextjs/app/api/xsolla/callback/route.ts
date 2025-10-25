import { NextResponse } from 'next/server';

async function exchangeCodeForToken(code: string, redirectUri: string) {
  const tokenUrl = 'https://login.xsolla.com/api/oauth2/token';

  const params = new URLSearchParams();
  params.set('grant_type', 'authorization_code');
  params.set('code', code);
  params.set('redirect_uri', redirectUri);

  // prefer server-side secret for token exchange
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
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = url.origin;
  const redirectUri = `${origin}/api/xsolla/callback`;

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDesc = url.searchParams.get('error_description');

  // Check if Xsolla returned an error
  if (error) {
    console.error('Xsolla OAuth error:', error, errorDesc);
    const errorUrl = new URL('/', origin);
    errorUrl.searchParams.set('xsolla_error', error);
    if (errorDesc) errorUrl.searchParams.set('xsolla_error_desc', errorDesc);
    return NextResponse.redirect(errorUrl.toString());
  }

  // Validate parameters
  if (!code) {
    console.error('Missing code parameter in callback');
    return NextResponse.redirect(`${origin}/?xsolla_error=missing_code`);
  }
  if (!state) {
    console.error('Missing state parameter in callback');
    return NextResponse.redirect(`${origin}/?xsolla_error=missing_state`);
  }

  // Verify state cookie
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(cookieHeader.split(';').map(c=>c.split('=').map(s=>s.trim())));
  const storedState = cookies['xsolla_oauth_state'];

  if (!storedState || storedState !== state) {
    // possible CSRF
    console.error('State mismatch - stored:', storedState, 'received:', state);
    return NextResponse.redirect(`${origin}/?xsolla_error=state_mismatch`);
  }

  try {
    console.log('Exchanging code for token...');
    const tokenResponse = await exchangeCodeForToken(code, redirectUri);

    const accessToken = tokenResponse.access_token;
    const refreshToken = tokenResponse.refresh_token;
    const expiresIn = tokenResponse.expires_in || 3600;

    if (!accessToken) {
      throw new Error('No access token in response');
    }

    console.log('Token exchange successful, setting cookies');
    const response = NextResponse.redirect(`${origin}/?xsolla_login=success`);

    // Set HTTP-only cookies for tokens
    response.cookies.set('xsolla_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn,
    });

    if (refreshToken) {
      // refresh token longer lived (30 days)
      response.cookies.set('xsolla_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    // clear state cookie
    response.cookies.set('xsolla_oauth_state', '', { httpOnly: true, path: '/', maxAge: 0 });

    return response;
  } catch (error: any) {
    console.error('Callback token exchange error', error);
    const errorMsg = encodeURIComponent(error.message || 'Token exchange failed');
    return NextResponse.redirect(`${origin}/?xsolla_error=token_exchange&detail=${errorMsg}`);
  }
}

export const runtime = 'nodejs';
