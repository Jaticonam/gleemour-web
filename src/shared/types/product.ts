/**
 * Modelo principal de producto Gleemour.
 * Este contrato representa un producto listo para catálogo, detalle,
 * carrito, WhatsApp, campañas y futuras integraciones.
 */
export interface Product {
  /** Código único del producto. Ejemplo: GLM-001 */
  id: string;

  /** Nombre comercial visible para el cliente. */
  title: string;

  /** Descripción corta del producto. */
  description: string;

  /**
   * Categoría principal.
   * Debe coincidir con un id definido en src/config/categories.ts
   * Ejemplo: "para-enamorar"
   */
  category: string;

  /**
   * Categorías adicionales donde también debe aparecer el producto.
   * Permite vender el mismo detalle en varias emociones u ocasiones.
   */
  categories: string[];

  /**
   * Precio base/original.
   * Si existe offer_price válido, este precio se muestra como precio anterior.
   */
  price: number;

  /**
   * Precio de oferta.
   * Solo se considera oferta si es mayor a 0 y menor que price.
   */
  offer_price: number | null;

  /**
   * Stock disponible.
   * null significa que el producto no debe venderse aún.
   */
  stock: number | null;

  /** Imagen principal del producto. */
  img: string;

  /**
   * Prioridad comercial.
   * Mayor número = aparece antes.
   */
  priority: number;

  /**
   * Estado comercial del producto.
   * Valores recomendados: "Publicado", "Preventa", "Agotado", "Oculto".
   */
  status: string;

  /** Badges comerciales. Ejemplo: "Nuevo", "Oferta", "Más vendido". */
  badges: string[];

  /**
   * Atributos visuales/técnicos del producto.
   * Se muestran como badges informativos sobre la foto.
   * Ejemplo en Sheets: "natural|corporate"
   */
  attributes: string[];

  /**
   * Addons permitidos para este producto.
   * Ejemplo: chocolates, globos, peluches, tarjetas.
   */
  addons: string[];

  /** Ocasión emocional principal. */
  occasion?: string;

  /** Mensaje sugerido o intención emocional. */
  message?: string;

  /** Frase corta de venta emocional. */
  highlight?: string;

  /** Fecha de última actualización desde Sheets. */
  updated_at?: string;
}

/**
 * Complemento opcional para aumentar ticket promedio.
 */
export interface Addon {
  id: string;
  title: string;
  price: number;
  img: string;
  category: string;
  status: string;
  priority: number;
}

/**
 * Producto dentro del carrito.
 */
export interface CartItem extends Product {
  qty: number;
  note?: string;
  selectedAddons?: Addon[];
}

/**
 * Categoría comercial visible en filtros, catálogo y detalle.
 */
export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}
