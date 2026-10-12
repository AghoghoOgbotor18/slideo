import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../lib/supabase/server";

const ALLOWED_NEXT = ["/reset-password", "/workspace"];

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "";
  const next = ALLOWED_NEXT.includes(nextParam) ? nextParam : "/workspace";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("[callback] exchange failed:", error.code, error.message);
  }

  // a failed password reset goes back to the reset request page
  const failure = next === "/reset-password" ? "/forgot-password?error=expired" : "/sign-in?error=callback";
  return NextResponse.redirect(`${origin}${failure}`);
}