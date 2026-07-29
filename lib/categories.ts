export type CategorySlug =
  | "anniversaire"
  | "mariage"
  | "baby-shower"
  | "graduation"
  | "saint-valentin";

export type Category = {
  id: number;
  name: string;
  slug?: string | null;
  created_at?: string;
};

type MarketingCategory = {
  label: string;
  slug: CategorySlug;
};

export const CAKE_CATEGORIES: MarketingCategory[] = [
  { label: "Anniversaire", slug: "anniversaire" },
  { label: "Mariage", slug: "mariage" },
  { label: "Baby Shower", slug: "baby-shower" },
  { label: "Graduation", slug: "graduation" },
  { label: "Saint-Valentin", slug: "saint-valentin" },
];

export const ALL_CATEGORIES_OPTION = { label: "Tous", slug: "" as const };

export const CATALOGUE_CATEGORIES = [ALL_CATEGORIES_OPTION, ...CAKE_CATEGORIES];

export function slugifyCategoryName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getCategoryLabelFromSlug(slug: string | null): string {
  if (!slug) {
    return ALL_CATEGORIES_OPTION.label;
  }

  const matchedCategory = CAKE_CATEGORIES.find((category) => category.slug === slug);
  return matchedCategory?.label ?? ALL_CATEGORIES_OPTION.label;
}

export function getCategorySlugFromLabel(label: string): string | null {
  if (label === ALL_CATEGORIES_OPTION.label) {
    return null;
  }

  const matchedCategory = CAKE_CATEGORIES.find((category) => category.label === label);
  return matchedCategory?.slug ?? null;
}

export function buildCatalogueCategoryUrl(slug: CategorySlug): string {
  return `/catalogue?category=${slug}`;
}
