import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { NewPresentationWizard } from "../components/workspace/PresentationWizard";
import { PresentationList } from "../components/workspace/PresentationList";

export const metadata = { title: "Workspace" };

const ERRORS: Record<string, string> = {
  invalid_form: "Please check the form and try again.",
  save_failed: "We couldn't save your presentation. Please try again.",
};

export default async function WorkspacePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { error, created } = await searchParams;

  const [{ data: profile }, { data: presentations }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("presentations")
      .select("id, topic, status, slide_count, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const fullName = profile?.full_name ?? "";
  const firstName = fullName.split(" ")[0];

  return (
    <main className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="section-title text-gradient">Create a presentation</h1>
        <p className="lead mt-3">
          {firstName ? `Hi ${firstName}. ` : ""}Three quick steps and you're done.
        </p>

        {error && (
          <div role="alert" className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {ERRORS[error] ?? "Something went wrong. Please try again."}
          </div>
        )}
        {created && (
          <div role="status" className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Saved! Generating the slides is the next thing we're building.
          </div>
        )}

        <div className="card mt-8 p-5 sm:p-8">
          <NewPresentationWizard defaultName={fullName} />
        </div>
      </div>

      <section className="mx-auto mt-16 max-w-2xl" aria-labelledby="your-presentations">
        <h2 id="your-presentations" className="mb-5 text-xl font-semibold tracking-tight">
          Your presentations
        </h2>
        <PresentationList items={presentations ?? []} />
      </section>
    </main>
  );
}