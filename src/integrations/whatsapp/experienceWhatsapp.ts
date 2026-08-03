import type { MusicTrack } from "@/domain/music";
import type {
  Addon,
  Product,
} from "@/shared/types/product";
import { BRAND_CONFIG } from "@/tenant/config/brand";

export interface BuildExperienceWhatsAppMessageParams {
  product: Product;
  selectedAddons: Addon[];
  selectedMusic: MusicTrack | null;
  dedication: string;
  productPrice: number;
  addonsTotal: number;
  total: number;
}

function formatExperienceMoney(value: number): string {
  return `S/ ${value.toFixed(2)}`;
}

export function buildExperienceWhatsAppMessage({
  product,
  selectedAddons,
  selectedMusic,
  dedication,
  productPrice,
  addonsTotal,
  total,
}: BuildExperienceWhatsAppMessageParams): string {
  const dedicationText =
    dedication.trim() || "Sin dedicatoria.";

  const addonLines =
    selectedAddons.length > 0
      ? selectedAddons.map(
          (addon) =>
            `- ${addon.title} — ${formatExperienceMoney(addon.price)}`,
        )
      : ["Sin complementos."];

  const musicLines = selectedMusic
    ? [
        `Canción: ${selectedMusic.title}`,
        selectedMusic.platform
          ? `Plataforma: ${selectedMusic.platform}`
          : "",
        selectedMusic.url
          ? `Enlace: ${selectedMusic.url}`
          : "",
      ].filter(Boolean)
    : ["Sin canción."];

  return [
    BRAND_CONFIG.checkout.experience.whatsappTitle,
    "",
    BRAND_CONFIG.checkout.experience.intro,
    "",
    "*Arreglo principal*",
    `Producto: ${product.title}`,
    `Código: ${product.id}`,
    `Precio: ${formatExperienceMoney(productPrice)}`,
    "",
    "*Complementos*",
    ...addonLines,
    `Total complementos: ${formatExperienceMoney(addonsTotal)}`,
    "",
    "*Música*",
    ...musicLines,
    "",
    "*Dedicatoria*",
    dedicationText,
    "",
    `*Total estimado: ${formatExperienceMoney(total)}*`,
    "",
    BRAND_CONFIG.checkout.experience.disclaimer,
    "",
    BRAND_CONFIG.checkout.experience.closing,
  ].join("\n");
}

export function buildExperienceWhatsAppUrl(
  params: BuildExperienceWhatsAppMessageParams,
): string {
  const message = buildExperienceWhatsAppMessage(params);

  return `https://wa.me/${BRAND_CONFIG.contact.whatsapp}?text=${encodeURIComponent(
    message,
  )}`;
}