"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/tasks", label: "المهام" },
  { href: "/employees", label: "الموظفون" },
  { href: "/sites", label: "المواقع" },
  { href: "/brand", label: "الهوية" },
  { href: "/design", label: "المكوّنات" },
  { href: "/settings", label: "المظهر" },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="side" aria-label="أقسام النظام">
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className="nav"
            aria-current={active ? "page" : undefined}
          >
            <span className="nav-dot" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
