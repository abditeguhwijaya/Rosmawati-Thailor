"use server";

import { redirect } from "next/navigation";
import type { ChangePasswordState } from "@/lib/auth/action-types";
import { changeAdminPassword } from "@/lib/auth/admin";
import { createAdminSession, getActionAdmin } from "@/lib/auth/session";
import {
  changePasswordSchema,
  toAuthFieldErrors,
} from "@/lib/auth/validation";

export async function changePasswordAction(
  _previousState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const admin = await getActionAdmin();

  if (!admin) {
    return {
      error: "Sesi Anda telah berakhir. Silakan login kembali.",
    };
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    return {
      error: "Periksa kembali data password Anda.",
      fieldErrors: toAuthFieldErrors(parsed.error),
    };
  }

  try {
    const result = await changeAdminPassword(
      admin.id,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );

    if (!result.ok) {
      return {
        error: result.message,
        fieldErrors: result.fieldErrors,
      };
    }
  } catch (error) {
    console.error("changePasswordAction:", error);
    return {
      error: "Password gagal diubah. Silakan coba lagi.",
    };
  }

  try {
    // Rotasi session: semua session lama sudah dihapus oleh changeAdminPassword.
    await createAdminSession(admin.id);
  } catch (error) {
    console.error("changePasswordAction:createSession:", error);
    redirect("/admin/login?passwordChanged=1");
  }

  redirect("/admin/akun?changed=1");
}
