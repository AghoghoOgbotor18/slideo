import { AUTH_ERRORS, AUTH_INFO } from "../../lib/auth-messages";

export function AuthAlert({ error, info }: { error?: string; info?: string }) {
  const text = error ? (AUTH_ERRORS[error] ?? AUTH_ERRORS.generic) : info ? AUTH_INFO[info] : undefined;
  if (!text) return null;

  return (
    <div
      role={error ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm ${
        error
          ? "border-red-500/30 bg-red-500/10 text-red-200"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      }`}
    >
      {text}
    </div>
  );
}