import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { createSession, getSession, deleteSession, getUserByEmail, getUser, getPartner } from '@/lib/redis';
import type { User, Partner, Session } from '@/types';

const SESSION_COOKIE = 'partner_session';

export interface SessionData {
  session: Session;
  user: User;
  partner: Partner;
}

export async function login(email: string, password: string): Promise<SessionData | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  const partner = await getPartner(user.partnerId);
  if (!partner) return null;

  const session = await createSession(user.id, user.partnerId);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });

  return { session, user, partner };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionId) {
    await deleteSession(sessionId);
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionId) return null;

  const session = await getSession(sessionId);
  if (!session) return null;

  const [user, partner] = await Promise.all([
    getUser(session.userId),
    getPartner(session.partnerId),
  ]);

  if (!user || !partner) {
    await deleteSession(sessionId);
    return null;
  }

  return { session, user, partner };
}

export async function requireSession(): Promise<SessionData> {
  const sessionData = await getCurrentSession();
  if (!sessionData) {
    throw new Error('Unauthorized');
  }
  return sessionData;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
