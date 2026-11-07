import { getBrand } from "@/lib/brand-server";
import { BrandEditor } from "./BrandEditor";

export default async function BrandPage() {
  const brand = await getBrand();
  return <BrandEditor initial={brand} />;
}
