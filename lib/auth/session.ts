/**
 * Session management using JWT and httpOnly cookies
 * Handles session creation, validation, and cookie management
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { config } from '../config';
import type { SessionPayload, CRMUser } from '../models/types';

const secret = new TextEncoder().encode(config.session.secret);

/**
 * Create a session token from user data
 */
export async function createSession(user: CRMUser): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + config.session.maxAge / 1000;

  const payload: SessionPayload = {
    email: user.email,
    name: user.name,
    role: user.role,
    iat: now,
    exp: expiresAt,
  };

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(expiresAt)
    .sign(secret);

  return token;
}

/**
 * Verify and decode session token
 */
export async function verifySession(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get session from cookie
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(config.session.cookieName);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySession(sessionCookie.value);
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(config.session.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: config.session.maxAge / 1000,
    path: '/',
  });
}

/**
 * Delete session cookie (logout)
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(config.session.cookieName);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}


