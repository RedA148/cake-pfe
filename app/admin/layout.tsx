import AdminNav from "@/app/admin/AdminNav";
import { signOutAdmin } from "@/app/admin/actions";
import { requireAdminUser } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAdminUser();

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-20 text-gray-900">
      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit rounded-[24px] border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-24">
          <div className="px-4 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">Cake PFE</p>
            <p className="mt-2 text-xl font-bold">Administration</p>
          </div>
          <AdminNav />
          <form action={signOutAdmin} className="mt-3 border-t border-gray-100 pt-3">
            <button type="submit" className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50">
              Déconnexion
            </button>
          </form>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
