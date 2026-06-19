import type { Product } from "@/shared/types/product";

/**
 * Garantiza contrato estable de producto.
 * Este helper protege al frontend de datos incompletos o inconsistentes.
 */
export function ensureCatalogProduct(
  product: Partial<Product>
): Product {
  const category = product.category ?? "";
  const price = Number(product.price) || 0;

  const offerPrice =
    product.offer_price !== null &&
    product.offer_price !== undefined &&
    Number(product.offer_price) > 0
      ? Number(product.offer_price)
      : null;

  return {
    id: product.id ?? "",
    title: product.title ?? "",
    description: product.description ?? "",

    category,
    categories:
      product.categories && product.categories.length > 0
        ? product.categories
        : [category].filter(Boolean),

    price,
    offer_price: offerPrice,

    stock:
      product.stock === null || product.stock === undefined
        ? null
        : Number(product.stock),

    img: product.img ?? "",

    priority: Number(product.priority) || 0,
    status: product.status ?? "Publicado",

    badges: product.badges ?? [],
    attributes: product.attributes ?? [],
    addons: product.addons ?? [],

    occasion: product.occasion,
    message: product.message,
    highlight: product.highlight,
    updated_at: product.updated_at,
  };
}

/**
 * Normaliza una lista de productos.
 */
export function normalizeProducts(
  products: Partial<Product>[]
): Product[] {
  return products.map(ensureCatalogProduct);
}



