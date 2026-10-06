import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Only these routes run the check, so the marketing pages stay fully static and fast.
export const config = {
  matcher: ["/workspace/:path*", "/sign-in", "/sign-up"],
};