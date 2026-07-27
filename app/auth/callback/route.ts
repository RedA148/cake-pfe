import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

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

  const user = data.user;
  const metadata = user.user_metadata as {
    avatar_url?: string;
    full_name?: string;
    name?: string;
    picture?: string;
  };

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: metadata.full_name ?? metadata.name ?? null,
      avatar_url: metadata.avatar_url ?? metadata.picture ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("[Supabase OAuth callback] profile sync failed", profileError);
    return NextResponse.redirect(new URL("/login?error=profile_sync_failed", origin));
  }

  console.log("[Supabase OAuth callback] session and profile created", { userId: user.id });
  return NextResponse.redirect(new URL(redirectPath, origin));
}
