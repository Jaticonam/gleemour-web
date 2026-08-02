import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { resolveProductAddons } from "@/domain/product/addons";
import { loadAllAddons } from "@/integrations/sheets/fetchSheets";
import type { Addon, Product } from "@/shared/types/product";

import {
  clearExperienceAddonSelection,
  getExperienceAddonsTotal,
  getExperienceSelectedAddons,
  isExperienceAddonAllowed,
  syncExperienceAddonSelection,
  toggleExperienceAddonSelection,
  type ExperienceAddonSelection,
} from "../utils/addons.utils";

interface UseExperienceAddonsOptions {
  active: boolean;
  product: Product | null;
}

export interface ExperienceAddonsState {
  availableAddons: Addon[];
  selectedAddons: Addon[];
  addonsTotal: number;
  hasConfiguredAddons: boolean;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  toggleAddon: (addon: Addon) => void;
  clearAddons: () => void;
  retry: () => void;
}

const EMPTY_SELECTION: ExperienceAddonSelection = {
  productId: "",
  addons: [],
};

export function useExperienceAddons({
  active,
  product,
}: UseExperienceAddonsOptions): ExperienceAddonsState {
  const [addonCatalog, setAddonCatalog] = useState<Addon[]>([]);
  const [selection, setSelection] =
    useState<ExperienceAddonSelection>(EMPTY_SELECTION);

  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  const productId = product?.id ?? "";
  const configuredAddonIds = product?.addons ?? [];
  const hasConfiguredAddons = configuredAddonIds.length > 0;

  useEffect(() => {
    setSelection((current) =>
      syncExperienceAddonSelection(
        current,
        productId,
      ),
    );
  }, [productId]);

  useEffect(() => {
    if (
      !active ||
      !product ||
      !hasConfiguredAddons ||
      loaded
    ) {
      return;
    }

    let mounted = true;

    setLoading(true);
    setError(null);

    loadAllAddons()
      .then((addons) => {
        if (!mounted) return;

        setAddonCatalog(addons);
        setLoaded(true);
      })
      .catch((cause) => {
        if (!mounted) return;

        console.error(
          "Error cargando complementos para Experience Studio:",
          cause,
        );

        setAddonCatalog([]);
        setError(
          "No pudimos cargar los complementos. Intenta nuevamente.",
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
  }, [
    active,
    hasConfiguredAddons,
    loaded,
    product,
    requestVersion,
  ]);

  const availableAddons = useMemo(() => {
    if (!product) {
      return [];
    }

    return resolveProductAddons(
      product.addons,
      addonCatalog,
    );
  }, [addonCatalog, product]);

  const selectedAddons = useMemo(
    () =>
      getExperienceSelectedAddons(
        selection,
        productId,
      ),
    [productId, selection],
  );

  const addonsTotal = useMemo(
    () => getExperienceAddonsTotal(selectedAddons),
    [selectedAddons],
  );

  const toggleAddon = useCallback(
    (addon: Addon) => {
      if (
        !productId ||
        !isExperienceAddonAllowed(addon, availableAddons)
      ) {
        return;
      }

      setSelection((current) =>
        toggleExperienceAddonSelection(
          current,
          productId,
          addon,
        ),
      );
    },
    [availableAddons, productId],
  );

  const clearAddons = useCallback(() => {
    setSelection(
      clearExperienceAddonSelection(productId),
    );
  }, [productId]);

  const retry = useCallback(() => {
    if (!product || !hasConfiguredAddons) {
      return;
    }

    setLoaded(false);
    setError(null);
    setRequestVersion((current) => current + 1);
  }, [hasConfiguredAddons, product]);

  const runtimeLoading =
    active && hasConfiguredAddons ? loading : false;

  const runtimeLoaded = product
    ? !hasConfiguredAddons || loaded
    : false;

  const runtimeError =
    active && hasConfiguredAddons ? error : null;

  return {
    availableAddons,
    selectedAddons,
    addonsTotal,
    hasConfiguredAddons,
    loading: runtimeLoading,
    loaded: runtimeLoaded,
    error: runtimeError,
    toggleAddon,
    clearAddons,
    retry,
  };
}
