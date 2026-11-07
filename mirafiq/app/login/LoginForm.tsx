"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/BrandMark";
import { Button, Card, CardBody, Input, Notice } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Brand } from "@/lib/types";

export function LoginForm({ brand }: { brand: Brand }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const { error: authError } = await createClient().auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "البريد أو كلمة المرور غير صحيحة."
          : authError.message,
      );
      setBusy(false);
      return;
    }

    // يُقرأ من الرابط داخل المعالج — استخدام useSearchParams يمنع التصيير المسبق.
    const next = new URLSearchParams(window.location.search).get("next");
    router.replace(next && next.startsWith("/") ? next : "/tasks");
    router.refresh();
  }

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-brand">
          <BrandMark brand={brand} />
        </div>

        {!isSupabaseConfigured ? (
          <Notice tone="warn" title="قاعدة البيانات غير مربوطة">
            لا يمكن تسجيل الدخول قبل ربط Supabase. راجع الخطوة الثانية في
            {" "}<code className="u-mono">README.md</code>.
          </Notice>
        ) : (
          <Card>
            <CardBody>
              <form onSubmit={submit} className="u-stack">
                <Input
                  label="البريد الإلكتروني"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                />
                <Input
                  label="كلمة المرور"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={error ?? undefined}
                />
                <Button type="submit" block disabled={busy}>
                  {busy ? "جارٍ الدخول..." : "تسجيل الدخول"}
                </Button>
              </form>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
