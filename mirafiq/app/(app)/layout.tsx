import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { SideNav } from "@/components/SideNav";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Notice } from "@/components/ui";
import { getBrand } from "@/lib/brand-server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const brand = await getBrand();

  let signedIn = false;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    signedIn = true;
  }

  return (
    <>
      <div className="topbar-band" />

      <header className="topbar">
        <div className="topbar-in">
          <BrandMark brand={brand} />
          <div className="u-row u-push">
            <ThemeToggle />
            {signedIn ? <SignOutButton /> : null}
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
