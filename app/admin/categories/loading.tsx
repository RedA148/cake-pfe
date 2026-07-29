export default function AdminCategoriesLoading() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24">
      <section className="mx-auto max-w-7xl animate-pulse px-6 py-16 sm:px-8 lg:px-10">
        <div className="h-4 w-40 rounded bg-[#D4AF37]/20" />
        <div className="mt-5 h-10 w-96 max-w-full rounded bg-gray-200" />
        <div className="mt-10 h-14 rounded-full bg-gray-100" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => <div key={item} className="h-40 rounded-[24px] bg-gray-100" />)}
        </div>
      </section>
    </main>
  );
}
