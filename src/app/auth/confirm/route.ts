import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "../../lib/supabase/server";

const ALLOWED_TYPES: EmailOtpType[] = ["recovery", "signup", "email"];
const ALLOWED_NEXT = ["/reset-password", "/workspace"];

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "";

  // This route is only used for password resets, so those always end at the reset page
  const next =
    code || type === "recovery" ? "/reset-password" : ALLOWED_NEXT.includes(nextParam) ? nextParam : "/workspace";

  const supabase = await createClient();

  if (code) {
    // Supabase's default email: the link arrives with ?code=
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("[confirm] code exchange failed:", error.code, error.message);
  } else if (tokenHash && type && ALLOWED_TYPES.includes(type)) {
    // A custom email template: the link arrives with ?token_hash= and ?type=
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("[confirm] verifyOtp failed:", error.code, error.message);
  } else {
    console.error("[confirm] link has neither code nor token_hash. Params present:", [...searchParams.keys()]);
  }

  return NextResponse.redirect(`${origin}/forgot-password?error=expired`);
}