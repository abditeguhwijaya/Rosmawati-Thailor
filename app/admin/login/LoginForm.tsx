
"use client";

import { useActionState, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  TriangleAlert,
} from "lucide-react";

import type { LoginState } from "@/lib/auth/action-types";
import { loginAction } from "./actions";

const initialState: LoginState = {};

function firstError(
  errors: Record<string, string[]> | undefined,
  field: string,
): string | undefined {
  return errors?.[field]?.[0];
}

export default function LoginForm({
  next,
  notice,
}: {
  next: string;
  notice?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  const [email, setEmail] = useState(state.values?.email ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const emailError = firstError(state.fieldErrors, "email");
  const passwordError = firstError(state.fieldErrors, "password");

  return (
    <div className="ad-login-card">
      {notice && (
        <p className="ad-login-notice" role="status" aria-live="polite">
          {notice}
        </p>
      )}

      <form action={formAction} className="ad-login-form">
        <input type="hidden" name="next" value={next} />

        <label className="ad-field">
          <span>Email admin</span>
          <input
            className="ad-input"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            required
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(emailError)}
            aria-describedby={
              emailError ? "admin-email-error" : undefined
            }
          />

          {emailError && (
            <small className="ad-field-error" id="admin-email-error">
              {emailError}
            </small>
          )}
        </label>

        <label className="ad-field">
          <span>Password</span>

          <span className="ad-password">
            <input
              className="ad-input"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              maxLength={200}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(passwordError)}
              aria-describedby={
                passwordError ? "admin-password-error" : undefined
              }
            />

            <button
              type="button"
              className="ad-password-toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={
                showPassword
                  ? "Sembunyikan password"
                  : "Tampilkan password"
              }
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff size={17} aria-hidden="true" />
              ) : (
                <Eye size={17} aria-hidden="true" />
              )}
            </button>
          </span>

          {passwordError && (
            <small className="ad-field-error" id="admin-password-error">
              {passwordError}
            </small>
          )}
        </label>

        {state.error && (
          <p className="auth-error" role="alert">
            <TriangleAlert size={15} aria-hidden="true" />
            <span>{state.error}</span>
          </p>
        )}

        <button
          className="ad-btn ad-login-submit"
          type="submit"
          disabled={isPending}
        >
          {isPending ? "Memeriksa..." : "Masuk ke studio"}
          {!isPending && (
            <ArrowRight size={16} aria-hidden="true" />
          )}
        </button>
      </form>
    </div>
  );
}
