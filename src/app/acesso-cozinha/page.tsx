import { redirect } from "next/navigation";
import { OwnerLoginForm } from "@/components/cozinha/owner-login-form";
import { isOwnerAuthenticated } from "@/lib/auth";
import { getResolvedStoreConfig } from "@/lib/white-label";

export default async function AcessoCozinhaPage() {
  const isAuthenticated = await isOwnerAuthenticated();
  const store = await getResolvedStoreConfig();

  if (isAuthenticated) {
    redirect("/cozinha");
  }

  return (
    <main className="container-shell py-10 pb-16">
      <OwnerLoginForm
        logoPath={store.logoPath}
        logoText={store.logoText}
        storeName={store.name}
      />
    </main>
  );
}
