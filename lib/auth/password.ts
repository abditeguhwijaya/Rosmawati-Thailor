
import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

// Format bcrypt: $2a$, $2b$, atau $2y$.
const BCRYPT_HASH_PATTERN =
  /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

/**
 * Memeriksa format bcrypt hash.
 */
export function isBcryptHash(value: string): boolean {
  return BCRYPT_HASH_PATTERN.test(value);
}

/**
 * Membuat hash password baru.
 */
export async function hashPassword(
  password: string,
): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Memeriksa kecocokan password dengan hash.
 */
export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  if (!isBcryptHash(passwordHash)) {
    return false;
  }

  try {
    return await bcrypt.compare(password, passwordHash);
  } catch {
    return false;
  }
}
