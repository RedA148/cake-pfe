"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Home, Minus, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export interface CartItem {
  productId: number;
  productName: string;
  productImage: string;
  category?: string;
  shape: string;
  size: string;
  flavor: string;
  color: string;
  customText: string;
  instructions: string;
  uploadedImage: string | null;
  quantity: number;
  totalPrice: number;
  unitPrice: number;
}

const relatedProducts = [
  {
    id: 2,
    name: "Golden Birthday Cake",
    price: "320 DH",
    image: "/images/products/cake2.jpg",
  },
  {
    id: 3,
    name: "Baby Blossom Cake",
    price: "280 DH",
    image: "/images/products/cake3.jpg",
  },
  {
    id: 4,
    name: "Luxury Graduation Cake",
    price: "360 DH",
    image: "/images/products/cake4.jpg",
  },
  {
    id: 5,
    name: "Velvet Love Cake",
    price: "300 DH",
    image: "/images/products/cake5.jpg",
  },
];

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error("Error loading cart:", e);
      }
    }
  }, []);

  const handleUpdateQuantity = (index: number, newQty: number) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQty;
    updatedCart[index].totalPrice = newQty * updatedCart[index].unitPrice;
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleRemoveItem = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = Math.round(subtotal * 0.2);
  const shipping = 0;
  const total = subtotal + tax + shipping;

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement du panier...</p>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
        <section className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 text-center sm:px-8 lg:px-10">
          <div className="rounded-full border border-[#D4AF37]/30 bg-[#FFF8E8] p-8 shadow-[0_20px_60px_-25px_rgba(212,175,55,0.45)]">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border border-[#D4AF37]/30 bg-white shadow-inner">
              <div className="text-6xl text-[#D4AF37]">🍰</div>
            </div>
          </div>

          <h1 className="mt-8 text-4xl font-semibold text-gray-900 sm:text-5xl">
            Votre panier est vide
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            Ajoutez votre premier gâteau personnalisé et laissez-nous le sublimer.
          </p>

          <Link
            href="/catalogue"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-7 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#c79c1f]"
          >
            Découvrir le catalogue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="flex items-center gap-1 transition hover:text-[#D4AF37]">
            <Home className="h-4 w-4" />
            Accueil
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-900">Panier</span>
        </div>

        <div className="mt-8 mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Votre commande
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">Mon Panier</h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Vérifiez votre commande avant de passer au paiement.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            {cart.map((item, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_-25px_rgba(0,0,0,0.35)] sm:p-7"
              >
                <div className="flex flex-col gap-6 lg:flex-row">
                  <div className="relative h-72 w-full overflow-hidden rounded-[24px] lg:w-72">
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      fill
                      sizes="(max-width: 1024px) 100vw, 288px"
                      className="object-cover transition duration-500 hover:scale-105"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF8E8] px-3 py-1 text-sm font-semibold text-[#D4AF37]">
                          <Sparkles className="h-4 w-4" />
                          {item.category || "Personnalisé"}
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                          {item.productName}
                        </h2>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="rounded-full border border-gray-200 p-3 text-gray-500 transition hover:border-[#D4AF37] hover:bg-[#FFF8E8] hover:text-[#D4AF37]"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="mt-6 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                      <div className="rounded-[16px] border border-gray-200 bg-[#FAFAFA] p-3">
                        <span className="block text-[11px] uppercase tracking-[0.25em] text-gray-400">Forme</span>
                        <span className="mt-1 block font-semibold text-gray-900">{item.shape}</span>
                      </div>
                      <div className="rounded-[16px] border border-gray-200 bg-[#FAFAFA] p-3">
                        <span className="block text-[11px] uppercase tracking-[0.25em] text-gray-400">Taille</span>
                        <span className="mt-1 block font-semibold text-gray-900">{item.size}</span>
                      </div>
                      <div className="rounded-[16px] border border-gray-200 bg-[#FAFAFA] p-3">
                        <span className="block text-[11px] uppercase tracking-[0.25em] text-gray-400">Saveur</span>
                        <span className="mt-1 block font-semibold text-gray-900">{item.flavor}</span>
                      </div>
                      <div className="rounded-[16px] border border-gray-200 bg-[#FAFAFA] p-3">
                        <span className="block text-[11px] uppercase tracking-[0.25em] text-gray-400">Couleur</span>
                        <span className="mt-1 block font-semibold text-gray-900">{item.color}</span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      {item.customText && (
                        <div className="rounded-[16px] border border-gray-200 bg-[#FFF8E8] px-4 py-3 text-sm text-gray-700">
                          <span className="font-semibold text-gray-900">Texte personnalisé :</span> {item.customText}
                        </div>
                      )}
                      {item.uploadedImage && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-white px-3 py-2 text-sm font-medium text-[#D4AF37]">
                          <BadgeCheck className="h-4 w-4" />
                          Image uploadée
                        </div>
                      )}
                    </div>

                    {item.instructions && (
                      <div className="mt-3 rounded-[16px] border border-gray-200 bg-[#FAFAFA] p-3 text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">Instructions spéciales :</span> {item.instructions}
                      </div>
                    )}

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6">
                      <div className="flex items-center rounded-full border border-gray-200 bg-white px-3 py-2 shadow-sm">
                        <button
                          onClick={() => handleUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                          className="rounded-full p-2 text-[#D4AF37] transition hover:bg-[#FFF8E8]"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-10 text-center text-base font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                          className="rounded-full p-2 text-[#D4AF37] transition hover:bg-[#FFF8E8]"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">Prix unitaire</p>
                        <p className="text-lg font-semibold text-gray-900">{item.unitPrice} DH</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.2)]">
              <h3 className="text-2xl font-semibold text-gray-900">Résumé de commande</h3>

              <div className="mt-6 space-y-4 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Sous-total</span>
                  <span className="font-semibold text-gray-900">{subtotal} DH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Livraison</span>
                  <span className="font-semibold text-[#D4AF37]">Gratuite</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>TVA</span>
                  <span className="font-semibold text-gray-900">{tax} DH</span>
                </div>
                <div className="border-t border-gray-200 pt-4" />
                <div className="flex items-center justify-between text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{total} DH</span>
                </div>
              </div>

              <div className="mt-6 rounded-[16px] border border-gray-200 bg-[#FAFAFA] p-4">
                <label className="text-sm font-medium text-gray-700" htmlFor="coupon">
                  Code promo
                </label>
                <div className="mt-3 flex gap-2">
                  <input
                    id="coupon"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Votre code"
                    className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none ring-0 placeholder:text-gray-400"
                  />
                  <button className="rounded-full bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c79c1f]">
                    Appliquer
                  </button>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Link
                  href="/checkout"
                  className="flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-5 py-3.5 text-sm font-semibold text-white transition duration-300 hover:bg-[#c79c1f]"
                >
                  Passer la commande
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/catalogue"
                  className="flex items-center justify-center rounded-full border border-[#D4AF37] px-5 py-3.5 text-sm font-semibold text-[#D4AF37] transition duration-300 hover:bg-[#FFF8E8]"
                >
                  Continuer les achats
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-semibold text-gray-900">Vous pourriez aussi aimer</h3>
            <Link href="/catalogue" className="text-sm font-semibold text-[#D4AF37] hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((product) => (
              <div
                key={product.id}
                className="group overflow-hidden rounded-[24px] border border-gray-200 bg-white shadow-[0_10px_35px_-20px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                    Premium
                  </span>
                </div>
                <div className="p-5">
                  <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
                  <p className="mt-2 text-sm font-semibold text-[#D4AF37]">À partir de {product.price}</p>
                  <Link
                    href={`/customize/${product.id}`}
                    className="mt-5 block w-full text-center rounded-full border border-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#D4AF37] transition duration-300 hover:bg-[#FFF8E8]"
                  >
                    Ajouter au panier
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
