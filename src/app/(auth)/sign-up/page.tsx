import { signUp } from "../../actions/auth";
import { AuthShell } from "../../components/auth/AuthShell";
import { AuthAlert } from "../../components/auth/AuthAlert";
import { PasswordInput } from "../../components/auth/PasswordInput";
import { SubmitButton } from "../../components/ui/SubmitButton";

export const metadata = { title: "Create account" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthShell mode="sign-up" title="Create your account" subtitle="Start making presentations in minutes. It's free.">
      <AuthAlert error={error} />

      <form action={signUp} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="full_name" className="text-sm text-muted">Full name</label>
          <input id="full_name" name="full_name" type="text" required minLength={2} maxLength={80} autoComplete="name" placeholder="Your name" className="input" />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-muted">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="input" />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-muted">Password</label>
          <PasswordInput id="password" name="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" />
        </div>
        <SubmitButton pendingText="Creating account…">Create account</SubmitButton>
      </form>
    </AuthShell>
  );
}