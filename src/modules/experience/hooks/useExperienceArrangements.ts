import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loadAllProducts,
  loadAllSubcategories,
} from "@/integrations/sheets/fetchSheets";
import type {
  CatalogSubcategory,
  Category,
  Product,
} from "@/shared/types/product";
import { CATEGORIES } from "@/tenant/config/catalog";

import {
  filterExperienceProducts,
  filterExperienceSubcategories,
  getArrangementSubcategoryKey,
  getExperienceCategories,
  normalizeArrangementText,
  resolveInitialArrangementSelection,
} from "../utils/arrangements.utils";

interface UseExperienceArrangementsOptions {
  active: boolean;
  initialProduct: Product | null;
}

export interface ExperienceArrangementsState {
  categories: Category[];
  subcategories: CatalogSubcategory[];
  visibleSubcategories: CatalogSubcategory[];
  products: Product[];
  visibleProducts: Product[];
  selectedCategoryId: string;
  selectedSubcategoryKey: string;
  selectedSubcategory: CatalogSubcategory | null;
  selectedProduct: Product | null;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  selectCategory: (categoryId: string) => void;
  selectSubcategory: (
    subcategory: CatalogSubcategory | null,
  ) => void;
  selectProduct: (product: Product) => void;
  retry: () => void;
}

const EXPERIENCE_CATEGORIES =
  getExperienceCategories(CATEGORIES);

export function useExperienceArrangements({
  active,
  initialProduct,
}: UseExperienceArrangementsOptions): ExperienceArrangementsState {
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<
    CatalogSubcategory[]
  >([]);

  const [selectedCategoryId, setSelectedCategoryId] =
    useState("");

  const [
    selectedSubcategoryKey,
    setSelectedSubcategoryKey,
  ] = useState("");

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(initialProduct);

  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    if (!active || loaded) {
      return;
    }

    let mounted = true;

    setLoading(true);
    setError(null);

    Promise.all([
      loadAllProducts(),
      loadAllSubcategories(),
    ])
      .then(([loadedProducts, loadedSubcategories]) => {
        if (!mounted) return;

        setProducts(loadedProducts);
        setSubcategories(loadedSubcategories);
        setLoaded(true);
      })
      .catch((cause) => {
        if (!mounted) return;

        console.error(
          "Error cargando arreglos para Experience Studio:",
          cause,
        );

        setProducts([]);
        setSubcategories([]);
        setError(
          "No pudimos cargar los arreglos. Intenta nuevamente.",
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
  }, [active, loaded, requestVersion]);

  useEffect(() => {
    setSelectedProduct(initialProduct);

    if (!initialProduct) {
      setSelectedCategoryId("");
      setSelectedSubcategoryKey("");
      return;
    }

    setSelectedCategoryId(initialProduct.category.trim());

    if (!loaded) {
      setSelectedSubcategoryKey("");
      return;
    }

    const initialSelection =
      resolveInitialArrangementSelection(
        initialProduct,
        subcategories,
      );

    setSelectedCategoryId(initialSelection.categoryId);
    setSelectedSubcategoryKey(
      initialSelection.subcategoryKey,
    );
  }, [initialProduct, loaded, subcategories]);

  const visibleSubcategories = useMemo(
    () =>
      filterExperienceSubcategories(
        subcategories,
        selectedCategoryId,
      ),
    [selectedCategoryId, subcategories],
  );

  const selectedSubcategory = useMemo(() => {
    if (!selectedSubcategoryKey) {
      return null;
    }

    return (
      visibleSubcategories.find(
        (subcategory) =>
          getArrangementSubcategoryKey(
            subcategory.categoryId,
            subcategory.id,
          ) === selectedSubcategoryKey,
      ) ?? null
    );
  }, [
    selectedSubcategoryKey,
    visibleSubcategories,
  ]);

  const visibleProducts = useMemo(
    () =>
      filterExperienceProducts(
        products,
        selectedCategoryId,
        selectedSubcategory,
      ),
    [
      products,
      selectedCategoryId,
      selectedSubcategory,
    ],
  );

  const selectCategory = useCallback(
    (categoryId: string) => {
      const normalizedCategoryId =
        normalizeArrangementText(categoryId);

      const category = EXPERIENCE_CATEGORIES.find(
        (candidate) =>
          normalizeArrangementText(candidate.id) ===
          normalizedCategoryId,
      );

      if (!category) {
        return;
      }

      setSelectedCategoryId(category.id);
      setSelectedSubcategoryKey("");
    },
    [],
  );

  const selectSubcategory = useCallback(
    (subcategory: CatalogSubcategory | null) => {
      if (!subcategory) {
        setSelectedSubcategoryKey("");
        return;
      }

      if (
        normalizeArrangementText(
          subcategory.categoryId,
        ) !==
        normalizeArrangementText(selectedCategoryId)
      ) {
        return;
      }

      setSelectedSubcategoryKey(
        getArrangementSubcategoryKey(
          subcategory.categoryId,
          subcategory.id,
        ),
      );
    },
    [selectedCategoryId],
  );

  const selectProduct = useCallback(
    (product: Product) => {
      setSelectedProduct(product);
    },
    [],
  );

  const retry = useCallback(() => {
    setLoaded(false);
    setError(null);
    setRequestVersion((current) => current + 1);
  }, []);

  return {
    categories: EXPERIENCE_CATEGORIES,
    subcategories,
    visibleSubcategories,
    products,
    visibleProducts,
    selectedCategoryId,
    selectedSubcategoryKey,
    selectedSubcategory,
    selectedProduct,
    loading,
    loaded,
    error,
    selectCategory,
    selectSubcategory,
    selectProduct,
    retry,
  };
}