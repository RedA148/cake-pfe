"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
import { requireUser } from "@/lib/user-auth";

export type ProfileActionState = {
  success: boolean;
  message: string;
  errors: { full_name?: string; phone?: string };
};

export async function updateAccountProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const errors: ProfileActionState["errors"] = {};

  if (!fullName) errors.full_name = "Le nom complet est obligatoire.";
  if (!phone) errors.phone = "Le téléphone est obligatoire.";
  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Vérifiez les informations saisies.", errors };
  }

  const { supabase, user } = await requireUser("/account");
  const { data: profile, error: roleError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (roleError || profile?.role !== "customer") {
    if (roleError) {
      console.error("Account authorization failed", {
        message: roleError.message,
        code: roleError.code,
        details: roleError.details,
        hint: roleError.hint,
      });
    }
    return { success: false, message: "Vous n’êtes pas autorisé à modifier ce profil.", errors: {} };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Account profile update failed", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return { success: false, message: "Impossible d’enregistrer vos informations.", errors: {} };
  }

  if (!data) {
    return { success: false, message: "Votre profil est introuvable.", errors: {} };
  }

  revalidatePath("/account");
  revalidatePath("/");
  return { success: true, message: "Vos informations ont été enregistrées.", errors: {} };
}

export async function signOutAccount() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Account logout failed", {
      message: error.message,
      code: error.code,
      status: error.status,
    });
  }

  redirect("/login");
}
