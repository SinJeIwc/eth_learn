import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.redirect('/');
  response.cookies.set('xsolla_access_token', '', { httpOnly: true, path: '/', maxAge: 0 });
  response.cookies.set('xsolla_refresh_token', '', { httpOnly: true, path: '/', maxAge: 0 });
  response.cookies.set('xsolla_oauth_state', '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}

export const runtime = 'nodejs';
