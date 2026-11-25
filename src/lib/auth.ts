import crypto from "node:crypto";
import { cookies, headers } from "next/headers";

export const SESSION_COOKIE_NAME = "hideaway_ceo_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 10;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Keep in-memory rate limiting lightweight for single-instance Oracle deployment.
const loginFailures = new Map<string, RateLimitEntry>();

interface SessionPayload {
  email: string;
  exp: number;
}

export interface CeoSession {
  email: string;
}

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.CEO_EMAIL?.trim() &&
      process.env.CEO_PASSWORD_HASH?.trim() &&
      process.env.AUTH_SECRET?.trim()
  );
}

function sha256Buffer(value: string): Buffer {
  return crypto.createHash("sha256").update(value).digest();
}

export function verifyEmail(inputEmail: string, expectedEmail: string): boolean {
  const normalizedInput = inputEmail.trim().toLowerCase();
  const normalizedExpected = expectedEmail.trim().toLowerCase();
  return crypto.timingSafeEqual(
    sha256Buffer(normalizedInput),
    sha256Buffer(normalizedExpected)
  );
}

/**
 * Verifies a plaintext password against a stored `salt:hexHash` scrypt digest.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.trim().split(":");
  if (parts.length !== 2) {
    return false;
  }

  const [salt, keyHex] = parts;
  if (!salt || !keyHex || keyHex.length % 2 !== 0) {
    return false;
  }

  try {
    const expectedKey = Buffer.from(keyHex, "hex");
    if (expectedKey.length === 0) {
      return false;
    }
    const derivedKey = crypto.scryptSync(password, salt, expectedKey.length);
    return crypto.timingSafeEqual(derivedKey, expectedKey);
  } catch {
    return false;
  }
}

function signPayload(payloadB64: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");
}

function createSessionToken(email: string, secret: string): string {
  const payload: SessionPayload = {
    email,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  const signature = signPayload(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

function verifySessionToken(
  token: string,
  secret: string,
  expectedEmail: string
): CeoSession | null {
  const dotIndex = token.indexOf(".");
  if (dotIndex <= 0) {
    return null;
  }

  const payloadB64 = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  if (!payloadB64 || !signature) {
    return null;
  }

  const expectedSig = signPayload(payloadB64, secret);
  const sigBuf = Buffer.from(signature, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as Partial<SessionPayload>;

    if (
      typeof parsed.email !== "string" ||
      typeof parsed.exp !== "number" ||
      parsed.exp <= Date.now()
    ) {
      return null;
    }

    if (!verifyEmail(parsed.email, expectedEmail)) {
      return null;
    }

    return { email: parsed.email };
  } catch {
    return null;
  }
}

export async function getCeoSession(): Promise<CeoSession | null> {
  // Always read cookies first so Next.js opts the route into dynamic rendering.
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const secret = process.env.AUTH_SECRET?.trim();
  const expectedEmail = process.env.CEO_EMAIL?.trim();
  if (!secret || !expectedEmail) {
    return null;
  }

  return verifySessionToken(token, secret, expectedEmail);
}

export async function setCeoSessionCookie(email: string): Promise<void> {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  const token = createSessionToken(email, secret);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearCeoSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headerStore.get("x-real-ip")?.trim() || "unknown";
}

function pruneExpiredRateLimits(now: number): void {
  if (loginFailures.size < 100) {
    return;
  }
  for (const [key, entry] of loginFailures.entries()) {
    if (entry.resetAt <= now) {
      loginFailures.delete(key);
    }
  }
}

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = loginFailures.get(ip);
  if (!entry) {
    return false;
  }
  if (entry.resetAt <= now) {
    loginFailures.delete(ip);
    return false;
  }
  return entry.count >= RATE_LIMIT_MAX_ATTEMPTS;
}

export function recordLoginFailure(ip: string): void {
  const now = Date.now();
  pruneExpiredRateLimits(now);
  const entry = loginFailures.get(ip);
  if (!entry || entry.resetAt <= now) {
    loginFailures.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export function clearLoginFailures(ip: string): void {
  loginFailures.delete(ip);
}
