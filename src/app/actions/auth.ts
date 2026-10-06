"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "./../lib/supabase/server";

const email = z.string().trim().toLowerCase().email().max(254);

const signInSchema = z.object({
  email,
  password: z.string().min(1).max(72),
});

const signUpSchema = z.object({
  full_name: z.string().trim().min(2).max(80),
  email,
  password: z.string().min(8).max(72),
});

// Supabase error code -> short code shown on the page
const SIGN_UP_ERRORS: Record<string, string> = {
  user_already_exists: "exists",
  email_exists: "exists",
  weak_password: "weak",
  email_address_invalid: "invalid_email",
  over_email_send_rate_limit: "rate_limit",
  over_request_rate_limit: "rate_limit",
  signup_disabled: "signup_disabled",
};

async function getOrigin() {
  const h = await headers();
  return h.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function signUp(formData: FormData) {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/sign-up?error=invalid_form");

  const { full_name, email, password } = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
      emailRedirectTo: `${await getOrigin()}/auth/callback`,
    },
  });

  if (error) {
    // Shows in the terminal running `npm run dev`
    console.error("[signUp]", { code: error.code, status: error.status, message: error.message });
    redirect(`/sign-up?error=${SIGN_UP_ERRORS[error.code ?? ""] ?? "generic"}`);
  }

  // With "Confirm email" turned off there is a session, so go straight in.
  if (!data.session) redirect("/sign-in?info=confirm");
  redirect("/workspace");
}

export async function signIn(formData: FormData) {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/sign-in?error=bad_credentials");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.code !== "invalid_credentials" && error.code !== "email_not_confirmed") {
      console.error("[signIn]", { code: error.code, status: error.status, message: error.message });
    }
    redirect(`/sign-in?error=${error.code === "email_not_confirmed" ? "unconfirmed" : "bad_credentials"}`);
  }
  redirect("/workspace");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}