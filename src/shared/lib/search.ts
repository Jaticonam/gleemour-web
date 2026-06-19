import { Product } from "@/shared/types/product";

export const normalize = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-_./]/g, "");

export const searchProducts = (products: Product[], query: string) => {
  const rawTerm = query.trim();

  if (!rawTerm) return products;

  const term = normalize(rawTerm);

  const SEARCH_SYNONYMS: Record<string, string[]> = {
    natural: ["natural", "naturales"],
    naturales: ["natural", "naturales"],

    artificial: ["artificial", "artificiales"],
    artificiales: ["artificial", "artificiales"],

    corporativo: ["corporativo", "corporativos", "corporate"],
    corporativos: ["corporativo", "corporativos", "corporate"],
    corporate: ["corporativo", "corporativos", "corporate"],
  };

  const searchVariants = SEARCH_SYNONYMS[term] ?? [term];

  return products
    .map((p) => {
      const id = normalize(p.id);
      const title = normalize(p.title);
      const description = normalize(p.description);
      const category = normalize(p.category);

      const badges = normalize(
        Array.isArray(p.badges) ? p.badges.join(" ") : ""
      );

      const attributes = normalize(
        Array.isArray(p.attributes) ? p.attributes.join(" ") : ""
      );

      let score = 0;

      searchVariants.forEach((variant) => {
        if (id === variant) score += 1000;
        else if (id.startsWith(variant)) score += 700;
        else if (variant.length >= 3 && id.includes(variant)) score += 500;

        if (title.includes(variant)) score += 300;
        if (attributes.includes(variant)) score += 250;
        if (description.includes(variant)) score += 180;
        if (category.includes(variant)) score += 100;
        if (badges.includes(variant)) score += 80;
      });

      return { product: p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.product);
};



