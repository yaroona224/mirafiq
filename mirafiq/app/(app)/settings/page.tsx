import { getBrand } from "@/lib/brand-server";
import { AppearanceSettings } from "./AppearanceSettings";

export default async function SettingsPage() {
  const brand = await getBrand();
  return <AppearanceSettings brand={brand} />;
}
