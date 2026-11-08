"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Check,
  EmptyRow,
  Input,
  KindChip,
  Notice,
  PageHead,
  Select,
  StatusPill,
  Table,
  Tabs,
} from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { TASK_KINDS, TASK_STATUSES, type Task, type TaskStatus } from "@/lib/types";

const PAGE_SIZE = 100;

const EMPTY_COUNTS: Record<string, number> = {};
const EMPTY_IDS: Set<string> = new Set();

type Row = Task & {
  sites: { name: string } | null;
  employees: { full_name: string } | null;
};

type Option = { id: string; label: string };

type Filters = {
  status: string;
  term: string;
  site: string;
  employee: string;
  kind: string;
  range: string;
};

type Loaded = {
  key: string;
  rows: Row[];
  counts: Record<string, number>;
  total: number;
  error: string | null;
};

const DATE_RANGES = [
  { value: "all", label: "الكل" },
  { value: "today", label: "اليوم" },
  { value: "7", label: "7 أيام" },
  { value: "30", label: "30 يوماً" },
] as const;

const STATUS_TONE: Record<TaskStatus, "new" | "run" | "done"> = {
  "جديد": "new",
  "جاري": "run",
  "منتهي": "done",
};

/** بداية النافذة الزمنية، أو null للكل. */
function since(range: string): string | null {
  if (range === "all") return null;
  const d = new Date();
  if (range === "today") d.setHours(0, 0, 0, 0);
  else d.setDate(d.getDate() - Number(range));
  return d.toISOString();
}

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** قراءة واحدة لكل الأرقام والصفوف وفق الفلاتر الحالية. */
async function fetchBoard(f: Filters): Promise<Omit<Loaded, "key">> {
  const supabase = createClient();
  const from = since(f.range);
  const term = f.term.replace(/[%,()]/g, "");
  const search = term ? `title.ilike.%${term}%,code.ilike.%${term}%` : null;

  const rowsQuery = supabase
    .from("tasks")
    .select("*, sites(name), employees(full_name)");
  if (f.site !== "all") rowsQuery.eq("site_id", f.site);
  if (f.employee !== "all") rowsQuery.eq("employee_id", f.employee);
  if (f.kind !== "all") rowsQuery.eq("kind", f.kind);
  if (from) rowsQuery.gte("created_at", from);
  if (search) rowsQuery.or(search);
  if (f.status !== "all") rowsQuery.eq("status", f.status);

  const { data, error } = await rowsQuery
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (error) {
    return { rows: [], counts: EMPTY_COUNTS, total: 0, error: error.message };
  }

  /** عدّاد تبويب: count فقط، بلا جلب صفوف. */
  const countFor = async (status: TaskStatus | null) => {
    const q = supabase.from("tasks").select("id", { count: "exact", head: true });
    if (f.site !== "all") q.eq("site_id", f.site);
    if (f.employee !== "all") q.eq("employee_id", f.employee);
    if (f.kind !== "all") q.eq("kind", f.kind);
    if (from) q.gte("created_at", from);
    if (search) q.or(search);
    if (status) q.eq("status", status);
    const { count } = await q;
    return count ?? 0;
  };

  const [all, ...perStatus] = await Promise.all([
    countFor(null),
    ...TASK_STATUSES.map((s) => countFor(s)),
  ]);

  const counts: Record<string, number> = { all };
  TASK_STATUSES.forEach((s, i) => (counts[s] = perStatus[i]));

  return {
    rows: (data ?? []) as Row[],
    counts,
    total: f.status === "all" ? all : counts[f.status],
    error: null,
  };
}

export function TasksBoard() {
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [site, setSite] = useState("all");
  const [employee, setEmployee] = useState("all");
  const [kind, setKind] = useState("all");
  const [range, setRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const [sites, setSites] = useState<Option[]>([]);
  const [employees, setEmployees] = useState<Option[]>([]);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [picked, setPicked] = useState<{ key: string; ids: Set<string> }>({
    key: "",
    ids: EMPTY_IDS,
  });

  const filters = useMemo<Filters>(
    () => ({ status, term: query.trim(), site, employee, kind, range }),
    [status, query, site, employee, kind, range],
  );
  const filterKey = useMemo(() => JSON.stringify(filters), [filters]);

  /* كل ما يلي مشتقّ: لا حاجة لـ setState عند تغيّر الفلاتر. */
  const fresh = loaded?.key === filterKey ? loaded : null;
  const busy = fresh === null;
  const rows = fresh?.rows ?? [];
  const counts = fresh?.counts ?? EMPTY_COUNTS;
  const total = fresh?.total ?? 0;
  const error = fresh?.error ?? null;
  const selected = picked.key === filterKey ? picked.ids : EMPTY_IDS;

  /* قوائم الفلاتر — مرّة واحدة. */
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let alive = true;

    void (async () => {
      const supabase = createClient();
      const [s, e] = await Promise.all([
        supabase.from("sites").select("id,name").eq("is_active", true).order("name"),
        supabase
          .from("employees")
          .select("id,full_name")
          .eq("is_active", true)
          .order("full_name"),
      ]);
      if (!alive) return;
      setSites((s.data ?? []).map((r) => ({ id: r.id, label: r.name })));
      setEmployees((e.data ?? []).map((r) => ({ id: r.id, label: r.full_name })));
    })();

    return () => {
      alive = false;
    };
  }, []);

  /* الصفوف والعدّادات. لا setState قبل أوّل await. */
  useEffect(() => {
    let alive = true;

    void (async () => {
      const result = isSupabaseConfigured
        ? await fetchBoard(filters)
        : { rows: [], counts: EMPTY_COUNTS, total: 0, error: null };
      if (alive) setLoaded({ key: filterKey, ...result });
    })();

    return () => {
      alive = false;
    };
  }, [filterKey, filters]);

  const tabs = useMemo(
    () => [
      { value: "all", label: "الكل", count: counts.all ?? 0 },
      ...TASK_STATUSES.map((s) => ({
        value: s,
        label: s,
        count: counts[s] ?? 0,
        tone: STATUS_TONE[s],
      })),
    ],
    [counts],
  );

  const allOnPageSelected = rows.length > 0 && selected.size === rows.length;

  function toggleAll(on: boolean) {
    setPicked({
      key: filterKey,
      ids: on ? new Set(rows.map((r) => r.id)) : new Set(),
    });
  }

  function toggleOne(id: string, on: boolean) {
    const ids = new Set(selected);
    if (on) ids.add(id);
    else ids.delete(id);
    setPicked({ key: filterKey, ids });
  }

  function downloadSelected() {
    const chosen = rows.filter((r) => selected.has(r.id));
    if (!chosen.length) return;

    const head = ["الرقم", "المهمة", "الموقع", "الموظف", "النوع", "الحالة", "تاريخ الإنشاء"];
    const lines = chosen.map((r) =>
      [
        r.code ?? "",
        r.title,
        r.sites?.name ?? "",
        r.employees?.full_name ?? "",
        r.kind,
        r.status,
        new Date(r.created_at).toLocaleDateString("ar"),
      ]
        .map(csvCell)
        .join(","),
    );

    // BOM حتى يفتح إكسل العربية بترميز صحيح.
    const blob = new Blob(["﻿" + [head.join(","), ...lines].join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearFilters() {
    setSite("all");
    setEmployee("all");
    setKind("all");
    setRange("all");
    setQuery("");
  }

  const filtersActive =
    site !== "all" || employee !== "all" || kind !== "all" || range !== "all";

  return (
    <>
      <PageHead title="المهام" sub="أوامر العمل: الوصف والموقع والمسؤول والحالة." />

      {!isSupabaseConfigured ? (
        <div className="u-mb">
          <Notice tone="warn" title="قاعدة البيانات غير مربوطة">
            لا توجد بيانات لعرضها. اربط Supabase أولاً — الخطوات في
            {" "}<code className="u-mono">README.md</code>.
          </Notice>
        </div>
      ) : null}

      <div className="u-stack">
        <Tabs label="حالة المهمة" items={tabs} value={status} onChange={setStatus} />

        <Card>
          <CardBody>
            <div className="toolbar">
              <Input
                label=""
                name="q"
                placeholder="ابحث برقم المهمة أو وصفها..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button
                variant={showFilters ? "secondary" : "ghost"}
                onClick={() => setShowFilters((v) => !v)}
              >
                {filtersActive ? "فلاتر •" : "فلاتر"}
              </Button>
              {filtersActive ? (
                <Button variant="ghost" onClick={clearFilters}>
                  مسح
                </Button>
              ) : null}
            </div>

            {showFilters ? (
              <div className="filters">
                <Select
                  label="الموقع"
                  name="site"
                  value={site}
                  onChange={(e) => setSite(e.target.value)}
                  options={[
                    { value: "all", label: "كل المواقع" },
                    ...sites.map((s) => ({ value: s.id, label: s.label })),
                  ]}
                />
                <Select
                  label="الموظف"
                  name="employee"
                  value={employee}
                  onChange={(e) => setEmployee(e.target.value)}
                  options={[
                    { value: "all", label: "كل الموظفين" },
                    ...employees.map((s) => ({ value: s.id, label: s.label })),
                  ]}
                />
                <Select
                  label="النوع"
                  name="kind"
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                  options={[
                    { value: "all", label: "كل الأنواع" },
                    ...TASK_KINDS.map((k) => ({ value: k, label: k })),
                  ]}
                />
                <div className="field">
                  <span className="field-label">تاريخ الإنشاء</span>
                  <div className="segment">
                    {DATE_RANGES.map((r) => (
                      <Button
                        key={r.value}
                        variant={range === r.value ? "secondary" : "ghost"}
                        onClick={() => setRange(r.value)}
                      >
                        {r.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </CardBody>
        </Card>

        {error ? (
          <Notice tone="crit" title="تعذّرت قراءة المهام">
            {error}
          </Notice>
        ) : null}

        <div>
          <div className="result-bar">
            <span>
              عرض <strong>{rows.length}</strong> من <strong>{total}</strong> مهمة
            </span>
            <span className="u-push">
              <Button
                variant="secondary"
                onClick={downloadSelected}
                disabled={selected.size === 0}
              >
                تحميل المحدد ({selected.size})
              </Button>
            </span>
          </div>

          <Card>
            <Table>
              <thead>
                <tr>
                  <th className="col-check">
                    <Check
                      label="تحديد كل الصفوف المعروضة"
                      checked={allOnPageSelected}
                      indeterminate={selected.size > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th>الرقم</th>
                  <th>المهمة</th>
                  <th>الموقع</th>
                  <th>الموظف</th>
                  <th>النوع</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {busy ? (
                  <EmptyRow colSpan={7} text="جارٍ التحميل..." />
                ) : rows.length === 0 ? (
                  <EmptyRow
                    colSpan={7}
                    text={
                      isSupabaseConfigured
                        ? "لا توجد مهام مطابقة."
                        : "لا توجد بيانات — قاعدة البيانات غير مربوطة."
                    }
                  />
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} data-selected={selected.has(r.id)}>
                      <td>
                        <Check
                          label={`تحديد ${r.title}`}
                          checked={selected.has(r.id)}
                          onChange={(on) => toggleOne(r.id, on)}
                        />
                      </td>
                      <td>
                        <span className="u-mono">{r.code ?? "—"}</span>
                      </td>
                      <td className="table-strong">{r.title}</td>
                      <td className="table-dim">{r.sites?.name ?? "—"}</td>
                      <td className="table-dim">{r.employees?.full_name ?? "—"}</td>
                      <td>
                        <KindChip kind={r.kind} />
                      </td>
                      <td>
                        <StatusPill status={r.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </div>
      </div>
    </>
  );
}
