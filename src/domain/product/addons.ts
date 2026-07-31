import type { Addon } from "@/shared/types/product";

export function normalizeAddonReference(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveProductAddons(
  addonIds: readonly string[],
  addonCatalog: readonly Addon[],
): Addon[] {
  const addonsById = new Map<string, Addon>();

  addonCatalog.forEach((addon) => {
    const normalizedId = normalizeAddonReference(addon.id);

    if (normalizedId && !addonsById.has(normalizedId)) {
      addonsById.set(normalizedId, addon);
    }
  });

  const resolvedIds = new Set<string>();
  const resolvedAddons: Addon[] = [];

  addonIds.forEach((addonId) => {
    const normalizedId = normalizeAddonReference(addonId);

    if (!normalizedId || resolvedIds.has(normalizedId)) {
      return;
    }

    const addon = addonsById.get(normalizedId);

    if (!addon) {
      return;
    }

    resolvedIds.add(normalizedId);
    resolvedAddons.push(addon);
  });

  return resolvedAddons;
}
