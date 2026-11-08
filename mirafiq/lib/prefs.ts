/**
 * تفضيلات المظهر الخاصة بالمتصفّح.
 *
 * تُحفظ في localStorage فقط — لا تمسّ brand_settings ولا تؤثر على بقية الفريق.
 * هوية الشركة (الألوان والخط في قاعدة البيانات) تبقى هي الأساس، وهذه طبقة
 * فوقها يختارها كل مستخدم لنفسه.
 *
 * تُطبَّق عبر سمات data-* على عنصر <html>، لا عبر style مباشر: السمات لا
 * يديرها React فلا يحدث تعارض عند الترطيب، وهو نفس أسلوب data-theme القائم.
 */

export type ThemeMode = "system" | "light" | "dark";

export type Prefs = {
  theme: ThemeMode;
  /** "" تعني: اتبع خط الهوية من قاعدة البيانات. */
  font: string;
  /** حجم خط الواجهة: 1 أصغر … 5 أكبر. */
  scale: number;
  /** كثافة صفوف الجداول: 1 مضغوط … 3 مريح. */
  density: number;
  /** "brand" تعني: اتبع لون الهوية من قاعدة البيانات. */
  accent: string;
};

export const DEFAULT_PREFS: Prefs = {
  theme: "system",
  font: "",
  scale: 3,
  density: 2,
  accent: "brand",
};

/** ألوان الواجهة المتاحة. "brand" أولاً لأنه الافتراضي ويتبع هوية الشركة. */
export const ACCENTS = [
  { key: "brand", label: "لون الشركة" },
  { key: "violet", label: "بنفسجي" },
  { key: "blue", label: "أزرق" },
  { key: "green", label: "أخضر" },
  { key: "teal", label: "فيروزي" },
  { key: "orange", label: "برتقالي" },
  { key: "plum", label: "عنّابي" },
  { key: "rose", label: "وردي" },
] as const;

export const STORAGE_KEY = "mirafiq.prefs";

const clamp = (n: number, lo: number, hi: number) =>
  Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : lo;

/** لا تثق بما في التخزين: قد يكون من إصدار أقدم أو محرَّراً يدوياً. */
export function normalize(raw: unknown): Prefs {
  const o = (raw ?? {}) as Partial<Record<keyof Prefs, unknown>>;
  const theme = o.theme === "light" || o.theme === "dark" ? o.theme : "system";
  const accentKeys = ACCENTS.map((a) => a.key) as readonly string[];
  return {
    theme,
    font: typeof o.font === "string" ? o.font : "",
    scale: clamp(Number(o.scale ?? DEFAULT_PREFS.scale), 1, 5),
    density: clamp(Number(o.density ?? DEFAULT_PREFS.density), 1, 3),
    accent:
      typeof o.accent === "string" && accentKeys.includes(o.accent)
        ? o.accent
        : "brand",
  };
}

export function read(): Prefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalize(JSON.parse(raw));
    // ترقية من المفتاح القديم الذي كان يحفظ المظهر وحده.
    const old = localStorage.getItem("theme");
    if (old === "light" || old === "dark") return { ...DEFAULT_PREFS, theme: old };
  } catch {
    /* التخزين قد يكون محجوباً — نكمل بالافتراضي */
  }
  return DEFAULT_PREFS;
}

export function apply(p: Prefs) {
  const el = document.documentElement;
  if (p.theme === "system") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", p.theme);

  if (p.font) el.setAttribute("data-font", p.font);
  else el.removeAttribute("data-font");

  if (p.accent !== "brand") el.setAttribute("data-accent", p.accent);
  else el.removeAttribute("data-accent");

  el.setAttribute("data-scale", String(p.scale));
  el.setAttribute("data-density", String(p.density));
}

/* ---------------- مخزن خارجي يقرأ منه useSyncExternalStore ---------------- */

const listeners = new Set<() => void>();
let snapshot: Prefs | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      snapshot = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Prefs {
  if (!snapshot) snapshot = read();
  return snapshot;
}

/** على السيرفر لا تخزين — تطابق هذه القيمة أول رسم فلا يحدث اختلاف ترطيب. */
function getServerSnapshot(): Prefs {
  return DEFAULT_PREFS;
}

export const prefsStore = { subscribe, getSnapshot, getServerSnapshot };

export function write(next: Prefs) {
  snapshot = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* تجاهل — التفضيلات تبقى في هذه الجلسة فقط */
  }
  apply(next);
  for (const listener of listeners) listener();
}

export function reset() {
  snapshot = DEFAULT_PREFS;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("theme");
  } catch {
    /* تجاهل */
  }
  apply(DEFAULT_PREFS);
  for (const listener of listeners) listener();
}

/**
 * يُحقن في <head> ويعمل قبل أول رسم، فلا تحدث وميضة.
 * مكتوب بلا اعتماد على أي استيراد لأنه ينفَّذ كنصّ مستقل.
 */
export const PREFS_SCRIPT = `try{var k='${STORAGE_KEY}',e=document.documentElement,r=localStorage.getItem(k),p=r?JSON.parse(r):null;
if(!p){var t=localStorage.getItem('theme');p=t?{theme:t}:{}}
if(p.theme==='dark'||p.theme==='light')e.setAttribute('data-theme',p.theme);
if(p.font)e.setAttribute('data-font',p.font);
if(p.accent&&p.accent!=='brand')e.setAttribute('data-accent',p.accent);
e.setAttribute('data-scale',String(p.scale||3));
e.setAttribute('data-density',String(p.density||2));}catch(e){}`;
