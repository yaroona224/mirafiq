import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { Card, CardBody } from "@/components/ui";
import { getBrand } from "@/lib/brand-server";

export const metadata = { title: "صفحة غير موجودة" };

/**
 * صفحة 404 بالعربية داخل هوية النظام.
 * بدونها يعرض Next صفحته الإنجليزية الافتراضية في تطبيق عربي بالكامل.
 * getBrand() مخزَّنة، فتبقى هذه الصفحة قابلة للتوليد المسبق.
 */
export default async function NotFound() {
  const brand = await getBrand();

  return (
    <div className="auth-screen">
      <div className="auth-box">
        <div className="auth-brand">
          <BrandMark brand={brand} sub="صفحة غير موجودة" />
        </div>

        <Card>
          <CardBody>
            <p className="page-sub u-mb">
              الصفحة المطلوبة غير موجودة، أو تم نقلها أو حذفها.
            </p>
            <Link className="btn btn--block" href="/tasks">
              العودة إلى المهام
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
