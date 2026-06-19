/**
 * Textos configurables para cards de producto.
 * Permite adaptar catálogo, campañas y verticales sin tocar componentes.
 */
export const PRODUCT_CARD_CONFIG = {
  badges: {
    inCartSuffix: "en pedido",

    attributes: {
      natural: "Naturales",
      artificial: "Artificiales",
      corporate: "Corporativo",
      premium: "Premium",
      express: "Express",
    },
  },

  price: {
    preorder: "Consultar",
    preorderHelp: "Te orientamos por WhatsApp",
    offerText: "Inspiración de temporada",
    defaultText: "Precio del detalle",
  },

  viewers: {
    suffix: "viendo ahora",
  },

  actions: {
    whatsappPreorder: "Consultar",
    whatsappSoldOut: "Consultar disponibilidad",
    addMore: "Agregar más",
    addToCart: "Agregar pedido",
    soldOut: "Agotado",
  },
} as const;



