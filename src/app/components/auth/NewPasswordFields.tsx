"use client";

import { useState } from "react";
import { PasswordInput } from "./PasswordInput";

export function NewPasswordFields() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const typed = confirm.length > 0; // say nothing until they start typing the second one
  const matches = password === confirm;
  const mismatch = typed && !matches;

  return (
    <>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm text-muted">New password</label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="At least 8 characters"
          value={password}
          onChange={setPassword}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm" className="text-sm text-muted">Confirm new password</label>
        <PasswordInput
          id="confirm"
          name="confirm"
          autoComplete="new-password"
          minLength={8}
          placeholder="Type it again"
          value={confirm}
          onChange={setConfirm}
          problem={mismatch ? "Passwords don't match." : ""}
          describedBy="confirm-status"
        />
        <p
          id="confirm-status"
          aria-live="polite"
          className={`min-h-5 text-xs ${mismatch ? "text-red-300" : "text-emerald-300"}`}
        >
          {typed && (matches ? "✓ Passwords match" : "Passwords don't match yet")}
        </p>
      </div>
    </>
  );
}