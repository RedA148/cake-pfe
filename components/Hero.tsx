"use client";

import Image from "next/image";
import Link from "next/link";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { buildCatalogueCategoryUrl } from "@/lib/categories";

const slides = [
  {
    src: "/images/hero/hero1.jpg",
    eyebrow: "GÂTEAUX SUR MESURE • DESIGN RAFFINÉ",
    title: "Délices de Bakri",
    description: "Créez un gâteau unique pour chaque occasion. Choisissez votre modèle, personnalisez chaque détail et commandez facilement en ligne.",
    primaryLabel: "Personnaliser maintenant",
    primaryHref: "/catalogue",
    secondaryLabel: "Découvrir",
    secondaryHref: buildCatalogueCategoryUrl("anniversaire"),
  },
  {
    src: "/images/hero/hero2.jpg",
    eyebrow: "SAVEURS AUTHENTIQUES • CRÉATIONS UNIQUES",
    title: "Délices de Bakri",
    description: "Choisissez la saveur, la forme, la taille et les couleurs pour composer un gâteau entièrement adapté à vos envies.",
    primaryLabel: "Créer mon gâteau",
    primaryHref: "/catalogue",
    secondaryLabel: "Voir le catalogue",
    secondaryHref: "/catalogue",
  },
  {
    src: "/images/hero/hero3.jpg",
    eyebrow: "POUR CHAQUE MOMENT • UNE CRÉATION",
    title: "Délices de Bakri",
    description: "Anniversaire, mariage ou événement spécial : découvrez des créations raffinées préparées pour rendre chaque moment inoubliable.",
    primaryLabel: "Commander maintenant",
    primaryHref: "/catalogue",
    secondaryLabel: "Nos créations",
    secondaryHref: buildCatalogueCategoryUrl("mariage"),
  },
] as const;

export default function Hero() {
  return (
    <section className="bg-[#FAFAFA] pt-24 pb-20 sm:pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          loop
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          preventClicks={false}
          preventClicksPropagation={false}
          className="w-full [&_.swiper-pagination]:bottom-5 [&_.swiper-pagination-bullet]:h-2.5 [&_.swiper-pagination-bullet]:w-2.5 [&_.swiper-pagination-bullet]:bg-white/80 [&_.swiper-pagination-bullet-active]:bg-[#D4AF37]"
        >
          {slides.map((slide, index) => (
            <SwiperSlide
              key={slide.src}
              className="pointer-events-none [&.swiper-slide-active]:pointer-events-auto [&.swiper-slide-duplicate-active]:pointer-events-auto"
            >
              <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_25px_80px_-20px_rgba(0,0,0,0.30)]">
                <div className="relative h-[520px] overflow-hidden sm:h-[560px] lg:h-[600px]">
                  <Image
                    src={slide.src}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    sizes="100vw"
                    className="object-cover transition-transform duration-[7000ms] ease-out will-change-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-2xl px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-16">
                      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
                        {slide.eyebrow}
                      </p>
                      <h1 className="sr-only">{slide.title}</h1>
                      <Image
                        src="/images/brand-logo.png"
                        alt="Délices de Bakri"
                        width={1667}
                        height={387}
                        priority={index === 0}
                        className="h-auto w-full max-w-[520px] drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)]"
                      />
                      <p className="mt-6 max-w-xl text-base leading-8 text-white/90 sm:text-lg">
                        {slide.description}
                      </p>
                      <div className="swiper-no-swiping relative z-10 mt-8 flex flex-wrap gap-4">
                        <Link
                          href={slide.primaryHref}
                          className="rounded-full bg-[#D4AF37] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-[#c79c1f]"
                        >
                          {slide.primaryLabel}
                        </Link>
                        <Link
                          href={slide.secondaryHref}
                          className="rounded-full border border-white/80 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition duration-300 hover:bg-white/20"
                        >
                          {slide.secondaryLabel}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
