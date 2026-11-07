-- ============================================================================
--  مخطّط قاعدة البيانات — نظام تشغيل المرافق
--  المرحلة الأولى (التأسيس)
--
--  كيف تُشغّله:
--    Supabase Dashboard  >  SQL Editor  >  New query  >  الصق هذا الملف  >  Run
--
--  آمن للتشغيل أكثر من مرة.
-- ============================================================================


-- ============================================================================
--  1) الجداول
-- ============================================================================

-- ---------------------------------------------------------------- الهوية ----
-- صف واحد فقط في النظام كله (id = 1). يقرأه كل مستخدم، ويعدّله المسجّلون.
create table if not exists public.brand_settings (
  id              int         primary key default 1,
  company_name    text        not null default 'شركة المرافق',
  logo_url        text,
  logo_letter     text        not null default 'م',
  color_primary   text        not null default '#0D5C63',
  color_secondary text        not null default '#C8781F',
  radius          int         not null default 10,
  font_family     text        not null default 'IBM Plex Sans Arabic',
  created_at      timestamptz not null default now(),
  constraint brand_settings_single_row check (id = 1),
  constraint brand_settings_radius_range check (radius between 0 and 32)
);

insert into public.brand_settings (id)
values (1)
on conflict (id) do nothing;


-- ------------------------------------------------------------ الموظفون ----
create table if not exists public.employees (
  id         uuid        primary key default gen_random_uuid(),
  full_name  text        not null,
  phone      text,
  job_title  text,
  is_active  boolean     not null default true,
  created_at timestamptz not null default now()
);

create index if not exists employees_active_idx on public.employees (is_active);


-- -------------------------------------------------------------- المواقع ----
create table if not exists public.sites (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  client_name text,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists sites_active_idx on public.sites (is_active);


-- --------------------------------------------------------------- المهام ----
create table if not exists public.tasks (
  id          uuid        primary key default gen_random_uuid(),
  code        text        unique,
  title       text        not null,
  site_id     uuid        references public.sites(id)     on delete set null,
  employee_id uuid        references public.employees(id) on delete set null,
  kind        text        not null default 'وقائية',
  status      text        not null default 'جديد',
  created_at  timestamptz not null default now(),
  constraint tasks_kind_check   check (kind   in ('وقائية', 'تصحيحية', 'طارئة')),
  constraint tasks_status_check check (status in ('جديد', 'جاري', 'منتهي'))
);

create index if not exists tasks_status_idx   on public.tasks (status);
create index if not exists tasks_site_idx     on public.tasks (site_id);
create index if not exists tasks_employee_idx on public.tasks (employee_id);


-- --------------------------------------------------------- المستخدمون ----
-- Supabase ينشئ auth.users تلقائياً. هذا الجدول يضيف عليه الاسم والدور فقط.
create table if not exists public.profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       text        not null default 'technician',
  created_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('admin', 'supervisor', 'technician'))
);


-- ============================================================================
--  2) إنشاء ملف تعريف تلقائياً لكل مستخدم جديد
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ============================================================================
--  3) RLS — حماية الصفوف
--
--  ⚠️  مهم: بدون تفعيل RLS وإضافة سياسات، ستعود كل الاستعلامات فارغة
--      بلا رسالة خطأ. هذا أشهر سبب لظنّ المبتدئ أن الكود معطوب.
--
--  سياسات المرحلة الأولى مبسّطة: أي مستخدم مسجّل دخول له كل الصلاحيات.
--  تُشدَّد في المرحلة الثانية مع الأدوار.
-- ============================================================================

alter table public.brand_settings enable row level security;
alter table public.employees      enable row level security;
alter table public.sites          enable row level security;
alter table public.tasks          enable row level security;
alter table public.profiles       enable row level security;

-- الهوية: يقرأها الجميع (شاشة الدخول تحتاجها قبل تسجيل الدخول).
drop policy if exists brand_read_all      on public.brand_settings;
drop policy if exists brand_write_authed  on public.brand_settings;

create policy brand_read_all on public.brand_settings
  for select to anon, authenticated using (true);

create policy brand_write_authed on public.brand_settings
  for update to authenticated using (true) with check (true);

-- بقيّة الجداول: للمسجّلين فقط.
drop policy if exists employees_all on public.employees;
create policy employees_all on public.employees
  for all to authenticated using (true) with check (true);

drop policy if exists sites_all on public.sites;
create policy sites_all on public.sites
  for all to authenticated using (true) with check (true);

drop policy if exists tasks_all on public.tasks;
create policy tasks_all on public.tasks
  for all to authenticated using (true) with check (true);

drop policy if exists profiles_read  on public.profiles;
drop policy if exists profiles_write on public.profiles;

create policy profiles_read on public.profiles
  for select to authenticated using (true);

create policy profiles_write on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);


-- ============================================================================
--  تم. تحقّق: Table Editor يجب أن يُظهر 5 جداول،
--  و brand_settings فيه صف واحد.
-- ============================================================================
