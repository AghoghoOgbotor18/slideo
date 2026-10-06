import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

export const metadata = { title: "Workspace" };

export default async function WorkspacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <main className="container-page py-16">
      <h1 className="section-title text-gradient">Welcome, {firstName}</h1>
      <p className="lead mt-3">Your workspace is coming next.</p>
    </main>
  );
}