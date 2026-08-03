export const EXPERIENCE_DEDICATION_MAX_LENGTH = 240;
export const EXPERIENCE_DEDICATION_PREVIEW_LENGTH = 70;

export interface ExperienceDedicationSelection {
  productId: string;
  value: string;
  visited: boolean;
  confirmed: boolean;
}

function normalizeProductId(productId: string): string {
  return productId.trim();
}

export function normalizeExperienceDedication(
  value: string,
  maxLength = EXPERIENCE_DEDICATION_MAX_LENGTH,
): string {
  const safeMaxLength = Math.max(0, Math.floor(maxLength));

  return String(value ?? "").slice(0, safeMaxLength);
}

export function createExperienceDedicationSelection(
  productId = "",
): ExperienceDedicationSelection {
  return {
    productId: normalizeProductId(productId),
    value: "",
    visited: false,
    confirmed: false,
  };
}

export function syncExperienceDedicationSelection(
  current: ExperienceDedicationSelection,
  productId: string,
): ExperienceDedicationSelection {
  const normalizedProductId = normalizeProductId(productId);

  if (current.productId === normalizedProductId) {
    return current;
  }

  return createExperienceDedicationSelection(normalizedProductId);
}

export function visitExperienceDedication(
  current: ExperienceDedicationSelection,
  productId: string,
): ExperienceDedicationSelection {
  const synced = syncExperienceDedicationSelection(
    current,
    productId,
  );

  if (!synced.productId || synced.visited) {
    return synced;
  }

  return {
    ...synced,
    visited: true,
  };
}

export function updateExperienceDedication(
  current: ExperienceDedicationSelection,
  productId: string,
  value: string,
): ExperienceDedicationSelection {
  const synced = syncExperienceDedicationSelection(
    current,
    productId,
  );

  if (!synced.productId) {
    return synced;
  }

  return {
    ...synced,
    value: normalizeExperienceDedication(value),
    visited: true,
    confirmed: false,
  };
}

export function confirmExperienceDedication(
  current: ExperienceDedicationSelection,
  productId: string,
): ExperienceDedicationSelection {
  const synced = syncExperienceDedicationSelection(
    current,
    productId,
  );

  if (!synced.productId) {
    return synced;
  }

  return {
    ...synced,
    visited: true,
    confirmed: true,
  };
}

export function getExperienceDedicationValue(
  selection: ExperienceDedicationSelection,
  productId: string,
): string {
  return selection.productId === normalizeProductId(productId)
    ? selection.value
    : "";
}

export function hasExperienceDedication(
  value: string,
): boolean {
  return value.trim().length > 0;
}

export function getExperienceDedicationPreview(
  value: string,
  maxLength = EXPERIENCE_DEDICATION_PREVIEW_LENGTH,
): string {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "";
  }

  const safeMaxLength = Math.max(1, Math.floor(maxLength));

  return normalized.length > safeMaxLength
    ? `${normalized.slice(0, safeMaxLength)}…`
    : normalized;
}
