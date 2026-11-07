"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Button } from "@/components/ui";

type Mode = "system" | "light" | "dark";

const ORDER: Mode[] = ["system", "light", "dark"];
const LABEL: Record<Mode, string> = { system: "النظام", light: "نهاري", dark: "ليلي" };

/** المشتركون في تغيّر المظهر — يُنبَّهون بعد كل كتابة. */
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function emit() {
  for (const listener of listeners) listener();
}

/** المظهر المحفوظ في المتصفّح. */
function getSnapshot(): Mode {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* الوصول للتخزين قد يكون محجوباً */
  }
  return "system";
}

/** على السيرفر لا يوجد تخزين — تطابق هذه القيمة أول رسم فلا يحدث اختلاف ترطيب. */
function getServerSnapshot(): Mode {
  return "system";
}

/**
 * التخزين المحلّي نظام خارجي، فيُقرأ عبر useSyncExternalStore بدل
 * setState داخل useEffect الذي يسبّب رسماً متتالياً.
 */
export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const cycle = useCallback(() => {
    const next = ORDER[(ORDER.indexOf(getSnapshot()) + 1) % ORDER.length];

    const root = document.documentElement;
    if (next === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);

    try {
      if (next === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", next);
    } catch {
      /* تجاهل */
    }

    emit();
  }, []);

  return (
    <Button variant="ghost" onClick={cycle} aria-label="تغيير المظهر">
      {LABEL[mode]}
    </Button>
  );
}
