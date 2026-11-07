import { DEFAULT_BRAND } from "@/lib/brand";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Brand } from "@/lib/types";

/** قراءة الهوية من قاعدة البيانات. لا تتعطّل أبداً — ترجع الافتراضي عند أي مشكلة. */
export async function getBrand(): Promise<Brand> {
  if (!isSupabaseConfigured) return DEFAULT_BRAND;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("brand_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return DEFAULT_BRAND;
    return { ...DEFAULT_BRAND, ...(data as Partial<Brand>) };
  } catch {
    return DEFAULT_BRAND;
  }
}
