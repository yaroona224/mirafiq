"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHead,
  CodeBlock,
  Input,
  Notice,
  PageHead,
  Pill,
  Select,
} from "@/components/ui";
import { BRAND_PRESETS, FONT_OPTIONS, applyBrandToDocument } from "@/lib/brand";
import { createClient } from "@/lib/supabase/client";
import { refreshBrand } from "./actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Brand } from "@/lib/types";

export function BrandEditor({ initial }: { initial: Brand }) {
  const router = useRouter();
  const [brand, setBrand] = useState<Brand>(initial);
  const [saved, setSaved] = useState<Brand>(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const dirty = JSON.stringify(brand) !== JSON.stringify(saved);

  /** كل تغيير يُطبَّق على الصفحة فوراً — قبل الحفظ. */
  function patch(next: Partial<Brand>) {
    const merged = { ...brand, ...next };
    setBrand(merged);
    applyBrandToDocument(merged);
    setMessage(null);
  }

  async function save() {
    setBusy(true);
    setMessage(null);

    const { error } = await createClient()
      .from("brand_settings")
      .update({
        company_name: brand.company_name,
        logo_url: brand.logo_url,
        logo_letter: brand.logo_letter,
        color_primary: brand.color_primary,
        color_secondary: brand.color_secondary,
        radius: brand.radius,
        font_family: brand.font_family,
      })
      .eq("id", 1);

    setBusy(false);

    if (error) {
      setMessage(`تعذّر الحفظ: ${error.message}`);
      return;
    }

    setSaved(brand);
    setMessage("تم الحفظ.");
    await refreshBrand();
    router.refresh();
  }

  function revert() {
    setBrand(saved);
    applyBrandToDocument(saved);
    setMessage(null);
  }

  const cssOut = [
    ":root {",
    `  --brand-primary: ${brand.color_primary};`,
    `  --brand-secondary: ${brand.color_secondary};`,
    `  --radius: ${brand.radius}px;`,
    `  --font-body: "${brand.font_family}";`,
    "}",
  ].join("\n");

  const sqlOut = [
    "update brand_settings set",
    `  company_name    = '${brand.company_name}',`,
    `  logo_letter     = '${brand.logo_letter}',`,
    `  color_primary   = '${brand.color_primary}',`,
    `  color_secondary = '${brand.color_secondary}',`,
    `  radius          = ${brand.radius},`,
    `  font_family     = '${brand.font_family}'`,
    "where id = 1;",
  ].join("\n");

  return (
    <>
      <PageHead
        title="هوية الشركة"
        sub="هذه الشاشة هي جدول brand_settings. أي تغيير يظهر على النظام كله فوراً."
      />

      {!isSupabaseConfigured ? (
        <div className="u-mb">
          <Notice tone="warn" title="المعاينة فقط">
            قاعدة البيانات غير مربوطة، فالحفظ معطّل. التغييرات تُعرض ولا تُخزَّن.
          </Notice>
        </div>
      ) : null}

      <div className="u-stack">
        <Card>
          <CardHead title="هويات جاهزة" />
          <CardBody>
            <div className="u-row">
              {BRAND_PRESETS.map((p) => (
                <Button key={p.company_name} variant="ghost" onClick={() => patch(p)}>
                  {p.company_name}
                </Button>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHead
            title="تخصيص"
            extra={
              dirty ? <Pill tone="run">غير محفوظ</Pill> : <Pill tone="done">محفوظ</Pill>
            }
          />
          <CardBody>
            <div className="form-grid">
              <Input
                label="اسم الشركة"
                name="company_name"
                value={brand.company_name}
                onChange={(e) => patch({ company_name: e.target.value })}
              />
              <Input
                label="حرف الشعار"
                name="logo_letter"
                maxLength={2}
                value={brand.logo_letter}
                onChange={(e) => patch({ logo_letter: e.target.value })}
              />
              <Input
                label="رابط الشعار"
                name="logo_url"
                value={brand.logo_url ?? ""}
                placeholder="اتركه فارغاً لاستخدام الحرف"
                onChange={(e) => patch({ logo_url: e.target.value || null })}
              />
              <Input
                label={`اللون الرئيسي — ${brand.color_primary}`}
                name="color_primary"
                type="color"
                className="input--color"
                value={brand.color_primary}
                onChange={(e) => patch({ color_primary: e.target.value })}
              />
              <Input
                label={`اللون الثانوي — ${brand.color_secondary}`}
                name="color_secondary"
                type="color"
                className="input--color"
                value={brand.color_secondary}
                onChange={(e) => patch({ color_secondary: e.target.value })}
              />
              <Input
                label={`حدّة الحواف — ${brand.radius}px`}
                name="radius"
                type="range"
                min={0}
                max={20}
                step={1}
                className="input--range"
                value={brand.radius}
                onChange={(e) => patch({ radius: Number(e.target.value) })}
              />
              <Select
                label="الخط"
                name="font_family"
                options={FONT_OPTIONS}
                value={brand.font_family}
                onChange={(e) => patch({ font_family: e.target.value })}
              />
            </div>

            <div className="u-row u-mt">
              <Button onClick={save} disabled={!dirty || busy || !isSupabaseConfigured}>
                {busy ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
              <Button variant="ghost" onClick={revert} disabled={!dirty}>
                تراجع
              </Button>
              {message ? <span className="field-hint">{message}</span> : null}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHead title="ما يحدث فعلياً" />
          <CardBody>
            <div className="u-stack">
              <div>
                <div className="u-eyebrow u-mb">المتغيّرات في المتصفّح</div>
                <CodeBlock>{cssOut}</CodeBlock>
              </div>
              <div>
                <div className="u-eyebrow u-mb">الصف في قاعدة البيانات</div>
                <CodeBlock>{sqlOut}</CodeBlock>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHead title="ما لا يُخصَّص — ولماذا" />
          <CardBody>
            <p className="page-sub u-mb">
              ألوان الحالات ليست جزءاً من الهوية. «منتهي» أخضر و«متأخر» أحمر في كل شركة. لو
              تُركت للتخصيص، سيختار عميل أحمر للنجاح ويفقد الفنيون القدرة على القراءة السريعة.
            </p>
            <div className="u-row">
              <Pill tone="done">منتهي</Pill>
              <Pill tone="run">جاري</Pill>
              <Pill tone="crit">متأخر عن SLA</Pill>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
