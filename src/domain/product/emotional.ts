import type { Product } from "@/shared/types/product";

/**
 * Devuelve hint emocional contextual para cards,
 * recomendaciones y futuras automatizaciones.
 */
export function getEmotionalHint(product: Product): string {
  if (product.highlight) return product.highlight;

  if (product.message) return product.message;

  if (product.occasion) {
    return `Ideal para ${product.occasion}`;
  }

  const categories = product.categories ?? [product.category];
  const categoryText = categories.join(" ").toLowerCase();

  if (categoryText.includes("enamorar")) {
    return "Para decirlo bonito, sin dar tantas vueltas.";
  }

  if (categoryText.includes("especiales")) {
    return "Ideal para fechas que no se pueden dejar pasar.";
  }

  if (categoryText.includes("sorprender")) {
    return "Para llegar bonito y sin aviso.";
  }

  if (categoryText.includes("celebrar")) {
    return "Perfecto para hacer especial el momento.";
  }

  if (categoryText.includes("agradecer")) {
    return "Un gesto cálido para decir gracias.";
  }

  if (categoryText.includes("perdon")) {
    return "Un detalle para abrir conversación.";
  }

  if (categoryText.includes("acompa")) {
    return "Cuando las palabras no alcanzan.";
  }

  return "Un detalle listo para sorprender.";
}



