import Link from "next/link";
import { Logo } from "../../components/layout/Logo";
import { ArrowLeft, ArrowRight } from "lucide-react";

const tab = (active: boolean) =>
  `block rounded-full py-2.5 text-center text-sm font-medium transition ${
    active ? "bg-white/10 text-fg shadow-sm" : "text-muted hover:text-fg"
  }`;

export function AuthShell({
  mode,
  title,
  subtitle,
  children,
}: {
  mode: "sign-in" | "sign-up";
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="glow-brand -top-48" aria-hidden="true" />
      <div className="bg-grid absolute inset-x-0 top-0 h-[34rem]" aria-hidden="true" />

      <header className="container-page relative flex h-16 items-center justify-between">
        <Logo />
        <Link href="/" className="text-sm text-muted transition hover:text-fg">
          <ArrowLeft className="inline-block h-4 w-4" /> Back to home
        </Link>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="card w-full max-w-md bg-surface/80 p-6 shadow-[0_30px_80px_-30px_rgba(124,92,255,0.35)] backdrop-blur-xl sm:p-8">
          <nav aria-label="Account" className="grid grid-cols-2 rounded-full border border-line bg-white/[0.03] p-1">
            <Link href="/sign-in" aria-current={mode === "sign-in" ? "page" : undefined} className={tab(mode === "sign-in")}>
              Sign in
            </Link>
            <Link href="/sign-up" aria-current={mode === "sign-up" ? "page" : undefined} className={tab(mode === "sign-up")}>
              Sign up
            </Link>
          </nav>

          <div className="mt-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{title}</h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
          </div>

          <div className="mt-8 space-y-5">{children}</div>
        </div>
      </main>
    </div>
  );
}