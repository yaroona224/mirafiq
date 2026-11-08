"use client";

import { useCallback, useSyncExternalStore } from "react";
import { Button } from "@/components/ui";
import { prefsStore, write, type ThemeMode } from "@/lib/prefs";

const ORDER: ThemeMode[] = ["system", "light", "dark"];
const LABEL: Record<ThemeMode, string> = {
  system: "النظام",
  light: "نهاري",
  dark: "ليلي",
};

/**
 * زر سريع للمظهر. المصدر الوحيد للتفضيلات هو lib/prefs.ts،
 * فما يُغيَّر هنا يظهر فوراً في شاشة المظهر والعكس.
 */
export function ThemeToggle() {
  const prefs = useSyncExternalStore(
    prefsStore.subscribe,
    prefsStore.getSnapshot,
    prefsStore.getServerSnapshot,
  );

  const cycle = useCallback(() => {
    const current = prefsStore.getSnapshot();
    const next = ORDER[(ORDER.indexOf(current.theme) + 1) % ORDER.length];
    write({ ...current, theme: next });
  }, []);

  return (
    <Button variant="ghost" onClick={cycle} aria-label="تغيير المظهر">
      {LABEL[prefs.theme]}
    </Button>
  );
}
