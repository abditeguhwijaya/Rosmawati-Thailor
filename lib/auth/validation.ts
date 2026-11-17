import { z } from "zod";

const passwordByteLength = (value: string) =>
  new TextEncoder().encode(value).length;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .max(254, "Email terlalu panjang.")
    .email("Format email tidak valid."),
  password: z
    .string()
    .min(1, "Password wajib diisi.")
    .max(200, "Password terlalu panjang."),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Password saat ini wajib diisi.")
      .max(200, "Password terlalu panjang."),
    newPassword: z
      .string()
      .min(10, "Password baru minimal 10 karakter.")
      .max(72, "Password baru maksimal 72 karakter.")
      .refine(
        (value) => passwordByteLength(value) <= 72,
        "Password baru maksimal 72 byte.",
      ),
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi password wajib diisi.")
      .max(72, "Konfirmasi password terlalu panjang."),
  })
  .superRefine((values, context) => {
    if (values.newPassword !== values.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Konfirmasi password tidak sama.",
      });
    }

    if (values.currentPassword === values.newPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "Password baru harus berbeda dari password saat ini.",
      });
    }
  });

export function toAuthFieldErrors(
  error: z.ZodError,
): Record<string, string[]> {
  const fields: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "form";
    fields[key] = [...(fields[key] ?? []), issue.message];
  }

  return fields;
}
