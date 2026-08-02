import { normalizeAddonReference } from "@/domain/product/addons";
import type { Addon } from "@/shared/types/product";

export interface ExperienceAddonSelection {
  productId: string;
  addons: Addon[];
}

function normalizeExperienceProductId(value: string): string {
  return value.trim().toLowerCase();
}

export function getExperienceSelectedAddons(
  selection: ExperienceAddonSelection,
  productId: string,
): Addon[] {
  const normalizedProductId =
    normalizeExperienceProductId(productId);

  if (
    !normalizedProductId ||
    selection.productId !== normalizedProductId
  ) {
    return [];
  }

  return selection.addons;
}

export function syncExperienceAddonSelection(
  selection: ExperienceAddonSelection,
  productId: string,
): ExperienceAddonSelection {
  const normalizedProductId =
    normalizeExperienceProductId(productId);

  if (selection.productId === normalizedProductId) {
    return selection;
  }

  return {
    productId: normalizedProductId,
    addons: [],
  };
}

export function isExperienceAddonAllowed(
  addon: Addon,
  availableAddons: readonly Addon[],
): boolean {
  const normalizedAddonId = normalizeAddonReference(addon.id);

  if (!normalizedAddonId) {
    return false;
  }

  return availableAddons.some(
    (availableAddon) =>
      normalizeAddonReference(availableAddon.id) ===
      normalizedAddonId,
  );
}

export function toggleExperienceAddonSelection(
  selection: ExperienceAddonSelection,
  productId: string,
  addon: Addon,
): ExperienceAddonSelection {
  const normalizedProductId =
    normalizeExperienceProductId(productId);

  if (!normalizedProductId) {
    return {
      productId: "",
      addons: [],
    };
  }

  const currentAddons =
    selection.productId === normalizedProductId
      ? selection.addons
      : [];

  const normalizedAddonId = normalizeAddonReference(addon.id);

  if (!normalizedAddonId) {
    return {
      productId: normalizedProductId,
      addons: [...currentAddons],
    };
  }

  const exists = currentAddons.some(
    (selectedAddon) =>
      normalizeAddonReference(selectedAddon.id) ===
      normalizedAddonId,
  );

  return {
    productId: normalizedProductId,
    addons: exists
      ? currentAddons.filter(
          (selectedAddon) =>
            normalizeAddonReference(selectedAddon.id) !==
            normalizedAddonId,
        )
      : [...currentAddons, addon],
  };
}

export function clearExperienceAddonSelection(
  productId: string,
): ExperienceAddonSelection {
  return {
    productId: normalizeExperienceProductId(productId),
    addons: [],
  };
}

export function getExperienceAddonsTotal(
  addons: readonly Addon[],
): number {
  return addons.reduce((total, addon) => {
    const price =
      Number.isFinite(addon.price) && addon.price > 0
        ? addon.price
        : 0;

    return total + price;
  }, 0);
}
export function canOpenExperienceAddons(
  productId: string | null | undefined,
): boolean {
  return Boolean(productId?.trim());
}

export function getExperienceTotal(
  productPrice: number,
  addonsTotal: number,
): number {
  const safeProductPrice =
    Number.isFinite(productPrice) && productPrice > 0
      ? productPrice
      : 0;

  const safeAddonsTotal =
    Number.isFinite(addonsTotal) && addonsTotal > 0
      ? addonsTotal
      : 0;

  return safeProductPrice + safeAddonsTotal;
}
