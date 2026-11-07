"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import type { TaskKind, TaskStatus } from "@/lib/types";

/* ==========================================================================
   المكوّنات المشتركة.
   كل شاشة في التطبيق تُبنى من هذه فقط. لا تنسيقات خاصة في الشاشات.
   ========================================================================== */

/* ---------------- زر ---------------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  block?: boolean;
};

export function Button({ variant = "primary", block, className, ...rest }: ButtonProps) {
  const classes = [
    "btn",
    variant !== "primary" ? `btn--${variant}` : "",
    block ? "btn--block" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <button type="button" className={classes} {...rest} />;
}

/* ---------------- حقل نصّي ---------------- */

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, id, className, ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <div className="field">
      {label ? (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={["input", className ?? ""].filter(Boolean).join(" ")}
        aria-invalid={error ? "true" : undefined}
        {...rest}
      />
      {error ? <span className="field-error">{error}</span> : null}
      {!error && hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

/* ---------------- قائمة منسدلة ---------------- */

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  options: readonly string[] | { value: string; label: string }[];
};

export function Select({ label, hint, options, id, className, ...rest }: SelectProps) {
  const selectId = id ?? rest.name;
  const items = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );

  return (
    <div className="field">
      {label ? (
        <label className="field-label" htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        className={["input", className ?? ""].filter(Boolean).join(" ")}
        {...rest}
      >
        {items.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

/* ---------------- بطاقة ---------------- */

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={["card", className ?? ""].filter(Boolean).join(" ")}>{children}</div>;
}

export function CardHead({ title, extra }: { title: ReactNode; extra?: ReactNode }) {
  return (
    <div className="card-head">
      <span className="card-title">{title}</span>
      {extra ? <span className="card-head-extra">{extra}</span> : null}
    </div>
  );
}

export function CardBody({ children }: { children: ReactNode }) {
  return <div className="card-body">{children}</div>;
}

/* ---------------- عنوان صفحة ---------------- */

export function PageHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="page-head">
      <h1 className="page-title">{title}</h1>
      {sub ? <p className="page-sub">{sub}</p> : null}
    </div>
  );
}

/* ---------------- جدول ---------------- */

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="table-scroll">
      <table className="table">{children}</table>
    </div>
  );
}

export function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="empty">{text}</div>
      </td>
    </tr>
  );
}

/* ---------------- شرائح الحالة ---------------- */

const STATUS_CLASS: Record<TaskStatus, string> = {
  "جديد": "pill--new",
  "جاري": "pill--run",
  "منتهي": "pill--done",
};

export function StatusPill({
  status,
  onClick,
}: {
  status: TaskStatus;
  onClick?: () => void;
}) {
  const className = `pill ${STATUS_CLASS[status]}`;
  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick} title="تغيير الحالة">
        {status}
      </button>
    );
  }
  return <span className={className}>{status}</span>;
}

export function KindChip({ kind }: { kind: TaskKind }) {
  return <span className={`chip${kind === "طارئة" ? " chip--crit" : ""}`}>{kind}</span>;
}

export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: "new" | "run" | "done" | "crit" | "neutral";
  children: ReactNode;
}) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}

/* ---------------- تنبيه ---------------- */

export function Notice({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn" | "crit";
  title?: string;
  children: ReactNode;
}) {
  const cls = tone === "info" ? "notice" : `notice notice--${tone}`;
  return (
    <div className={cls}>
      {title ? <strong className="notice-title">{title}</strong> : null}
      {children}
    </div>
  );
}

/* ---------------- كتلة كود ---------------- */

export function CodeBlock({ children }: { children: string }) {
  return <code className="code-block">{children}</code>;
}
