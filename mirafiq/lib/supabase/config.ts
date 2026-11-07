/**
 * قراءة مفاتيح Supabase من متغيّرات البيئة.
 * التطبيق يعمل حتى لو لم تُضبط بعد، ويعرض شاشة إعداد بدل أن يتعطّل.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
