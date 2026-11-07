import type { Brand } from "@/lib/types";

/** الهوية الافتراضية — تُستخدم قبل ربط قاعدة البيانات وعند أي خطأ. */
export const DEFAULT_BRAND: Brand = {
  id: 1,
  company_name: "شركة المرافق",
  logo_url: null,
  logo_letter: "م",
  color_primary: "#0D5C63",
  color_secondary: "#C8781F",
  radius: 10,
  font_family: "IBM Plex Sans Arabic",
};

/** الخطوط المتاحة — أي خط هنا يجب أن يكون محمَّلاً في app/layout.tsx. */
export const FONT_OPTIONS = [
  "IBM Plex Sans Arabic",
  "Readex Pro",
  "Tajawal",
  "Cairo",
];

/** هويات جاهزة للتجربة السريعة. */
export const BRAND_PRESETS: Array<Pick<
  Brand,
  "company_name" | "logo_letter" | "color_primary" | "color_secondary" | "radius" | "font_family"
>> = [
  {
    company_name: "المرافق المتقدمة",
    logo_letter: "م",
    color_primary: "#0D5C63",
    color_secondary: "#C8781F",
    radius: 10,
    font_family: "IBM Plex Sans Arabic",
  },
  {
    company_name: "الديار للتشغيل",
    logo_letter: "د",
    color_primary: "#27348B",
    color_secondary: "#E0A235",
    radius: 3,
    font_family: "Readex Pro",
  },
  {
    company_name: "تشغيل الخليج",
    logo_letter: "خ",
    color_primary: "#7A1F2B",
    color_secondary: "#B8912F",
    radius: 16,
    font_family: "Tajawal",
  },
  {
    company_name: "نسق للصيانة",
    logo_letter: "ن",
    color_primary: "#243043",
    color_secondary: "#2AA6B8",
    radius: 2,
    font_family: "Cairo",
  },
];

/** متغيّرات الهوية كـ style يوضع على عنصر html — يتفوّق على أي ملف CSS. */
export function brandStyle(brand: Brand): Record<string, string> {
  return {
    "--brand-primary": brand.color_primary,
    "--brand-secondary": brand.color_secondary,
    "--radius": `${brand.radius}px`,
    "--font-body": `"${brand.font_family}", system-ui, sans-serif`,
  };
}

/** تطبيق الهوية على الصفحة فوراً في المتصفّح (للمعاينة الحيّة). */
export function applyBrandToDocument(brand: Brand) {
  const style = brandStyle(brand);
  for (const [key, value] of Object.entries(style)) {
    document.documentElement.style.setProperty(key, value);
  }
}
