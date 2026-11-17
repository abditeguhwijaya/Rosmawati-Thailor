import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword, isBcryptHash, verifyPassword } from "./password";
import { getRequestMeta } from "./request";
import { loginSchema } from "./validation";

const GENERIC_LOGIN_ERROR = "Email atau password salah.";
const MAX_ACCOUNT_ATTEMPTS = 5;
const MAX_IP_FAILURES = 10;
const LOCK_MINUTES = 15;
const ATTEMPT_WINDOW_MS = LOCK_MINUTES * 60 * 1000;
const ATTEMPT_RETENTION_MS = 24 * 60 * 60 * 1000;

// Hash valid untuk menyamakan waktu respons ketika email tidak ditemukan.
const DUMMY_PASSWORD_HASH =
  "$2b$12$NVSl.d.bk5RBKfSXiZahR.9dDM052HAEyqXtPJ4gpbFVSJNCFC7hC";

export class AuthConfigurationError extends Error {}

export type LoginResult =
  | { ok: true; adminId: string }
  | { ok: false; message: string };

export type PasswordChangeResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Membuat satu akun admin awal dari environment variable, hanya jika tabel
 * AdminUser masih kosong. Password yang sudah diubah lewat UI tidak pernah
 * ditimpa oleh nilai environment.
 */
export async function ensureInitialAdmin(): Promise<void> {
  const adminCount = await prisma.adminUser.count();
  if (adminCount > 0) return;

  const parsedEmail = loginSchema.shape.email.safeParse(
    process.env.ADMIN_EMAIL ?? "",
  );
  const passwordHash = (process.env.ADMIN_PASSWORD_HASH ?? "").trim();

  if (!parsedEmail.success || !isBcryptHash(passwordHash)) {
    console.error("ensureInitialAdmin configuration:", {
      hasEmail: Boolean(process.env.ADMIN_EMAIL),
      hasHash: Boolean(process.env.ADMIN_PASSWORD_HASH),
      emailValid: parsedEmail.success,
      hashValid: isBcryptHash(passwordHash),
    });
    throw new AuthConfigurationError(
      "ADMIN_EMAIL dan ADMIN_PASSWORD_HASH (bcrypt) wajib diatur untuk membuat akun admin awal.",
    );
  }

  try {
    await prisma.adminUser.create({
      data: {
        email: normalizeEmail(parsedEmail.data),
        passwordHash,
        name: "Administrator",
        passwordChangedAt: new Date(),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return;
    }

    throw error;
  }
}

async function recordLoginAttempt(
  email: string,
  ipHash: string,
  success: boolean,
): Promise<void> {
  try {
    await prisma.adminLoginAttempt.create({
      data: { email, ipHash, success },
    });
    await prisma.adminLoginAttempt.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - ATTEMPT_RETENTION_MS) } },
    });
  } catch (error) {
    // Audit log tidak boleh membuat pengguna kehilangan akses.
    console.error("recordLoginAttempt:", error);
  }
}

function lockMessage(lockedUntil: Date): string {
  const minutes = Math.max(
    1,
    Math.ceil((lockedUntil.getTime() - Date.now()) / 60000),
  );
  return `Terlalu banyak percobaan login. Coba lagi dalam ${minutes} menit.`;
}

export async function authenticateAdmin(
  emailInput: string,
  password: string,
): Promise<LoginResult> {
  await ensureInitialAdmin();

  const email = normalizeEmail(emailInput);
  const meta = await getRequestMeta();
  const windowStart = new Date(Date.now() - ATTEMPT_WINDOW_MS);

  const ipFailures = await prisma.adminLoginAttempt.count({
    where: {
      ipHash: meta.ipHash,
      success: false,
      createdAt: { gte: windowStart },
    },
  });

  if (ipFailures >= MAX_IP_FAILURES) {
    await recordLoginAttempt(email, meta.ipHash, false);
    return {
      ok: false,
      message: `Terlalu banyak percobaan login. Coba lagi dalam ${LOCK_MINUTES} menit.`,
    };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });

  if (!admin) {
    // Tetap lakukan bcrypt compare agar waktu respons tidak membocorkan
    // apakah email terdaftar atau tidak.
    await verifyPassword(password, DUMMY_PASSWORD_HASH);
    await recordLoginAttempt(email, meta.ipHash, false);
    return { ok: false, message: GENERIC_LOGIN_ERROR };
  }

  if (!admin.isActive) {
    await verifyPassword(password, DUMMY_PASSWORD_HASH);
    await recordLoginAttempt(admin.email, meta.ipHash, false);
    return { ok: false, message: GENERIC_LOGIN_ERROR };
  }

  const now = new Date();
  if (admin.lockedUntil && admin.lockedUntil.getTime() > now.getTime()) {
    await recordLoginAttempt(admin.email, meta.ipHash, false);
    return { ok: false, message: lockMessage(admin.lockedUntil) };
  }

  const validPassword = await verifyPassword(password, admin.passwordHash);

  if (!validPassword) {
    const attempts = admin.failedLoginAttempts + 1;
    const shouldLock = attempts >= MAX_ACCOUNT_ATTEMPTS;
    const lockedUntil = shouldLock
      ? new Date(now.getTime() + LOCK_MINUTES * 60 * 1000)
      : null;

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        failedLoginAttempts: shouldLock ? 0 : attempts,
        lockedUntil,
      },
    });
    await recordLoginAttempt(admin.email, meta.ipHash, false);

    return {
      ok: false,
      message: lockedUntil ? lockMessage(lockedUntil) : GENERIC_LOGIN_ERROR,
    };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: now,
    },
  });
  await recordLoginAttempt(admin.email, meta.ipHash, true);

  return { ok: true, adminId: admin.id };
}

export async function changeAdminPassword(
  adminId: string,
  currentPassword: string,
  newPassword: string,
): Promise<PasswordChangeResult> {
  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
  });

  if (!admin || !admin.isActive) {
    return {
      ok: false,
      message: "Akun admin tidak ditemukan. Silakan login kembali.",
    };
  }

  const currentValid = await verifyPassword(
    currentPassword,
    admin.passwordHash,
  );

  if (!currentValid) {
    return {
      ok: false,
      message: "Password saat ini tidak sesuai.",
      fieldErrors: {
        currentPassword: ["Password saat ini tidak sesuai."],
      },
    };
  }

  const samePassword = await verifyPassword(newPassword, admin.passwordHash);
  if (samePassword) {
    return {
      ok: false,
      message: "Password baru harus berbeda dari password saat ini.",
      fieldErrors: {
        newPassword: ["Password baru harus berbeda dari password saat ini."],
      },
    };
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    }),
    // Semua session lama dihapus, termasuk session perangkat ini. Action akan
    // membuat session baru setelah password berhasil diubah.
    prisma.adminSession.deleteMany({ where: { adminId: admin.id } }),
  ]);

  return { ok: true };
}
