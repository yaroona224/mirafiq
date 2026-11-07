import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import { DEFAULT_BRAND } from "@/lib/brand";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/supabase/config";
import type { Brand } from "@/lib/types";

/** وسم الذاكرة المؤقّتة للهوية — يُبطَل عند الحفظ في شاشة الهوية. */
export const BRAND_TAG = "brand";

/**
 * قراءة الهوية من قاعدة البيانات. لا تتعطّل أبداً — ترجع الافتراضي عند أي مشكلة.
 *
 * الهوية صف عام واحد (id = 1) تقرأه سياسة brand_read_all لدور anon،
 * فلا حاجة لكوكيز المستخدم. عميل بلا كوكيز يجعل الدالة قابلة للتخزين،
 * وبهذا يبقى الـ layout الجذري قابلاً للتوليد المسبق.
 */
export async function getBrand(): Promise<Brand> {
  "use cache";
  cacheTag(BRAND_TAG);
  cacheLife("max");

  if (!isSupabaseConfigured) return DEFAULT_BRAND;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

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
