"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import {
  getProductImageSource,
  isSupabaseStorageUrl,
  PRODUCT_IMAGE_FALLBACK,
} from "@/lib/product-image";

type ProductImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string | null | undefined;
};

export default function ProductImage({ src, unoptimized, alt, ...props }: ProductImageProps) {
  const requestedSource = getProductImageSource(src);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const imageSource = failedSource === requestedSource
    ? PRODUCT_IMAGE_FALLBACK
    : requestedSource;

  return (
    <Image
      {...props}
      alt={alt}
      src={imageSource}
      unoptimized={unoptimized || isSupabaseStorageUrl(imageSource)}
      onError={() => setFailedSource(requestedSource)}
    />
  );
}
