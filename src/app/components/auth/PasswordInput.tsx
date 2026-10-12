"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  id: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  minLength?: number;
  /** Pass value and onChange to control the field from the parent. */
  value?: string;
  onChange?: (value: string) => void;
  /** A message here marks the field as invalid and stops the form from submitting. */
  problem?: string;
  describedBy?: string;
};

export function PasswordInput({
  id,
  name,
  autoComplete,
  placeholder,
  minLength,
  value,
  onChange,
  problem,
  describedBy,
}: Props) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.setCustomValidity(problem ?? "");
  }, [problem]);

  return (
    <div className="relative">
      <input
        ref={ref}
        id={id}
        name={name}
        type={show ? "text" : "password"}
        required
        minLength={minLength}
        maxLength={72}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={problem ? true : undefined}
        aria-describedby={describedBy}
        className="input pr-12 aria-invalid:border-red-400/70"
        {...(value !== undefined
          ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value) }
          : {})}
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