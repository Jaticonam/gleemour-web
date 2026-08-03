import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Product } from "@/shared/types/product";

import {
  EXPERIENCE_DEDICATION_MAX_LENGTH,
  confirmExperienceDedication,
  createExperienceDedicationSelection,
  getExperienceDedicationPreview,
  getExperienceDedicationValue,
  hasExperienceDedication,
  syncExperienceDedicationSelection,
  updateExperienceDedication,
  visitExperienceDedication,
  type ExperienceDedicationSelection,
} from "../utils/dedication.utils";

interface UseExperienceDedicationOptions {
  active: boolean;
  product: Product | null;
}

export interface ExperienceDedicationState {
  value: string;
  visited: boolean;
  confirmed: boolean;
  hasDedication: boolean;
  preview: string;
  maxLength: number;
  changeDedication: (value: string) => void;
  confirmDedication: () => void;
}

export function useExperienceDedication({
  active,
  product,
}: UseExperienceDedicationOptions): ExperienceDedicationState {
  const productId = product?.id ?? "";

  const [selection, setSelection] =
    useState<ExperienceDedicationSelection>(() =>
      createExperienceDedicationSelection(productId),
    );

  useEffect(() => {
    setSelection((current) =>
      syncExperienceDedicationSelection(
        current,
        productId,
      ),
    );
  }, [productId]);

  useEffect(() => {
    if (!active || !productId) {
      return;
    }

    setSelection((current) =>
      visitExperienceDedication(current, productId),
    );
  }, [active, productId]);

  const value = useMemo(
    () =>
      getExperienceDedicationValue(
        selection,
        productId,
      ),
    [productId, selection],
  );

  const belongsToCurrentProduct =
    selection.productId === productId;

  const visited =
    belongsToCurrentProduct && selection.visited;

  const confirmed =
    belongsToCurrentProduct && selection.confirmed;

  const hasDedication = useMemo(
    () => hasExperienceDedication(value),
    [value],
  );

  const preview = useMemo(
    () => getExperienceDedicationPreview(value),
    [value],
  );

  const changeDedication = useCallback(
    (nextValue: string) => {
      setSelection((current) =>
        updateExperienceDedication(
          current,
          productId,
          nextValue,
        ),
      );
    },
    [productId],
  );

  const confirmDedication = useCallback(() => {
    setSelection((current) =>
      confirmExperienceDedication(
        current,
        productId,
      ),
    );
  }, [productId]);

  return {
    value,
    visited,
    confirmed,
    hasDedication,
    preview,
    maxLength: EXPERIENCE_DEDICATION_MAX_LENGTH,
    changeDedication,
    confirmDedication,
  };
}
