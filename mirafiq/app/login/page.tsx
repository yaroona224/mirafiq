import { getBrand } from "@/lib/brand-server";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const brand = await getBrand();
  return <LoginForm brand={brand} />;
}
