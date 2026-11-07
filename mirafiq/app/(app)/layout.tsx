import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { SideNav } from "@/components/SideNav";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Notice } from "@/components/ui";
import { getBrand } from "@/lib/brand-server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

/**
 * فحص الجلسة يقرأ الكوكيز، فلا يمكن توليده مسبقاً.
 * يُدفع داخل <Suspense> وحده حتى يبقى بقيّة الـ layout في القشرة الساكنة.
 * الحماية الفعلية في proxy.ts؛ هذا خطّ دفاع ثانٍ.
 */
async function SessionControls() {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return <SignOutButton />;
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const brand = await getBrand();

  return (
    <>
      <div className="topbar-band" />

      <header className="topbar">
        <div className="topbar-in">
          <BrandMark brand={brand} />
          <div className="u-row u-push">
            <ThemeToggle />
            <Suspense fallback={null}>
              <SessionControls />
            </Suspense>
          </div>
        </div>
      </header>

      <div className="wrap">
        <div className="shell">
          <SideNav />
          <main>
            {!isSupabaseConfigured ? (
              <div className="u-mb">
                <Notice tone="warn" title="قاعدة البيانات غير مربوطة بعد">
                  التطبيق يعمل بالهوية الافتراضية. لربط Supabase: انسخ
                  {" "}<code className="u-mono">.env.local.example</code>{" "}
                  إلى <code className="u-mono">.env.local</code> واملأ القيمتين، ثم أعد تشغيل الخادم.
                  الخطوات كاملة في ملف <code className="u-mono">README.md</code>.
                </Notice>
              </div>
            ) : null}
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
