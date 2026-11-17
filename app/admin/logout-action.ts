"use server";

import { redirect } from "next/navigation";
import { destroyCurrentSession } from "@/lib/auth/session";

export async function logoutAction(): Promise<void> {
  try {
    await destroyCurrentSession();
  } catch (error) {
    console.error("logoutAction:", error);
  }

  redirect("/admin/login?logout=1");
}
