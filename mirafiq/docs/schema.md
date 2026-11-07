# أسماء الأعمدة — الاتفاق المُلزِم

> هذا الملف هو المرجع. من يريد تغيير اسم عمود يفتح نقاشاً أولاً، ولا يعدّل منفرداً.
> أي تعديل هنا يجب أن يقابله تعديل في `supabase/schema.sql` و `lib/types.ts` معاً.

## القواعد الخمس

1. أسماء الأعمدة إنجليزية و `snake_case` — `full_name` لا `fullName`
2. أسماء الجداول جمع — `employees` لا `employee`
3. كل جدول فيه `id` و `created_at` بلا استثناء
4. المفتاح الأجنبي = اسم الجدول مفرداً + `_id` — `site_id` و `employee_id`
5. القيم العربية تُخزَّن كما هي (جديد / جاري / منتهي) ولا تُترجم

---

## brand_settings
صف واحد فقط في النظام كله (`id = 1`). يقرأه أي زائر، ويعدّله المسجّلون.

| العمود | النوع | إلزامي | الافتراضي |
|--------|-------|:------:|-----------|
| `id` | int | ✔ | 1 |
| `company_name` | text | ✔ | شركة المرافق |
| `logo_url` | text | — | فارغ |
| `logo_letter` | text | ✔ | م |
| `color_primary` | text | ✔ | #0D5C63 |
| `color_secondary` | text | ✔ | #C8781F |
| `radius` | int | ✔ | 10 |
| `font_family` | text | ✔ | IBM Plex Sans Arabic |
| `created_at` | timestamptz | ✔ | now() |

## employees

| العمود | النوع | إلزامي | ملاحظة |
|--------|-------|:------:|--------|
| `id` | uuid | ✔ | تلقائي |
| `full_name` | text | ✔ | |
| `phone` | text | — | |
| `job_title` | text | — | فني تكييف، كهربائي… |
| `is_active` | bool | ✔ | افتراضي true — نعطّل ولا نحذف |
| `created_at` | timestamptz | ✔ | تلقائي |

## sites

| العمود | النوع | إلزامي | ملاحظة |
|--------|-------|:------:|--------|
| `id` | uuid | ✔ | تلقائي |
| `name` | text | ✔ | |
| `client_name` | text | — | الجهة المالكة |
| `is_active` | bool | ✔ | افتراضي true |
| `created_at` | timestamptz | ✔ | تلقائي |

## tasks

| العمود | النوع | إلزامي | ملاحظة |
|--------|-------|:------:|--------|
| `id` | uuid | ✔ | تلقائي |
| `code` | text | — | `WO-2026-0418` — فريد |
| `title` | text | ✔ | |
| `site_id` | uuid | — | → `sites.id` |
| `employee_id` | uuid | — | → `employees.id` |
| `kind` | text | ✔ | وقائية / تصحيحية / طارئة |
| `status` | text | ✔ | جديد / جاري / منتهي — افتراضي «جديد» |
| `created_at` | timestamptz | ✔ | تلقائي |

## profiles
Supabase ينشئ `auth.users` تلقائياً. هذا الجدول يضيف عليه الاسم والدور فقط،
ويُملأ تلقائياً عند إنشاء أي مستخدم (trigger في `schema.sql`).

| العمود | النوع | إلزامي | ملاحظة |
|--------|-------|:------:|--------|
| `id` | uuid | ✔ | → `auth.users.id` |
| `full_name` | text | — | |
| `role` | text | ✔ | admin / supervisor / technician |
| `created_at` | timestamptz | ✔ | تلقائي |
