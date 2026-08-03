/**
 * Configuración del checkout y mensajes de WhatsApp.
 * Estos textos controlan cómo se arma la intención de compra del cliente.
 */
export const CHECKOUT_CONFIG = {
  whatsappTitle: "*✨ Pedido Gleemour*",
  intro: "Hola, quiero enviar este detalle:",
  closing: "Quisiera coordinar dedicatoria, horario y entrega. Gracias 💐",

  experience: {
    whatsappTitle: "*✨ Experiencia Gleemour*",
    intro: "Hola, quiero consultar este detalle personalizado:",
    disclaimer:
      "El total es estimado y está sujeto a disponibilidad y confirmación.",
    closing:
      "Quisiera coordinar disponibilidad, horario y entrega. Gracias 💐",
  },
} as const;