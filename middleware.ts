import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_LOGIN_PATH,
  ADMIN_SESSION_COOKIE,
  sanitizeAdminNextPath,
} from "@/lib/auth/constants";

/**
 * Lapisan pertama proteksi /admin. Middleware hanya memeriksa keberadaan
 * cookie; validasi session terhadap database dilakukan di page dan setiap
 * server action.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname === ADMIN_LOGIN_PATH ||
    pathname.startsWith(`${ADMIN_LOGIN_PATH}/`)
  ) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  if (!request.cookies.get(ADMIN_SESSION_COOKIE)?.value) {
    const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
    const next = sanitizeAdminNextPath(`${pathname}${search}`);
    loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
