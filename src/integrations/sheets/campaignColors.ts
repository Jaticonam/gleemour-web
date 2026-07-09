function normalizeColorKey(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\w#-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const CAMPAIGN_COLOR_MAP: Record<string, string> = {
  /* ==========================================
     A
  ========================================== */

  amarillo: "catalog-campaign-yellow",
  yellow: "catalog-campaign-yellow",

  aqua: "catalog-campaign-aqua",
  agua: "catalog-campaign-aqua",

  azul: "catalog-campaign-blue",
  blue: "catalog-campaign-blue",
  "azul-clasico": "catalog-campaign-blue",
  "azul-medio": "catalog-campaign-blue",

  "azul-bebe": "catalog-campaign-baby-blue",
  "azul-bebé": "catalog-campaign-baby-blue",
  "baby-blue": "catalog-campaign-baby-blue",
  "celeste-pastel": "catalog-campaign-baby-blue",

  "azul-cielo": "catalog-campaign-sky",
  cielo: "catalog-campaign-sky",
  sky: "catalog-campaign-sky",
  celeste: "catalog-campaign-sky",

  "azul-cobalto": "catalog-campaign-cobalt",
  cobalto: "catalog-campaign-cobalt",
  cobalt: "catalog-campaign-cobalt",

  "azul-electrico": "catalog-campaign-electric-blue",
  "azul-eléctrico": "catalog-campaign-electric-blue",
  electrico: "catalog-campaign-electric-blue",
  eléctrico: "catalog-campaign-electric-blue",
  "electric-blue": "catalog-campaign-electric-blue",

  "azul-hielo": "catalog-campaign-ice-blue",
  hielo: "catalog-campaign-ice-blue",
  "ice-blue": "catalog-campaign-ice-blue",

  "azul-marino": "catalog-campaign-navy",
  marino: "catalog-campaign-navy",
  navy: "catalog-campaign-navy",
  "navy-blue": "catalog-campaign-navy",

  "azul-petroleo": "catalog-campaign-petrol",
  "azul-petróleo": "catalog-campaign-petrol",
  petroleo: "catalog-campaign-petrol",
  petróleo: "catalog-campaign-petrol",
  petrol: "catalog-campaign-petrol",

  "azul-rey": "catalog-campaign-royal-blue",
  azulino: "catalog-campaign-royal-blue",
  "royal-blue": "catalog-campaign-royal-blue",

  /* ==========================================
     B
  ========================================== */

  blanco: "catalog-campaign-white",
  white: "catalog-campaign-white",

  borgona: "catalog-campaign-burgundy",
  borgoña: "catalog-campaign-burgundy",
  burgundy: "catalog-campaign-burgundy",

  /* ==========================================
     C
  ========================================== */

  champagne: "catalog-campaign-champagne",

  cobre: "catalog-campaign-copper",
  copper: "catalog-campaign-copper",

  coral: "catalog-campaign-coral",

  crema: "catalog-campaign-cream",
  cream: "catalog-campaign-cream",

  /* ==========================================
     D
  ========================================== */

  dorado: "catalog-campaign-gold",
  oro: "catalog-campaign-gold",
  gold: "catalog-campaign-gold",

  durazno: "catalog-campaign-peach",
  peach: "catalog-campaign-peach",

  /* ==========================================
     E
  ========================================== */

  elegante: "catalog-campaign-elegant",
  "elegante-premium": "catalog-campaign-elegant",

  esmeralda: "catalog-campaign-emerald",
  emerald: "catalog-campaign-emerald",

  /* ==========================================
     F
  ========================================== */

  fucsia: "catalog-campaign-fuchsia",
  fuchsia: "catalog-campaign-fuchsia",

  /* ==========================================
     G
  ========================================== */

  gleemour: "catalog-campaign-gleemour",
  marca: "catalog-campaign-gleemour",
  principal: "catalog-campaign-gleemour",

  gris: "catalog-campaign-gray",
  gray: "catalog-campaign-gray",
  grey: "catalog-campaign-gray",

  /* ==========================================
     H
  ========================================== */

  halloween: "catalog-campaign-halloween",

  /* ==========================================
     J
  ========================================== */

  jade: "catalog-campaign-jade",

  /* ==========================================
     L
  ========================================== */

  lavanda: "catalog-campaign-lavender",
  lavender: "catalog-campaign-lavender",

  lila: "catalog-campaign-lilac",
  lilac: "catalog-campaign-lilac",

  lima: "catalog-campaign-lime",
  lime: "catalog-campaign-lime",

  /* ==========================================
     M
  ========================================== */

  magenta: "catalog-campaign-magenta",

  menta: "catalog-campaign-mint",
  mint: "catalog-campaign-mint",

  morado: "catalog-campaign-purple",
  purple: "catalog-campaign-purple",

  /* ==========================================
     N
  ========================================== */

  naranja: "catalog-campaign-orange",
  orange: "catalog-campaign-orange",

  navidad: "catalog-campaign-christmas",
  christmas: "catalog-campaign-christmas",

  negro: "catalog-campaign-dark",
  black: "catalog-campaign-dark",
  oscuro: "catalog-campaign-dark",

  /* ==========================================
     O
  ========================================== */

  oliva: "catalog-campaign-olive",
  olive: "catalog-campaign-olive",

  /* ==========================================
     P
  ========================================== */

  "palo-rosa": "catalog-campaign-dusty-rose",
  "rosa-viejo": "catalog-campaign-dusty-rose",
  "dusty-rose": "catalog-campaign-dusty-rose",

  plata: "catalog-campaign-silver",
  plateado: "catalog-campaign-silver",
  silver: "catalog-campaign-silver",

  premium: "catalog-campaign-premium",
  vip: "catalog-campaign-premium",

  primavera: "catalog-campaign-spring",
  spring: "catalog-campaign-spring",

  /* ==========================================
     R
  ========================================== */

  rojo: "catalog-campaign-red",
  red: "catalog-campaign-red",

  "rosa-pastel": "catalog-campaign-soft-pink",
  "rosado-pastel": "catalog-campaign-soft-pink",

  rosado: "catalog-campaign-pink",
  rosa: "catalog-campaign-pink",
  pink: "catalog-campaign-pink",

  /* ==========================================
     S
  ========================================== */

  salmon: "catalog-campaign-salmon",
  salmón: "catalog-campaign-salmon",

  /* ==========================================
     T
  ========================================== */

  terracota: "catalog-campaign-terracotta",
  terracotta: "catalog-campaign-terracotta",

  turquesa: "catalog-campaign-teal",
  turquoise: "catalog-campaign-teal",
  teal: "catalog-campaign-teal",

  /* ==========================================
     V
  ========================================== */

  verde: "catalog-campaign-green",
  green: "catalog-campaign-green",

  verano: "catalog-campaign-summer",
  summer: "catalog-campaign-summer",

  vino: "catalog-campaign-wine",
  granate: "catalog-campaign-wine",

  violeta: "catalog-campaign-violet",
  violet: "catalog-campaign-violet",

  /* ==========================================
     Hex de marca
  ========================================== */

  "#6a5a8a": "catalog-campaign-purple",
  "#eca4c2": "catalog-campaign-pink",
  "#f9c95b": "catalog-campaign-gold",
};

export function getCampaignColorClass(
  color: string | undefined | null,
): string {
  const key = normalizeColorKey(color);

  return CAMPAIGN_COLOR_MAP[key] ?? "catalog-campaign-gleemour";
}