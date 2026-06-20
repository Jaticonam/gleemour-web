export const BADGE_PRESENTATION = {
  nuevo: {
    icon: "🌸",
    label: "Nuevo",
    className: "product-badge--new",
  },
  "más vendido": {
    icon: "🔥",
    label: "Más vendido",
    className: "product-badge--top",
  },
  "mas vendido": {
    icon: "🔥",
    label: "Más vendido",
    className: "product-badge--top",
  },
  premium: {
    icon: "✨",
    label: "Premium",
    className: "product-badge--premium",
  },
  oferta: {
    icon: "🎉",
    label: "Oferta",
    className: "product-badge--offer",
  },
  especial: {
    icon: "💝",
    label: "Especial",
    className: "product-badge--special",
  },
  "últimas unidades": {
    icon: "⏳",
    label: "Últimas unidades",
    className: "product-badge--last",
  },
  "ultimas unidades": {
    icon: "⏳",
    label: "Últimas unidades",
    className: "product-badge--last",
  },
  express: {
    icon: "🚚",
    label: "Express",
    className: "product-badge--express",
  },
  temporada: {
    icon: "🌼",
    label: "Temporada",
    className: "product-badge--season",
  },
} as const;

export function getBadgePresentation(badge: string) {
  const key = badge.trim().toLowerCase();

  return (
    BADGE_PRESENTATION[key as keyof typeof BADGE_PRESENTATION] ?? {
      icon: "💐",
      label: badge,
      className: "product-badge--default",
    }
  );
}

export function sortBadges(badges: string[] = []) {
  const priority = [
    "oferta",
    "más vendido",
    "mas vendido",
    "premium",
    "especial",
    "nuevo",
    "express",
    "últimas unidades",
    "ultimas unidades",
    "temporada",
  ];

  return [...badges].sort((a, b) => {
    const aIndex = priority.indexOf(a.trim().toLowerCase());
    const bIndex = priority.indexOf(b.trim().toLowerCase());

    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });
}
