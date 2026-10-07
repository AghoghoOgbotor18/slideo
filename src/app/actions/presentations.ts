"use server";

import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";
import { createPresentationSchema } from "../lib/presentation";

export async function createPresentation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const parsed = createPresentationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/workspace?error=invalid_form");

  const { error } = await supabase.from("presentations").insert({ user_id: user.id, ...parsed.data });

  if (error) {
    // Shows in the terminal running `npm run dev`
    console.error("[createPresentation]", { code: error.code, message: error.message });
    redirect("/workspace?error=save_failed");
  }

  redirect("/workspace?created=1");
}