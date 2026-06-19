export interface BadgeRule {
  id: string;
  label: string;
  keywords: string[];
  className: string;
  animation?: string;
  priority: number;
}

/**
 * Badges comerciales oficiales.
 * Se usan en catálogo, campañas y recomendaciones.
 */
export const BADGE_RULES: BadgeRule[] = [
  {
    id: "para-mama",
    label: "Para mamá",
    keywords: [
      "para mama",
      "para mamá",
      "dia de la madre",
      "día de la madre",
      "mamá",
      "mama",
    ],
    className: "badge-mothers-day",
    animation: "badge-anim",
    priority: 0,
  },

  {
    id: "oferta",
    label: "Oferta",
    keywords: [
      "oferta",
      "promo",
      "promocion",
      "promoción",
      "descuento",
    ],
    className: "badge-offer",
    priority: 1,
  },

  {
    id: "mas-vendido",
    label: "Más vendido",
    keywords: [
      "mas vendido",
      "más vendido",
      "top ventas",
      "top",
      "destacado",
    ],
    className: "badge-best-seller",
    priority: 2,
  },

  {
    id: "nuevo",
    label: "Nuevo",
    keywords: ["nuevo", "new"],
    className: "badge-new",
    animation: "badge-anim",
    priority: 3,
  },

  {
    id: "preventa",
    label: "Preventa",
    keywords: [
      "preventa",
      "pre venta",
      "lanzamiento",
    ],
    className: "badge-preorder",
    animation: "badge-anim",
    priority: 4,
  },

  {
    id: "edicion-especial",
    label: "Edición especial",
    keywords: [
      "edicion especial",
      "edición especial",
      "especial",
      "exclusivo",
    ],
    className: "badge-special",
    priority: 5,
  },

  {
    id: "ultimas-unidades",
    label: "Últimas unidades",
    keywords: [
      "ultimas unidades",
      "últimas unidades",
      "ultimos",
      "últimos",
    ],
    className: "badge-last-units",
    priority: 6,
  },

  {
    id: "premium",
    label: "Premium",
    keywords: ["premium", "vip", "elegante"],
    className: "badge-premium",
    priority: 7,
  },
];

/**
 * Normaliza texto de badge.
 */
export function normalizeBadgeText(
  badge: string
): string {
  return badge
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Obtiene configuración visual de un badge.
 */
export function getBadgePresentation(
  badge: string
) {
  const value = normalizeBadgeText(badge);

  const matchedRule = BADGE_RULES.find((rule) =>
    rule.keywords.some((keyword) =>
      value.includes(
        normalizeBadgeText(keyword)
      )
    )
  );

  if (matchedRule) {
    return {
      className: matchedRule.className,
      animation: matchedRule.animation || "",
      priority: matchedRule.priority,
    };
  }

  return {
    className: "badge-default",
    animation: "",
    priority: 999,
  };
}

/**
 * Ordena badges según prioridad visual.
 */
export function sortBadges(
  badges: string[]
): string[] {
  return [...badges].sort((a, b) => {
    const aPriority =
      getBadgePresentation(a).priority;

    const bPriority =
      getBadgePresentation(b).priority;

    return aPriority - bPriority;
  });
}



