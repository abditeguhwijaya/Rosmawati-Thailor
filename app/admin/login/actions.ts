"use server";

import { redirect } from "next/navigation";
import { authenticateAdmin } from "@/lib/auth/admin";
import type { LoginState } from "@/lib/auth/action-types";
import { sanitizeAdminNextPath } from "@/lib/auth/constants";
import { createAdminSession } from "@/lib/auth/session";
import { loginSchema, toAuthFieldErrors } from "@/lib/auth/validation";

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const parsed = loginSchema.safeParse({ email, password });

  if (!parsed.success) {
    return {
      error: "Periksa kembali email dan password Anda.",
      fieldErrors: toAuthFieldErrors(parsed.error),
      values: { email },
    };
  }

  const nextPath = sanitizeAdminNextPath(formData.get("next"));

  try {
    const result = await authenticateAdmin(
      parsed.data.email,
      parsed.data.password,
    );

    if (!result.ok) {
      return {
        error: result.message,
        values: { email: parsed.data.email },
      };
    }

    await createAdminSession(result.adminId);
  } catch (error) {
    console.error("loginAction:", error);
    return {
      error: "Login tidak dapat diproses saat ini. Silakan coba lagi.",
      values: { email: parsed.data.email },
    };
  }

  redirect(nextPath);
}
