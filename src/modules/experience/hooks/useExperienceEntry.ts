import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  getCatalogUrl,
  getProductDetailUrl,
} from "@/app/routes/routes";
import { loadAllProducts } from "@/integrations/sheets/fetchSheets";
import type { Product } from "@/shared/types/product";

import type {
  ExperienceEntryContext,
  ExperienceEntryState,
  ExperienceSource,
} from "../types/ExperienceEntry.types";

const EXPERIENCE_SOURCES = new Set<ExperienceSource>([
  "home",
  "catalogo",
  "producto",
]);

function normalizeSource(value: string | null): ExperienceSource {
  if (value && EXPERIENCE_SOURCES.has(value as ExperienceSource)) {
    return value as ExperienceSource;
  }

  return "home";
}

function getFallbackUrl(
  source: ExperienceSource,
  productId: string | null,
): string {
  if (source === "catalogo") {
    return getCatalogUrl();
  }

  if (source === "producto" && productId) {
    return getProductDetailUrl(productId);
  }

  return "/";
}

export function useExperienceEntry(): ExperienceEntryState {
  const [searchParams] = useSearchParams();

  const rawSource = searchParams.get("origen");
  const rawProductId = searchParams.get("producto");

  const context = useMemo<ExperienceEntryContext>(() => {
    const normalizedProductId = rawProductId?.trim() || null;
    const requestedSource = normalizeSource(rawSource);

    const source =
      requestedSource === "producto" && !normalizedProductId
        ? "home"
        : requestedSource;

    const mode =
      source === "producto" && normalizedProductId
        ? "personalization"
        : "guided";

    return {
      source,
      mode,
      productId: mode === "personalization" ? normalizedProductId : null,
      fallbackUrl: getFallbackUrl(source, normalizedProductId),
    };
  }, [rawProductId, rawSource]);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(
    context.mode === "personalization",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    if (context.mode !== "personalization" || !context.productId) {
      setProduct(null);
      setLoading(false);
      setError(null);
      return () => {
        mounted = false;
      };
    }

    setProduct(null);
    setLoading(true);
    setError(null);

    loadAllProducts()
      .then((products) => {
        if (!mounted) return;

        const normalizedProductId = context.productId?.toLowerCase();

        const selectedProduct =
          products.find(
            (candidate) =>
              candidate.id.trim().toLowerCase() === normalizedProductId,
          ) ?? null;

        setProduct(selectedProduct);

        if (!selectedProduct) {
          setError("No encontramos el producto seleccionado.");
        }
      })
      .catch((cause) => {
        if (!mounted) return;

        console.error(
          "Error cargando el producto para Experience Studio:",
          cause,
        );

        setProduct(null);
        setError(
          "No pudimos cargar el producto. Puedes comenzar desde el inicio.",
        );
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [context.mode, context.productId]);

  return {
    context,
    product,
    loading,
    error,
  };
}