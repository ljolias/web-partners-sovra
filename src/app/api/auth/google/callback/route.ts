import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { cookies } from 'next/headers';
import {
  exchangeCodeForTokens,
  getGoogleUserInfo,
  isSovraEmail,
} from '@/lib/auth/google';
import {
  getUserByEmail,
  createUser,
  updateUser,
  createSession,
  generateId,
} from '@/lib/redis/operations';

const SOVRA_PARTNER_ID = 'sovra-internal';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      logger.error('OAuth error:', { error: error });
      return NextResponse.redirect(new URL('/es/sovra/login?error=oauth_denied', baseUrl));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL('/es/sovra/login?error=invalid_callback', baseUrl));
    }

    // Verify state
    const cookieStore = await cookies();
    const storedState = cookieStore.get('oauth_state')?.value;

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL('/es/sovra/login?error=invalid_state', baseUrl));
    }

    // Clear state cookie
    cookieStore.delete('oauth_state');

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Get user info from Google
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    // Verify email domain
    if (!isSovraEmail(googleUser.email)) {
      return NextResponse.redirect(new URL('/es/sovra/login?error=unauthorized_domain', baseUrl));
    }

    // Find or create user
    let user = await getUserByEmail(googleUser.email);

    if (user) {
      // Update existing user with Google info
      await updateUser(user.id, {
        name: googleUser.name,
        googleId: googleUser.id,
        avatarUrl: googleUser.picture,
        role: 'sovra_admin',
      });
    } else {
      // Create new Sovra admin user
      const now = new Date().toISOString();
      user = {
        id: generateId(),
        partnerId: SOVRA_PARTNER_ID,
        email: googleUser.email,
        name: googleUser.name,
        role: 'sovra_admin',
        passwordHash: '', // No password for Google OAuth users
        googleId: googleUser.id,
        avatarUrl: googleUser.picture,
        createdAt: now,
        updatedAt: now,
      };
      await createUser(user);
    }

    // Create session
    const session = await createSession(user.id, SOVRA_PARTNER_ID);

    // Set session cookie
    cookieStore.set('partner_session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    // Redirect to Sovra dashboard
    return NextResponse.redirect(new URL('/es/sovra/dashboard', baseUrl));
  } catch (error) {
    logger.error('Google OAuth callback error:', { error: error });
    return NextResponse.redirect(new URL('/es/sovra/login?error=callback_failed', baseUrl));
  }
}
