import { redirect } from "next/navigation";
import { updatePassword } from "../../actions/auth";
import { AuthShell } from "../../components/auth/AuthShell";
import { AuthAlert } from "../../components/auth/AuthAlert";
import { NewPasswordFields } from "../../components/auth/NewPasswordFields";
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
        <NewPasswordFields />
        <SubmitButton pendingText="Saving…">Save new password</SubmitButton>
      </form>
    </AuthShell>
  );
}