import type { Product } from "@/shared/types/product";

/**
 * Conserva todos los estados administrativos y descarta únicamente
 * registros que no pueden identificarse de forma segura en el workspace.
 *
 * La validación comercial del catálogo público permanece en
 * validateProducts.ts y no debe reutilizarse aquí porque oculta borradores.
 */
export function validateAdminProducts(products: Product[]): Product[] {
  const seen = new Set<string>();

  return products.filter((product) => {
    const id = product.id.trim();

    if (!id) {
      console.warn("Producto administrativo descartado: sin id", product);
      return false;
    }

    if (seen.has(id)) {
      console.warn("Producto administrativo descartado: id duplicado ->", id);
      return false;
    }

    if (!product.title.trim()) {
      console.warn("Producto administrativo descartado: sin title ->", id);
      return false;
    }

    seen.add(id);
    return true;
  });
}
