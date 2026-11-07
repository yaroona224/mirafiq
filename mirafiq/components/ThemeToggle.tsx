"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui";

type Mode = "system" | "light" | "dark";

const ORDER: Mode[] = ["system", "light", "dark"];
const LABEL: Record<Mode, string> = { system: "النظام", light: "نهاري", dark: "ليلي" };

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") setMode(saved);
    } catch {
      /* الوصول للتخزين قد يكون محجوباً */
    }
  }, []);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    setMode(next);
    const root = document.documentElement;
    if (next === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);
    try {
      if (next === "system") localStorage.removeItem("theme");
      else localStorage.setItem("theme", next);
    } catch {
      /* تجاهل */
    }
  }

  return (
    <Button variant="ghost" onClick={cycle} aria-label="تغيير المظهر">
      {LABEL[mode]}
    </Button>
  );
}
