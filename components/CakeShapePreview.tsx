import type { CSSProperties, ReactNode } from "react";
import { getShapeCode } from "@/lib/cake-options";
import ProductImage from "@/components/ProductImage";

type CakeShapePreviewProps = {
  shapeName: string | null | undefined;
  color: string;
  imageUrl?: string | null;
  imageAlt?: string;
  children?: ReactNode;
};

const starClipPath = "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)";
const pentagonClipPath = "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)";
const rhombusClipPath = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
const heartMask = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='black' d='M50 93C44 86 8 63 8 35C8 18 20 7 35 7C43 7 49 12 50 21C51 12 57 7 65 7C80 7 92 18 92 35C92 63 56 86 50 93Z'/%3E%3C/svg%3E")`;

export default function CakeShapePreview({
  shapeName,
  color,
  imageUrl,
  imageAlt = "Aperçu du gâteau personnalisé",
  children,
}: CakeShapePreviewProps) {
  if (imageUrl) {
    return (
      <div
        className="relative aspect-[4/3] w-full max-w-[420px] overflow-hidden rounded-[28px] border border-[#D4AF37]/20 bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)]"
        aria-label={imageAlt}
      >
        <ProductImage
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, 420px"
          className="object-cover"
          unoptimized={imageUrl.startsWith("data:") || imageUrl.startsWith("blob:")}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/10" />
      </div>
    );
  }

  const shape = getShapeCode(shapeName ?? "");
  const shapeClass = shape === "round"
    ? "aspect-square max-w-[320px] rounded-full"
    : shape === "rectangle"
      ? "aspect-[4/3] max-w-[360px] rounded-[24px]"
      : shape === "heart" || shape === "star" || shape === "pentagon" || shape === "rhombus"
        ? "aspect-square max-w-[300px]"
        : "aspect-square max-w-[320px] rounded-[24px]";
  const previewStyle: CSSProperties = {
    backgroundColor: color,
    clipPath: shape === "star"
      ? starClipPath
      : shape === "pentagon"
        ? pentagonClipPath
        : shape === "rhombus"
          ? rhombusClipPath
          : undefined,
  };

  if (shape === "heart") {
    previewStyle.maskImage = heartMask;
    previewStyle.maskPosition = "center";
    previewStyle.maskRepeat = "no-repeat";
    previewStyle.maskSize = "contain";
    previewStyle.WebkitMaskImage = heartMask;
    previewStyle.WebkitMaskPosition = "center";
    previewStyle.WebkitMaskRepeat = "no-repeat";
    previewStyle.WebkitMaskSize = "contain";
  }

  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden border border-[#D4AF37]/30 bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] transition-[border-radius,clip-path,aspect-ratio] duration-300 ${shapeClass}`}
      style={previewStyle}
      aria-label={shapeName ? `Aperçu en forme ${shapeName}` : "Aperçu du gâteau"}
    >
      <div className="relative z-20 flex items-center justify-center px-8 text-center">{children}</div>
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-white/20 via-transparent to-black/10" />
    </div>
  );
}
