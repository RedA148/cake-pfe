"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import { buildCatalogueCategoryUrl, CAKE_CATEGORIES, type CategorySlug } from "@/lib/categories";

const heroImages: Record<(typeof CAKE_CATEGORIES)[number]["slug"], string> = {
  anniversaire: "/images/hero/hero1.jpg",
  mariage: "/images/hero/hero2.jpg",
  "baby-shower": "/images/hero/hero3.jpg",
  graduation: "/images/hero/hero1.jpg",
  "saint-valentin": "/images/hero/hero2.jpg",
};

const subtitle =
  "Créez un gâteau unique pour chaque occasion. Choisissez votre modèle, personnalisez chaque détail et commandez facilement en ligne.";

const slides = CAKE_CATEGORIES.map((category) => ({
  src: heroImages[category.slug],
  title: "Délices de Bakri",
  subtitle,
  category: category.slug,
  label: category.label,
}));

export default function Hero() {
  const [activeCategory, setActiveCategory] = useState<CategorySlug>("anniversaire");

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveCategory(slides[swiper.realIndex].category);
  };

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
          onSwiper={handleSlideChange}
          onSlideChange={handleSlideChange}
          className="w-full [&_.swiper-pagination]:bottom-5 [&_.swiper-pagination-bullet]:h-2.5 [&_.swiper-pagination-bullet]:w-2.5 [&_.swiper-pagination-bullet]:bg-white/80 [&_.swiper-pagination-bullet-active]:bg-[#D4AF37]"
        >
          {slides.map((slide) => (
            <SwiperSlide
              key={slide.category}
              className="pointer-events-none [&.swiper-slide-active]:pointer-events-auto [&.swiper-slide-duplicate-active]:pointer-events-auto"
            >
              <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_25px_80px_-20px_rgba(0,0,0,0.30)]">
                <div className="relative h-[520px] overflow-hidden sm:h-[560px] lg:h-[600px]">
                  <Image
                    src={slide.src}
                    alt={slide.title}
                    fill
                    priority={slide.category === "anniversaire"}
                    sizes="100vw"
                    className="object-cover transition-transform duration-[7000ms] ease-out will-change-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute inset-0 flex items-center">
                    <div className="max-w-2xl px-6 py-10 text-white sm:px-10 lg:px-14 lg:py-16">
                      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
                        Custom cakes • Luxury design
                      </p>
                      <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                        {slide.title}
                      </h1>
                      <p className="mt-6 max-w-xl text-base leading-8 text-white/90 sm:text-lg">
                        {slide.subtitle}
                      </p>
                      <div className="swiper-no-swiping relative z-10 mt-8 flex flex-wrap gap-4">
                        <Link
                          href="/customize/1"
                          className="rounded-full bg-[#D4AF37] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-[#c79c1f]"
                        >
                          Personnaliser maintenant
                        </Link>
                        <Link
                          href={buildCatalogueCategoryUrl(activeCategory)}
                          className="rounded-full border border-white/80 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition duration-300 hover:bg-white/20"
                        >
                          Découvrir
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
