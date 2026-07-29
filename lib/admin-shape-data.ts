import "server-only";

import { requireAdminUser } from "@/lib/admin-auth";
import type { ShapeOption } from "@/lib/cake-options";

function logShapeError(operation: string, error: { message: string; code?: string; details?: string; hint?: string }) {
  console.error("Shape operation failed", { operation, message: error.message, code: error.code, details: error.details, hint: error.hint });
}

export async function getAdminShapes(): Promise<{ shapes: ShapeOption[]; error: string | null }> {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase.from("shapes").select("id,name").order("name").order("id");
  if (error) {
    logShapeError("load_shapes", error);
    return { shapes: [], error: "Impossible de charger les formes." };
  }
  return { shapes: data as ShapeOption[], error: null };
}

export async function getAdminShape(shapeId: number): Promise<{ shape: ShapeOption | null; error: string | null }> {
  const { supabase } = await requireAdminUser();
  const { data, error } = await supabase.from("shapes").select("id,name").eq("id", shapeId).maybeSingle();
  if (error) {
    logShapeError("load_shape", error);
    return { shape: null, error: "Impossible de charger cette forme." };
  }
  return { shape: data as ShapeOption | null, error: null };
}
