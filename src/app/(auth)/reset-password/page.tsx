import { redirect } from "next/navigation";
import { updatePassword } from "../../actions/auth";
import { AuthShell } from "../../components/auth/AuthShell";
import { AuthAlert } from "../../components/auth/AuthAlert";
import { SubmitButton } from "../../components/ui/SubmitButton";
import { createClient } from "../../lib/supabase/server";

export const metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/forgot-password?error=expired");

  const { error } = await searchParams;

  return (
    <AuthShell mode="recovery" title="Set a new password" subtitle="Choose a password you haven't used before.">
      <AuthAlert error={error} />

      <form action={updatePassword} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-muted">New password</label>
          <input id="password" name="password" type="password" required minLength={8} maxLength={72} autoComplete="new-password" placeholder="At least 8 characters" className="input" />
        </div>
        <div className="space-y-2">
          <label htmlFor="confirm" className="text-sm text-muted">Confirm new password</label>
          <input id="confirm" name="confirm" type="password" required minLength={8} maxLength={72} autoComplete="new-password" placeholder="Type it again" className="input" />
        </div>
        <SubmitButton pendingText="Saving…">Save new password</SubmitButton>
      </form>
    </AuthShell>
  );
}