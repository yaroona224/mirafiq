"use server";

import { updateTag } from "next/cache";
import { BRAND_TAG } from "@/lib/brand-server";

/**
 * يُبطل نسخة الهوية المخزَّنة بعد الحفظ، فيرى المستخدم تغييره فوراً.
 * بدونه يبقى getBrand() يرجع القيمة القديمة لأنها مخزَّنة بوسم BRAND_TAG.
 */
export async function refreshBrand() {
  updateTag(BRAND_TAG);
}
