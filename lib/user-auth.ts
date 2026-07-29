import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";

function logError(operation: string, error: { message: string; code?: string; details?: string; hint?: string }) {
  console.error(operation, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

export async function ensureCurrentUserProfile(supabaseClient?: SupabaseClient): Promise<User | null> {
  const supabase = supabaseClient ?? await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    logError("Unable to read authenticated user", authError);
    throw authError;
  }
  if (!user) return null;

  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    logError("Unable to check user profile", profileError);
    throw profileError;
  }
  if (existingProfile) return user;

  const metadata = user.user_metadata as { full_name?: unknown; name?: unknown; phone?: unknown };
  const metadataName = typeof metadata.full_name === "string"
    ? metadata.full_name
    : typeof metadata.name === "string" ? metadata.name : "";

  const { error: insertError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: metadataName.trim(),
      phone: typeof metadata.phone === "string" ? metadata.phone.trim() : "",
      role: "customer",
    },
    { onConflict: "id", ignoreDuplicates: true },
  );

  if (insertError) {
    logError("Unable to synchronize user profile", insertError);
    throw insertError;
  }

  return user;
}

export async function requireUser(returnTo: string) {
  const supabase = await createClient();
  const user = await ensureCurrentUserProfile(supabase);
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return { supabase, user };
}
