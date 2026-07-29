import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { ensureCurrentUserProfile } from "@/lib/user-auth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const redirectPath = next?.startsWith("/") ? next : "/";

  console.log("[Supabase OAuth callback] received", { hasCode: Boolean(code), redirectPath });

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_oauth_code", origin));
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[Supabase OAuth callback] session exchange failed", error);
    return NextResponse.redirect(new URL("/login?error=oauth_callback_failed", origin));
  }

  try {
    await ensureCurrentUserProfile(supabase);
  } catch (profileError) {
    const errorDetails = profileError && typeof profileError === "object"
      ? profileError as { message?: string; code?: string; details?: string; hint?: string }
      : {};
    console.error("[Supabase OAuth callback] profile sync failed", {
      message: errorDetails.message ?? "Unknown profile synchronization error",
      code: errorDetails.code,
      details: errorDetails.details,
      hint: errorDetails.hint,
    });
    return NextResponse.redirect(new URL("/login?error=profile_sync_failed", origin));
  }

  console.log("[Supabase OAuth callback] session and profile synchronized", { userId: data.user.id });
  return NextResponse.redirect(new URL(redirectPath, origin));
}
