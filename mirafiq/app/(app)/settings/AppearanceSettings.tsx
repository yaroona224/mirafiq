"use client";

import { useSyncExternalStore } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHead,
  Input,
  Notice,
  PageHead,
  Select,
  SettingRow,
  Swatches,
  Switch,
} from "@/components/ui";
import { FONT_OPTIONS } from "@/lib/brand";
import { ACCENTS, prefsStore, reset, write, type Prefs } from "@/lib/prefs";
import type { Brand } from "@/lib/types";

/** ألوان العيّنات — تطابق قيم data-accent في app/globals.css. */
const ACCENT_COLOR: Record<string, string> = {
  violet: "#5b3fd1",
  blue: "#1f6fe0",
  green: "#21874b",
  teal: "#11827c",
  orange: "#c2611b",
  plum: "#7a2545",
  rose: "#c02b6d",
};

const SCALE_LABEL: Record<number, string> = {
  1: "أصغر", 2: "صغير", 3: "افتراضي", 4: "كبير", 5: "أكبر",
};
const DENSITY_LABEL: Record<number, string> = {
  1: "مضغوط", 2: "افتراضي", 3: "مريح",
};

export function AppearanceSettings({ brand }: { brand: Brand }) {
  const prefs = useSyncExternalStore(
    prefsStore.subscribe,
    prefsStore.getSnapshot,
    prefsStore.getServerSnapshot,
  );

  function patch(next: Partial<Prefs>) {
    write({ ...prefs, ...next });
  }

  const isDefault =
    prefs.theme === "system" &&
    prefs.font === "" &&
    prefs.scale === 3 &&
    prefs.density === 2 &&
    prefs.accent === "brand";

  return (
    <>
      <PageHead
        title="المظهر"
        sub="تفضيلاتك أنت فوق هوية الشركة. لا تغيّر شيئاً عند زملائك."
      />

      <div className="u-stack">
        <Card>
          <CardHead title="العرض" />
          <CardBody>
            <SettingRow label="الوضع الداكن">
              <Switch
                label="الوضع الداكن"
                checked={prefs.theme === "dark"}
                onChange={(on) => patch({ theme: on ? "dark" : "light" })}
              />
            </SettingRow>

            <SettingRow label="اتبع إعداد النظام">
              <Switch
                label="اتبع إعداد النظام"
                checked={prefs.theme === "system"}
                onChange={(on) => patch({ theme: on ? "system" : "light" })}
              />
            </SettingRow>

            <SettingRow label={`حجم خط الواجهة — ${SCALE_LABEL[prefs.scale]}`}>
              <Input
                label=""
                name="scale"
                type="range"
                min={1}
                max={5}
                step={1}
                className="input--range"
                value={prefs.scale}
                onChange={(e) => patch({ scale: Number(e.target.value) })}
              />
            </SettingRow>

            <SettingRow label={`كثافة الجداول — ${DENSITY_LABEL[prefs.density]}`}>
              <Input
                label=""
                name="density"
                type="range"
                min={1}
                max={3}
                step={1}
                className="input--range"
                value={prefs.density}
                onChange={(e) => patch({ density: Number(e.target.value) })}
              />
            </SettingRow>

            <SettingRow label="خط الواجهة">
              <Select
                label=""
                name="font"
                options={[
                  { value: "", label: `خط الشركة — ${brand.font_family}` },
                  ...FONT_OPTIONS.map((f) => ({ value: f, label: f })),
                ]}
                value={prefs.font}
                onChange={(e) => patch({ font: e.target.value })}
              />
            </SettingRow>
          </CardBody>
        </Card>

        <Card>
          <CardHead title="لون الواجهة" />
          <CardBody>
            <p className="page-sub u-mb">
              يغيّر الروابط والأزرار والمفاتيح عندك وحدك. اختر «لون الشركة»
              للعودة إلى اللون المعتمد في شاشة الهوية.
            </p>
            <Swatches
              label="لون الواجهة"
              options={ACCENTS}
              value={prefs.accent}
              onChange={(accent) => patch({ accent })}
              colorOf={(key) =>
                key === "brand" ? brand.color_primary : ACCENT_COLOR[key]
              }
            />
          </CardBody>
        </Card>

        <Card>
          <CardHead title="إعادة الضبط" />
          <CardBody>
            <div className="u-mb">
              <Notice title="أين تُحفظ هذه الإعدادات؟">
                تُحفظ في هذا المتصفّح وحده، ولا تؤثر على بقية الفريق. تختفي إذا
                مسحت بيانات الموقع أو فتحت النظام من جهاز آخر.
              </Notice>
            </div>
            <Button variant="ghost" onClick={reset} disabled={isDefault}>
              العودة إلى هوية الشركة
            </Button>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
