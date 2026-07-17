import Image from "next/image";
import Link from "next/link";
import { CakeSlice, Gift, Heart, Sparkles, Star } from "lucide-react";
import { buildCatalogueCategoryUrl, CAKE_CATEGORIES } from "@/lib/categories";

const categoryDetails = {
  Anniversaire: {
    image: "/images/categories/birthday1.jpg",
    description: "Des gâteaux élégants pour des moments inoubliables.",
    icon: CakeSlice,
  },
  Mariage: {
    image: "/images/categories/wedding1.jpg",
    description: "Une touche de raffinement pour votre journée unique.",
    icon: Heart,
  },
  "Baby Shower": {
    image: "/images/categories/baby1.jpg",
    description: "Des créations tendres et délicates pour la petite surprise.",
    icon: Gift,
  },
  Graduation: {
    image: "/images/categories/graduation1.jpg",
    description: "Un design chic pour célébrer une réussite.",
    icon: Star,
  },
  "Saint-Valentin": {
    image: "/images/categories/valentine1.jpg",
    description: "Des saveurs romantiques pour une fête pleine d'amour.",
    icon: Sparkles,
  },
} as const;

export default function Categories() {
  const categories = CAKE_CATEGORIES.map((category) => ({
    ...category,
    ...categoryDetails[category.label as keyof typeof categoryDetails],
  }));

  return (
    <section className="bg-[#FAFAFA] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Collections premium
          </p>
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Nos Catégories
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Découvrez nos collections de gâteaux pour chaque occasion.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <div
                key={category.slug}
                className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_10px_40px_-20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.label}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                    Premium
                  </div>
                  <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 translate-y-1/2 items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37] bg-white shadow-lg">
                      <Icon className="h-6 w-6 text-[#D4AF37]" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col items-center px-5 pb-6 pt-10 text-center">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {category.label}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    {category.description}
                  </p>
                  <Link
                    href={buildCatalogueCategoryUrl(category.slug)}
                    className="mt-6 w-full rounded-full bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#c79c1f]"
                  >
                    Découvrir
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
