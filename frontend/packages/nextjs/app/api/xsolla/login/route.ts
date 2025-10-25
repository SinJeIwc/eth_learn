import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(req: Request) {
  // Build authorization URL and redirect the user to Xsolla Login
  const url = new URL(req.url);
  const origin = url.origin;

  const projectId = process.env.NEXT_PUBLIC_XSOLLA_PROJECT_ID;
  const clientId = process.env.NEXT_PUBLIC_XSOLLA_CLIENT_ID;
  
  if (!projectId || !clientId) {
    console.error('XSOLLA_PROJECT_ID or CLIENT_ID not configured');
    return NextResponse.redirect(`${origin}/?xsolla_error=config_missing`);
  }

  const callbackUri = `${origin}/api/xsolla/callback`;

  // Generate a random state and store it in a secure, httpOnly cookie for CSRF protection
  const state = crypto.randomBytes(16).toString('hex');

  console.log('Starting Xsolla Login Widget flow');
  console.log('Project ID:', projectId);
  console.log('Client ID:', clientId);
  console.log('Callback URI:', callbackUri);

  // Use Xsolla Login Widget with OAuth 2.0
  const authUrl = new URL('https://login-widget.xsolla.com/latest/');
  authUrl.searchParams.set('projectId', projectId);
  authUrl.searchParams.set('login_url', `https://login.xsolla.com/api/oauth2/login/redirect?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUri)}&response_type=code&state=${state}&scope=openid email`);

  const response = NextResponse.redirect(authUrl.toString());
  // 5 minute expiry for state
  response.cookies.set('xsolla_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 5,
  });

  return response;
}

export const runtime = 'nodejs';
