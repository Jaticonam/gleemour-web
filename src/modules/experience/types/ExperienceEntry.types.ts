import type { Product } from "@/shared/types/product";

export type ExperienceSource =
  | "home"
  | "catalogo"
  | "producto";

export type ExperienceMode =
  | "guided"
  | "personalization";

export type ExperienceSectionId =
  | "inicio"
  | "arreglos"
  | "presentacion"
  | "complementos"
  | "musica"
  | "mensaje"
  | "entrega"
  | "resumen";

export interface ExperienceEntryContext {
  source: ExperienceSource;
  mode: ExperienceMode;
  productId: string | null;
  fallbackUrl: string;
}

export interface ExperienceEntryState {
  context: ExperienceEntryContext;
  product: Product | null;
  loading: boolean;
  error: string | null;
}