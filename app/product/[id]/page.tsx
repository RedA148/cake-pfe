"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Star } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

const product = {
  id: 1,
  name: "Royal Wedding Cake",
  category: "Mariage",
  price: "À partir de 350 DH",
  description:
    "Un gâteau de mariage raffiné, conçu avec des finitions élégantes et des saveurs délicates pour une célébration inoubliable.",
  features: [
    "Handmade",
    "Premium ingredients",
    "Fully customizable",
    "Fast delivery",
  ],
  images: [
    "/images/products/cake1.jpg",
    "/images/products/cake2.jpg",
    "/images/products/cake3.jpg",
    "/images/products/cake4.jpg",
  ],
};

const relatedProducts = [
  {
    id: 2,
    name: "Luxury Birthday Cake",
    price: "À partir de 320 DH",
    image: "/images/products/cake2.jpg",
  },
  {
    id: 3,
    name: "Baby Shower Cake",
    price: "À partir de 280 DH",
    image: "/images/products/cake3.jpg",
  },
  {
    id: 4,
    name: "Graduation Celebration",
    price: "À partir de 300 DH",
    image: "/images/products/cake4.jpg",
  },
  {
    id: 5,
    name: "Valentine Dream Cake",
    price: "À partir de 260 DH",
    image: "/images/products/cake5.jpg",
  },
];

export default function ProductPage() {
  const params = useParams<{ id?: string }>();
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const customizeHref = params?.id ? `/customize/${params.id}` : "/customize";

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)]">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {product.images.map((image) => {
                const isActive = image === selectedImage;
                return (
                  <button
                    key={image}
                    onClick={() => setSelectedImage(image)}
                    className={`overflow-hidden rounded-[20px] border transition duration-300 ${
                      isActive ? "border-[#D4AF37] shadow-md" : "border-gray-200"
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={image}
                        alt="Thumbnail"
                        fill
                        sizes="80px"
                        className="object-cover transition duration-300 hover:scale-105"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit rounded-full bg-[#D4AF37] px-3 py-1 text-sm font-semibold uppercase tracking-wide text-white">
              {product.category}
            </div>
            <h1 className="mt-5 text-4xl font-bold text-gray-900 sm:text-5xl">
              {product.name}
            </h1>
            <div className="mt-3 flex items-center gap-2 text-[#D4AF37]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 fill-current" />
              ))}
              <span className="ml-2 text-sm font-medium text-gray-600">4.9 • 128 avis</span>
            </div>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {product.description}
            </p>

            <div className="mt-6 rounded-[20px] border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                Prix de départ
              </p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {product.price}
              </p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Caractéristiques</h2>
              <ul className="mt-3 space-y-2 text-gray-700">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-[#D4AF37]">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="rounded-full p-2 text-[#D4AF37] transition hover:bg-[#FFF8E8]"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-10 text-center text-base font-semibold text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="rounded-full p-2 text-[#D4AF37] transition hover:bg-[#FFF8E8]"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Link
                href={customizeHref}
                className="rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#c79c1f]"
              >
                Personnaliser
              </Link>
              <Link
                href="/cart"
                className="rounded-full border border-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#D4AF37] transition duration-300 hover:bg-[#FFF8E8]"
              >
                Ajouter au panier
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-[28px] border border-gray-200 bg-white p-8 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">Description du produit</h2>
          </div>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Chaque gâteau est confectionné à la main avec des finitions élégantes, des saveurs délicates et une personnalisation complète pour sublimer vos événements les plus marquants.
          </p>
        </div>

        <div className="mt-16 rounded-[28px] border border-gray-200 bg-white p-8 shadow-[0_15px_50px_-20px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">Avis clients</h2>
            <div className="flex items-center gap-2 text-[#D4AF37]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 fill-current" />
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-[20px] border border-gray-200 bg-[#FAFAFA] p-5">
            <p className="text-gray-700">
              “Un gâteau absolument magnifique, parfaitement personnalisé et livré avec élégance. Une expérience vraiment premium.”
            </p>
            <p className="mt-3 font-semibold text-gray-900">— Sarah M.</p>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Produits similaires</h2>
            <Link href="/catalogue" className="text-sm font-semibold text-[#D4AF37] hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_10px_35px_-20px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-[#D4AF37]">{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
