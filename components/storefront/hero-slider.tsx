"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}

const slides: Slide[] = [
  {
    image: "/images/hero-1.jpg",
    title: "Qualità dal 1985",
    subtitle:
      "Scopri la nostra selezione di prodotti di alta qualità, scelti con cura per te.",
    ctaLabel: "Sfoglia il catalogo",
    ctaHref: "/products",
  },
  {
    image: "/images/hero-2.jpg",
    title: "Nuovi arrivi",
    subtitle:
      "Le ultime novità sono arrivate! Scopri i nuovi prodotti appena aggiunti.",
    ctaLabel: "Scopri le novità",
    ctaHref: "/products?sort=created_at&order=desc",
  },
  {
    image: "/images/hero-3.jpg",
    title: "Prenota un appuntamento",
    subtitle:
      "Vieni a trovarci in negozio. Prenota il tuo appuntamento online.",
    ctaLabel: "Prenota ora",
    ctaHref: "/bookings",
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current]!;

  return (
    <section className="relative w-full overflow-hidden bg-neutral-900">
      {/* Slides */}
      <div className="relative h-[400px] sm:h-[500px] lg:h-[600px]">
        {slides.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${s.image})` }}
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60" />
          </div>
        ))}

        {/* Content */}
        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-6xl">
                {slide.title}
              </h1>
              <p className="mt-4 text-base text-neutral-300 sm:text-lg">
                {slide.subtitle}
              </p>
              <Link
                href={slide.ctaHref}
                className="mt-8 inline-flex items-center rounded-full bg-red-700 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-800 transition-colors"
              >
                {slide.ctaLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
        aria-label="Slide precedente"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
        aria-label="Slide successiva"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i === current ? "bg-white" : "bg-white/40"
            }`}
            aria-label={`Vai alla slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
