import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#fffdf7_0%,_#fff8e8_45%,_#fafafa_100%)] px-6 py-20 text-gray-900">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-[#F0E4BE] bg-white/90 p-8 shadow-[0_30px_90px_-30px_rgba(212,175,55,0.35)] backdrop-blur sm:p-12 lg:p-16">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(212,175,55,0.08)_0%,transparent_45%,rgba(212,175,55,0.08)_100%)]" />
        <div className="absolute -left-10 top-10 h-36 w-36 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#FFF8E8] px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
            <Sparkles className="h-4 w-4" />
            Erreur 404
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 animate-pulse rounded-full bg-[#D4AF37]/20 blur-3xl" />
            <h1 className="text-7xl font-black leading-none text-[#D4AF37] sm:text-8xl lg:text-[9rem]">
              404
            </h1>
          </div>

          <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
            Cette page n&apos;existe pas.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-600">
            La route que vous recherchez semble avoir disparu dans l&apos;élégance de notre univers sucré.
          </p>

          <Link
            href="/catalogue"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-7 py-3.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#c79c1f]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
