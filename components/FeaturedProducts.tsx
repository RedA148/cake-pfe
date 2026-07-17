import Image from "next/image";
import Link from "next/link";

const products = [
  {
    id: 1,
    name: "Royal Wedding Cake",
    price: "À partir de 450 DH",
    image: "/images/products/cake1.jpg",
    badge: "Nouveau",
  },
  {
    id: 2,
    name: "Luxury Birthday Cake",
    price: "À partir de 350 DH",
    image: "/images/products/cake2.jpg",
    badge: "Populaire",
  },
  {
    id: 3,
    name: "Baby Shower Cake",
    price: "À partir de 400 DH",
    image: "/images/products/cake3.jpg",
    badge: "Nouveau",
  },
  {
    id: 4,
    name: "Graduation Cake",
    price: "À partir de 380 DH",
    image: "/images/products/cake4.jpg",
    badge: "Populaire",
  },
  {
    id: 5,
    name: "Valentine Cake",
    price: "À partir de 320 DH",
    image: "/images/products/cake5.jpg",
    badge: "Nouveau",
  },
  {
    id: 6,
    name: "Chocolate Deluxe",
    price: "À partir de 300 DH",
    image: "/images/products/cake6.jpg",
    badge: "Best Seller",
  },
  {
    id: 7,
    name: "Floral Cake",
    price: "À partir de 420 DH",
    image: "/images/products/cake7.jpg",
    badge: "Nouveau",
  },
  {
    id: 8,
    name: "Custom Premium Cake",
    price: "À partir de 500 DH",
    image: "/images/products/cake8.jpg",
    badge: "Premium",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="bg-[#FAFAFA] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Collections premium
          </p>
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Les gâteaux populaires
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Découvrez nos créations les plus appréciées, entièrement personnalisables.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_10px_40px_-20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {product.badge}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <Link href={`/product/${product.id}`} className="block">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {product.name}
                  </h3>
                </Link>
                <p className="mt-2 text-lg font-semibold text-[#D4AF37]">
                  {product.price}
                </p>
                <Link
                  href={`/customize/${product.id}`}
                  className="mt-6 w-full rounded-full bg-[#D4AF37] px-4 py-3 text-center text-sm font-semibold text-white transition duration-300 hover:bg-[#c79c1f]"
                >
                  Personnaliser
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}