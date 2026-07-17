"use client";

import Image from "next/image";
import { Circle, Heart, Ruler, Sparkles, Square, Upload } from "lucide-react";
import { ChangeEvent, useMemo, useState } from "react";

const shapeOptions = [
  { id: "round", label: "Rond", icon: Circle },
  { id: "square", label: "Carré", icon: Square },
  { id: "heart", label: "Cœur", icon: Heart },
];

const sizeOptions = [
  { id: "1", label: "1 KG", price: 0 },
  { id: "2", label: "2 KG", price: 120 },
  { id: "3", label: "3 KG", price: 250 },
  { id: "4", label: "4 KG", price: 420 },
];

const flavorOptions = ["Vanille", "Chocolat", "Red Velvet", "Pistache", "Citron"];
const colorOptions = [
  { name: "White", value: "#fff" },
  { name: "Gold", value: "#D4AF37" },
  { name: "Pink", value: "#F4A7B9" },
  { name: "Blue", value: "#5DADE2" },
  { name: "Black", value: "#111" },
  { name: "Red", value: "#C0392B" },
];

const basePrice = 350;

export default function CustomizePage() {
  const [shape, setShape] = useState("round");
  const [size, setSize] = useState("2");
  const [flavor, setFlavor] = useState("Vanille");
  const [color, setColor] = useState("#D4AF37");
  const [text, setText] = useState("");
  const [instructions, setInstructions] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const selectedSize = sizeOptions.find((option) => option.id === size) ?? sizeOptions[0];
  const totalPrice = basePrice + selectedSize.price;

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const previewShape = useMemo(() => {
    if (shape === "heart") return "rounded-[40px]";
    if (shape === "square") return "rounded-[24px]";
    return "rounded-full";
  }, [shape]);

  return (
    <main className="min-h-screen bg-[#FAFAFA] pt-24 text-gray-900">
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
            Création sur mesure
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Personnalisez votre gâteau
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Choisissez chaque détail pour créer un gâteau unique.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            {/* relative */}
          <div className="rounded-[28px] relative border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                  Aperçu en direct
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">Votre création</h2>
              </div>
              <div className="rounded-full border border-[#D4AF37] px-3 py-1 text-sm font-semibold text-[#D4AF37]">
                {selectedSize.label}
              </div>
            </div>
            {/* stickey image */}
            <div className="rounded-[32px] sticky top-4 border border-gray-200 bg-[#FFF8E8] p-6 sm:p-8">
              <div className="mx-auto flex max-w-[420px] items-center justify-center">
                <div
                  className={`relative flex aspect-square w-full max-w-[320px] items-center justify-center overflow-hidden border border-[#D4AF37]/30 bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] ${previewShape}`}
                  style={{ backgroundColor: color }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10" />
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Uploaded preview"
                      fill
                      sizes="320px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-center text-sm font-medium text-gray-700">
                      <Sparkles className="mx-auto mb-2 h-8 w-8 text-[#D4AF37]" />
                      <p>Votre gâteau prendra forme ici</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-gray-200 bg-white p-4 text-center shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                  Sélection actuelle
                </p>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {flavor} • {shapeOptions.find((option) => option.id === shape)?.label}
                </p>
                {text ? (
                  <p className="mt-2 text-sm text-gray-600">Texte: “{text}”</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">1. Forme</h2>
                <p className="mt-1 text-sm text-gray-500">Choisissez la silhouette de votre gâteau</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {shapeOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = option.id === shape;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setShape(option.id)}
                      className={`rounded-[20px] border p-4 text-center transition duration-300 ${
                        isActive
                          ? "border-[#D4AF37] bg-[#FFF8E8] text-[#D4AF37] shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#D4AF37]"
                      }`}
                    >
                      <Icon className="mx-auto h-6 w-6" />
                      <p className="mt-2 text-sm font-semibold">{option.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">2. Taille</h2>
                <p className="mt-1 text-sm text-gray-500">Sélectionnez la taille idéale</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {sizeOptions.map((option) => {
                  const isActive = option.id === size;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSize(option.id)}
                      className={`rounded-[20px] border p-4 text-left transition duration-300 ${
                        isActive
                          ? "border-[#D4AF37] bg-[#FFF8E8] text-[#D4AF37] shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#D4AF37]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Ruler className="h-5 w-5" />
                        <span className="font-semibold">{option.label}</span>
                      </div>
                      <p className="mt-2 text-sm">
                        +{option.price} DH
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">3. Saveur</h2>
                <p className="mt-1 text-sm text-gray-500">Choisissez les arômes de votre gâteau</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {flavorOptions.map((option) => {
                  const isActive = option === flavor;
                  return (
                    <button
                      key={option}
                      onClick={() => setFlavor(option)}
                      className={`rounded-[20px] border p-3 text-sm font-semibold transition duration-300 ${
                        isActive
                          ? "border-[#D4AF37] bg-[#FFF8E8] text-[#D4AF37]"
                          : "border-gray-200 bg-white text-gray-700 hover:border-[#D4AF37]"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">4. Couleur</h2>
                <p className="mt-1 text-sm text-gray-500">Personnalisez la teinte principale</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {colorOptions.map((option) => {
                  const isActive = option.value === color;
                  return (
                    <button
                      key={option.name}
                      onClick={() => setColor(option.value)}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition ${
                        isActive ? "border-[#D4AF37] scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: option.value }}
                      title={option.name}
                    />
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">5. Texte du gâteau</h2>
              </div>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Votre texte..."
                className="w-full rounded-full border border-gray-200 bg-[#FAFAFA] px-4 py-3 text-sm outline-none ring-0 focus:border-[#D4AF37]"
              />
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">6. Ajouter une image</h2>
                <p className="mt-1 text-sm text-gray-500">Téléchargez une photo pour votre design</p>
              </div>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-[#D4AF37] bg-[#FFF8E8] px-6 py-10 text-center transition hover:bg-[#fff3d8]">
                <Upload className="h-8 w-8 text-[#D4AF37]" />
                <span className="mt-3 text-sm font-semibold text-[#D4AF37]">Cliquer pour télécharger</span>
                <span className="mt-1 text-sm text-gray-600">PNG, JPG, WEBP</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)] sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-gray-900">7. Instructions spéciales</h2>
              </div>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                placeholder="Ajoutez vos détails spéciaux..."
                className="w-full rounded-[20px] border border-gray-200 bg-[#FAFAFA] px-4 py-3 text-sm outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.18)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#D4AF37]">
                    Résumé
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">Votre commande</h3>
                </div>
                <div className="rounded-full bg-[#FFF8E8] px-3 py-1 text-sm font-semibold text-[#D4AF37]">
                  {selectedSize.label}
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Prix de base</span>
                  <span className="font-semibold text-gray-900">350 DH</span>
                </div>
                <div className="flex justify-between">
                  <span>Options sélectionnées</span>
                  <span className="font-semibold text-gray-900">{selectedSize.label} • {flavor}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
                  <span>Total</span>
                  <span className="text-[#D4AF37]">{totalPrice} DH</span>
                </div>
              </div>

              <button className="mt-6 w-full rounded-full bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-white transition duration-300 hover:bg-[#c79c1f]">
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
