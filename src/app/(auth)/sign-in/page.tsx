import Link from "next/link";
import { signIn } from "../../actions/auth";
import { AuthShell } from "../../components/auth/AuthShell";
import { AuthAlert } from "../../components/auth/AuthAlert";
import { SubmitButton } from "../../components/ui/SubmitButton";

export const metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const { error, info } = await searchParams;

    return (
        <AuthShell mode="sign-in" title="Welcome back" subtitle="Sign in to open your workspace.">
            <AuthAlert error={error} info={info} />

            <form action={signIn} className="space-y-4">
                <div className="space-y-2">
                <label htmlFor="email" className="text-sm text-muted">Email</label>
                <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="input" />
                </div>
                <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm text-muted">Password</label>
                    
                </div>
                <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="Your password" className="input" />
                <Link href="/forgot-password" className="text-sm text-brand-soft hover:underline flex text-right w-full justify-end">
                    Forgot password?
                </Link>
                </div>
                <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
            </form>
        </AuthShell>
    );
}