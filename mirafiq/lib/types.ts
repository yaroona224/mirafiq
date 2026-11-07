/**
 * أنواع البيانات — تطابق أعمدة الجداول في supabase/schema.sql حرفياً.
 * أي تعديل هنا يجب أن يقابله تعديل في schema.sql و docs/schema.md.
 */

export type TaskStatus = "جديد" | "جاري" | "منتهي";
export type TaskKind = "وقائية" | "تصحيحية" | "طارئة";
export type UserRole = "admin" | "supervisor" | "technician";

export const TASK_STATUSES: TaskStatus[] = ["جديد", "جاري", "منتهي"];
export const TASK_KINDS: TaskKind[] = ["وقائية", "تصحيحية", "طارئة"];

export type Brand = {
  id: number;
  company_name: string;
  logo_url: string | null;
  logo_letter: string;
  color_primary: string;
  color_secondary: string;
  radius: number;
  font_family: string;
};

export type Employee = {
  id: string;
  full_name: string;
  phone: string | null;
  job_title: string | null;
  is_active: boolean;
  created_at: string;
};

export type Site = {
  id: string;
  name: string;
  client_name: string | null;
  is_active: boolean;
  created_at: string;
};

export type Task = {
  id: string;
  code: string | null;
  title: string;
  site_id: string | null;
  employee_id: string | null;
  kind: TaskKind;
  status: TaskStatus;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};
