export type SizeOption = {
  id: number;
  name: string;
  price: number | string;
};

export type CakeSize = SizeOption & {
  is_active?: boolean;
};

export type ShapeOption = {
  id: number;
  name: string;
};

export type CakeShape = ShapeOption & {
  is_active?: boolean;
};

export type FlavorOption = {
  id: number;
  name: string;
};

export type CakeFlavor = FlavorOption & {
  is_active?: boolean;
};

export type ColorOption = {
  id: number;
  name: string;
  hex_color: string;
};

export type CakeColor = ColorOption & {
  is_active?: boolean;
};

export type CakeOptions = {
  sizes: CakeSize[];
  shapes: CakeShape[];
  flavors: CakeFlavor[];
  colors: CakeColor[];
};

export type OptionKind = keyof CakeOptions;
export type CakeOption = CakeSize | CakeShape | CakeFlavor | CakeColor;

const knownColors: Record<string, string> = {
  blanc: "#FFFFFF",
  white: "#FFFFFF",
  or: "#D4AF37",
  gold: "#D4AF37",
  rose: "#F4A7B9",
  pink: "#F4A7B9",
  bleu: "#5DADE2",
  blue: "#5DADE2",
  noir: "#111111",
  black: "#111111",
  rouge: "#C0392B",
  red: "#C0392B",
};

export function normalizeOptionName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function getColorPreview(name: string): string {
  if (/^#[0-9a-f]{6}$/i.test(name.trim())) return name.trim();
  return knownColors[normalizeOptionName(name)] ?? "#D4AF37";
}

export type CakeShapeCode = "round" | "square" | "heart" | "star" | "rectangle" | "unknown";

export function getShapeCode(name: string): CakeShapeCode {
  const normalized = normalizeOptionName(name);
  if (["round", "rond", "ronde", "circle", "cercle"].includes(normalized)) return "round";
  if (["square", "carre", "carree"].includes(normalized)) return "square";
  if (["heart", "coeur", "coer", "couer"].includes(normalized)) return "heart";
  if (["star", "etoile"].includes(normalized)) return "star";
  if (["rectangle", "rectangulaire"].includes(normalized)) return "rectangle";
  return "unknown";
}
