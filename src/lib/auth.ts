import crypto from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const pbkdf2Async = promisify(crypto.pbkdf2);

const COOKIE_NAME = "stavra_session";
const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 120000;

type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  exp: number;
};

function getSecret() {
  return process.env.AUTH_SECRET || "stavra-dev-secret-change-me";
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashBuf = await pbkdf2Async(password, salt, PBKDF2_ITERATIONS, 64, "sha512");
  return `pbkdf2$${PBKDF2_ITERATIONS}$${salt}$${hashBuf.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, iterationsValue, salt, originalHash] = stored.split("$");
  if (scheme !== "pbkdf2" || !iterationsValue || !salt || !originalHash) {
    return false;
  }

  const iterations = Number(iterationsValue);
  if (!Number.isFinite(iterations) || iterations <= 0) {
    return false;
  }

  const hashBuf = await pbkdf2Async(password, salt, iterations, 64, "sha512");
  const hash = hashBuf.toString("hex");

  // Guard against length mismatch which would crash timingSafeEqual
  if (hash.length !== originalHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 24 * 60 * 60;
  const body = base64url(JSON.stringify({ ...payload, exp }));
  return `${body}.${sign(body)}`;
}

export function readSessionToken(token?: string | null): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature || sign(body) !== signature) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getRequestSession(request: NextRequest) {
  return readSessionToken(request.cookies.get(COOKIE_NAME)?.value);
}

export function getServerSession() {
  return readSessionToken(cookies().get(COOKIE_NAME)?.value);
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/"
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}
