import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { brandStyle } from "@/lib/brand";
import { getBrand } from "@/lib/brand-server";
import "./globals.css";
import "./components.css";

const FONTS_HREF =
  "https://fonts.googleapis.com/css2" +
  "?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700" +
  "&family=Readex+Pro:wght@400;500;600" +
  "&family=Tajawal:wght@400;500;700" +
  "&family=Cairo:wght@400;500;600;700" +
  "&family=IBM+Plex+Mono:wght@400;500" +
  "&display=swap";

/** عنوان التبويب يأتي من اسم الشركة في قاعدة البيانات. */
export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  return {
    title: brand.company_name,
    description: "نظام تشغيل وصيانة المرافق",
  };
}

/** يقرأ المظهر المحفوظ قبل أول رسم، فلا تحدث وميضة. */
const THEME_SCRIPT = `try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}`;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const brand = await getBrand();

  return (
    <html lang="ar" dir="rtl" style={brandStyle(brand) as CSSProperties}>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS_HREF} />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
