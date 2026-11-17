import "server-only";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_SESSION_COOKIE,
  sanitizeAdminNextPath,
} from "./constants";
import { getRequestMeta, sha256 } from "./request";

const DEFAULT_TTL_SECONDS = 8 * 60 * 60;
const MIN_TTL_SECONDS = 5 * 60;
const MAX_TTL_SECONDS = 7 * 24 * 60 * 60;
const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,200}$/;

export type AuthAdmin = {
  id: string;
  email: string;
  name: string | null;
  lastLoginAt: Date | null;
  passwordChangedAt: Date | null;
};

export function getSessionTtlSeconds(): number {
  const hours = Number(process.env.ADMIN_SESSION_TTL_HOURS);

  if (!Number.isFinite(hours) || hours <= 0) return DEFAULT_TTL_SECONDS;

  return Math.min(
    MAX_TTL_SECONDS,
    Math.max(MIN_TTL_SECONDS, Math.round(hours * 60 * 60)),
  );
}

function hashSessionToken(token: string): string {
  return sha256(`session:${token}`);
}

function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/**
 * Membuat session baru. Cookie hanya berisi token acak; database menyimpan
 * hash token sehingga isi database tidak bisa dipakai sebagai cookie.
 */
export async function createAdminSession(adminId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const ttlSeconds = getSessionTtlSeconds();
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  const meta = await getRequestMeta();

  await prisma.adminSession.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  await prisma.adminSession.create({
    data: {
      tokenHash,
      adminId,
      expiresAt,
      ipHash: meta.ipHash,
      userAgent: meta.userAgent,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    ...sessionCookieOptions(ttlSeconds),
    expires: expiresAt,
  });
}

export async function getCurrentAdmin(): Promise<AuthAdmin | null> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;

  if (!token || !SESSION_TOKEN_PATTERN.test(token)) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { admin: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) return null;
  if (!session.admin.isActive) return null;

  return {
    id: session.admin.id,
    email: session.admin.email,
    name: session.admin.name,
    lastLoginAt: session.admin.lastLoginAt,
    passwordChangedAt: session.admin.passwordChangedAt,
  };
}

export async function destroyCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  try {
    if (token && SESSION_TOKEN_PATTERN.test(token)) {
      await prisma.adminSession.deleteMany({
        where: { tokenHash: hashSessionToken(token) },
      });
    }
  } finally {
    // Cookie tetap dihapus meskipun penghapusan record session gagal, agar
    // browser tidak lagi mengirim token yang sama.
    cookieStore.delete({ name: ADMIN_SESSION_COOKIE, path: "/" });
  }
}

/**
 * Guard server-side untuk halaman admin. Middleware hanya melakukan redirect
 * awal; validasi session tetap dilakukan di sini terhadap database.
 */
export async function requireAdminPage(nextPath: string): Promise<AuthAdmin> {
  const admin = await getCurrentAdmin();

  if (admin) return admin;

  const cookieStore = await cookies();
  const hadSessionCookie = Boolean(cookieStore.get(ADMIN_SESSION_COOKIE));
  const safeNext = sanitizeAdminNextPath(nextPath);
  const params = new URLSearchParams({ next: safeNext });

  if (hadSessionCookie) params.set("expired", "1");

  redirect(`${ADMIN_LOGIN_PATH}?${params.toString()}`);
}

/** Guard untuk server action / route handler. */
export async function getActionAdmin(): Promise<AuthAdmin | null> {
  return getCurrentAdmin();
}

export const adminPaths = {
  home: ADMIN_HOME_PATH,
  login: ADMIN_LOGIN_PATH,
};
