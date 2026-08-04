import Link from "next/link";
import {
  CakeSlice,
  Clock3,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

const navigationLinks = [
  { label: "Accueil", href: "/" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Panier", href: "/cart" },
  { label: "Mes commandes", href: "/orders" },
];

const linkClassName =
  "text-sm text-gray-600 transition-colors duration-300 hover:text-[#9a7613]";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#D9AD26]/25 bg-gradient-to-b from-white to-[#FFF9EA] text-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-16 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.7fr_1fr_1fr] lg:gap-12">
          <section aria-labelledby="footer-brand-title">
            <Link
              href="/"
              className="group inline-flex items-center gap-3"
              aria-label="Délices de Bakri — Accueil"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF4D6] text-[#B98A0B] transition group-hover:bg-[#D9AD26] group-hover:text-white">
                <CakeSlice className="h-5 w-5" aria-hidden="true" />
              </span>
              <span id="footer-brand-title" className="text-xl font-bold tracking-tight sm:text-2xl">
                Délices de Bakri
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-gray-600">
              Des gâteaux personnalisés préparés avec passion pour rendre chaque événement unique et gourmand.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Délices de Bakri sur Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D9AD26]/35 bg-white text-[#9a7613] transition hover:-translate-y-0.5 hover:border-[#D9AD26] hover:bg-[#D9AD26] hover:text-white"
              >
                <FaInstagram className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Délices de Bakri sur Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D9AD26]/35 bg-white text-[#9a7613] transition hover:-translate-y-0.5 hover:border-[#D9AD26] hover:bg-[#D9AD26] hover:text-white"
              >
                <FaFacebookF className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </section>

          <section aria-labelledby="footer-navigation-title">
            <h2 id="footer-navigation-title" className="font-semibold text-gray-900">
              Navigation
            </h2>
            <nav className="mt-5 flex flex-col items-start gap-3" aria-label="Navigation du pied de page">
              {navigationLinks.map((link) => (
                <Link key={link.href} href={link.href} className={linkClassName}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          <section aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title" className="font-semibold text-gray-900">
              Contact
            </h2>
            <div className="mt-5 space-y-4 text-sm text-gray-600">
              <a
                href="https://maps.google.com/?q=Rabat%2C%20Maroc"
                target="_blank"
                rel="noreferrer"
                className="group flex items-start gap-3 transition hover:text-[#9a7613]"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#D9AD26]" aria-hidden="true" />
                <span>Rabat, Maroc</span>
              </a>
              <a href="tel:+212600000000" className="group flex items-start gap-3 transition hover:text-[#9a7613]">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#D9AD26]" aria-hidden="true" />
                <span>+212 6 00 00 00 00</span>
              </a>
              <a href="mailto:contact@delicesbakri.ma" className="group flex items-start gap-3 transition hover:text-[#9a7613]">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#D9AD26]" aria-hidden="true" />
                <span className="break-all">contact@delicesbakri.ma</span>
              </a>
            </div>
          </section>

          <section aria-labelledby="footer-hours-title">
            <h2 id="footer-hours-title" className="font-semibold text-gray-900">
              Horaires d’ouverture
            </h2>
            <div className="mt-5 flex items-start gap-3 text-sm leading-6 text-gray-600">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#D9AD26]" aria-hidden="true" />
              <div>
                <p>Lundi – Samedi</p>
                <p className="font-semibold text-gray-800">09:00 – 20:00</p>
                <p className="mt-3">Dimanche</p>
                <p className="font-semibold text-[#9a7613]">Sur commande</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[#D9AD26]/20 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Délices de Bakri. Tous droits réservés.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/confidentialite" className={linkClassName}>
              Confidentialité
            </Link>
            <Link href="/conditions-generales" className={linkClassName}>
              Conditions générales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
