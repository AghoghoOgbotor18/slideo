"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function PasswordInput({
  id,
  name,
  autoComplete,
  placeholder,
  minLength,
}: {
  id: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        required
        minLength={minLength}
        maxLength={72}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="input pr-12"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition hover:text-fg"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}