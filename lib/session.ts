// ─── Server-only session helpers (JWT via jose) ───────────────────────────────
// This file must ONLY be imported in Server Components, API routes, and
// middleware — never in "use client" files.

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { SessionPayload } from "./authTypes";

// ─── Constants ────────────────────────────────────────────────────────────────
const COOKIE_NAME   = "session";
const SESSION_TTL   = 8 * 60 * 60;           // 8 hours in seconds
const COOKIE_MAX_AGE = SESSION_TTL;

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    // Fallback for dev-only. In production, SESSION_SECRET MUST be set.
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET environment variable is not set or too short.");
    }
    return new TextEncoder().encode("dev-only-secret-change-in-prod-!!!");
  }
  return new TextEncoder().encode(secret);
}

// ─── Sign a JWT and return it as a string ────────────────────────────────────
export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...(payload as unknown as JWTPayload) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL}s`)
    .sign(getSecret());
}

// ─── Verify a JWT and return the payload ─────────────────────────────────────
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Read session from the request cookie (Server Component / Route Handler) ─
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ─── Set session cookie after successful login ────────────────────────────────
export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

// ─── Clear session cookie on logout ──────────────────────────────────────────
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export { COOKIE_NAME };
