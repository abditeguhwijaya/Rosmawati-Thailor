"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, KeyRound, ShieldCheck, TriangleAlert } from "lucide-react";
import type { ChangePasswordState } from "@/lib/auth/action-types";
import { changePasswordAction } from "./actions";

const initialState: ChangePasswordState = {};

function firstError(
  errors: Record<string, string[]> | undefined,
  field: string,
): string | undefined {
  return errors?.[field]?.[0];
}

type FieldName = "currentPassword" | "newPassword" | "confirmPassword";

const FIELDS: Array<{
  name: FieldName;
  label: string;
  autoComplete: string;
  maxLength: number;
}> = [
  {
    name: "currentPassword",
    label: "Password saat ini",
    autoComplete: "current-password",
    maxLength: 200,
  },
  {
    name: "newPassword",
    label: "Password baru",
    autoComplete: "new-password",
    maxLength: 72,
  },
  {
    name: "confirmPassword",
    label: "Ulangi password baru",
    autoComplete: "new-password",
    maxLength: 72,
  },
];

/**
 * Form ganti password admin. Mekanisme server action, validasi, dan
 * rotasi session tidak berubah — hanya tampilannya yang diperbarui.
 */
export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState,
  );
  const [show, setShow] = useState<Record<FieldName, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  return (
    <form action={formAction} className="ad-form">
      <div className="ad-card-head">
        <div className="ad-card-head-text">
          <div className="ad-card-title">
            <span aria-hidden="true">
              <KeyRound size={17} />
            </span>
            <h3>Ganti password</h3>
          </div>
          <p>
            Gunakan minimal 10 karakter dan password yang belum pernah dipakai.
            Setelah disimpan, Anda tetap masuk dengan session baru.
          </p>
        </div>
        <ShieldCheck size={19} aria-hidden="true" />
      </div>

      {FIELDS.map((field) => {
        const error = firstError(state.fieldErrors, field.name);
        const visible = show[field.name];

        return (
          <label className="ad-field" key={field.name}>
            <span>{field.label}</span>
            <span className="ad-password">
              <input
                className="ad-input"
                name={field.name}
                type={visible ? "text" : "password"}
                autoComplete={field.autoComplete}
                minLength={field.name === "currentPassword" ? undefined : 10}
                maxLength={field.maxLength}
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${field.name}-error` : undefined}
              />
              <button
                type="button"
                className="ad-password-toggle"
                onClick={() =>
                  setShow((current) => ({
                    ...current,
                    [field.name]: !current[field.name],
                  }))
                }
                aria-label={
                  visible ? "Sembunyikan password" : "Tampilkan password"
                }
                aria-pressed={visible}
              >
                {visible ? (
                  <EyeOff size={17} aria-hidden="true" />
                ) : (
                  <Eye size={17} aria-hidden="true" />
                )}
              </button>
            </span>
            {error && (
              <small className="ad-field-error" id={`${field.name}-error`}>
                {error}
              </small>
            )}
          </label>
        );
      })}

      {state.error && (
        <p className="auth-error" role="alert">
          <TriangleAlert size={15} aria-hidden="true" />
          <span>{state.error}</span>
        </p>
      )}

      <button
        className="ad-btn ad-account-submit"
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Menyimpan..." : "Simpan password baru"}
      </button>
    </form>
  );
}
