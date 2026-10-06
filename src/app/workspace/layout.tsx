import { redirect } from "next/navigation";
import { Logo } from "../components/layout/Logo";
import { signOut } from "../actions/auth";
import { createClient } from "../lib/supabase/server";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden max-w-52 truncate text-sm text-muted sm:block">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="btn btn-ghost">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}