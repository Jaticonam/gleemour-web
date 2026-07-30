/**
 * Textos configurables para la página de detalle de producto.
 *
 * Este archivo permite adaptar la experiencia por marca, país o vertical
 * sin tocar componentes.
 */
export const PRODUCT_DETAIL_CONFIG = {
  empty: {
    title: "Detalle no encontrado",
    backLabel: "Volver al catálogo",
  },

  header: {
    fallbackTitle: "Detalle especial",
  },

  price: {
    label: "Precio total",
    oldPricePrefix: "Antes S/",
    totalLabel: "Total del pedido",
  },

  quantity: {
    label: "Cantidad",
    invalidMessage: "Ingresa una cantidad válida para continuar",
  },

  actions: {
    addToCart: "Reservar este detalle",
    invalidQty: "Ingresa una cantidad",
    whatsappDefault: "Pedir por WhatsApp",
    whatsappPreorder: "Consultar por WhatsApp",
    whatsappSoldOut: "Consultar disponibilidad",
  },

  trust: {
    text: "Coordinamos contigo cada detalle antes de confirmar.",
  },

  description: {
    fallback:
      "Un detalle pensado para emocionar, sorprender y hacer sentir especial a alguien importante.",
  },

  related: {
    title: "Más ideas para regalar",
  },

  notifications: {
    linkCopiedTitle: "Enlace copiado",
    linkCopiedDescription: "Comparte este detalle",
    addedToCartTitle: "Agregado al pedido",
    addedToCartDescription: "Tu detalle ya está en el pedido.",
  },
} as const;



