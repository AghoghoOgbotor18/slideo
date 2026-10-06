import Link from "next/link";
import { requestPasswordReset } from "../../actions/auth";
import { AuthShell } from "../../components/auth/AuthShell";
import { AuthAlert } from "../../components/auth/AuthAlert";
import { SubmitButton } from "../../components/ui/SubmitButton";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const { error, info } = await searchParams;

  return (
    <AuthShell
      mode="recovery"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to reset it."
    >
      <AuthAlert error={error} info={info} />

      <form action={requestPasswordReset} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-muted">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="input" />
        </div>
        <SubmitButton pendingText="Sending link…">Send reset link</SubmitButton>
      </form>

      <p className="text-center text-sm text-muted">
        <Link href="/sign-in" className="font-medium text-brand-soft hover:underline flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}