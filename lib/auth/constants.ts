/** Konstanta autentikasi yang aman diimpor dari middleware (Edge) juga. */

export const ADMIN_SESSION_COOKIE = "rosmawati_admin_session";
export const ADMIN_HOME_PATH = "/admin";
export const ADMIN_LOGIN_PATH = "/admin/login";

/**
 * Membatasi tujuan redirect setelah login agar tidak bisa dipakai untuk
 * open redirect ke domain lain.
 */
export function sanitizeAdminNextPath(value: unknown): string {
  if (typeof value !== "string") return ADMIN_HOME_PATH;

  const path = value.trim();
  if (!path) return ADMIN_HOME_PATH;
  if (path.includes("\\") || path.includes("\n") || path.includes("\r")) {
    return ADMIN_HOME_PATH;
  }
  if (path === ADMIN_HOME_PATH) return path;
  if (!path.startsWith(`${ADMIN_HOME_PATH}/`) && !path.startsWith(`${ADMIN_HOME_PATH}?`)) {
    return ADMIN_HOME_PATH;
  }
  if (path === ADMIN_LOGIN_PATH || path.startsWith(`${ADMIN_LOGIN_PATH}?`)) {
    return ADMIN_HOME_PATH;
  }

  return path;
}
