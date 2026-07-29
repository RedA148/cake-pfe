import CustomerList from "@/app/admin/customers/CustomerList";
import { getAdminCustomers } from "@/lib/admin-customer-data";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();
  return (
    <main className="text-gray-900">
      <section className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">Administration</p>
        <h1 className="mt-3 text-4xl font-bold">Clients</h1>
        <p className="mt-3 text-gray-600">Consultez les profils, adresses et historiques de commandes.</p>
      </section>
      <CustomerList customers={customers} />
    </main>
  );
}
