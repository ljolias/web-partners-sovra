import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getGoogleAuthUrl, generateOAuthState } from '@/lib/auth/google';

export async function GET() {
  try {
    const state = generateOAuthState();

    // Store state in cookie for verification
    const cookieStore = await cookies();
    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    const authUrl = getGoogleAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/es/sovra/login?error=oauth_failed', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }
}
