
import type { Product } from "@/shared/types/product";
import { BRAND_CONFIG } from "@/tenant/config/brand";
import { isPreorderStatus, isSoldOutStatus } from "@/tenant/config/statuses";
import { getProductPrice } from "@/domain/product/pricing";

interface BuildProductWhatsAppMessageParams {
  product: Product;
  qty?: number;
}

/**
 * Construye mensaje de WhatsApp para consulta o pedido de un producto.
 * Centraliza copy, precio y estado comercial.
 */
export function buildProductWhatsAppMessage({
  product,
  qty = 1,
}: BuildProductWhatsAppMessageParams): string {
  const price = getProductPrice(product);

  const statusText = isPreorderStatus(product.status)
    ? BRAND_CONFIG.productCard.whatsappPreventa
    : isSoldOutStatus(product.status) || product.stock === 0
    ? BRAND_CONFIG.productCard.whatsappRestock
    : BRAND_CONFIG.productCard.whatsappDefault;

  return [
    `${statusText}:`,
    "",
    `Producto: ${product.title}`,
    `Código: ${product.id}`,
    `Precio: S/ ${price.toFixed(2)}`,
    `Cantidad: ${qty}`,
    "",
    BRAND_CONFIG.checkout.closing,
  ].join("\n");
}

/**
 * Construye URL final de WhatsApp para abrir conversación.
 */
export function buildProductWhatsAppUrl(params: BuildProductWhatsAppMessageParams): string {
  const message = buildProductWhatsAppMessage(params);

  return `https://wa.me/${BRAND_CONFIG.contact.whatsapp}?text=${encodeURIComponent(
    message
  )}`;
}


