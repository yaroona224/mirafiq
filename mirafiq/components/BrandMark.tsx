import type { Brand } from "@/lib/types";

/** الشعار واسم الشركة. يقرأ من brand_settings — لا شيء مكتوب هنا. */
export function BrandMark({ brand, sub }: { brand: Brand; sub?: string }) {
  return (
    <div className="mark">
      <div className="mark-badge">
        {brand.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logo_url} alt={brand.company_name} />
        ) : (
          brand.logo_letter
        )}
      </div>
      <div>
        <div className="mark-name">{brand.company_name}</div>
        <div className="mark-sub">{sub ?? "تشغيل وصيانة"}</div>
      </div>
    </div>
  );
}
