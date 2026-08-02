import type { MusicTrack } from "@/domain/music";

export interface ExperienceMusicSelection {
  productId: string;
  musicId: string;
}

export function normalizeExperienceMusicId(
  value: unknown,
): string {
  return String(value ?? "").trim().toUpperCase();
}

function normalizeExperienceProductId(
  value: unknown,
): string {
  return String(value ?? "").trim().toLowerCase();
}

export function syncExperienceMusicSelection(
  selection: ExperienceMusicSelection,
  productId: string | null | undefined,
): ExperienceMusicSelection {
  const normalizedProductId =
    normalizeExperienceProductId(productId);

  if (
    normalizeExperienceProductId(selection.productId) ===
    normalizedProductId
  ) {
    return selection;
  }

  return {
    productId: normalizedProductId,
    musicId: "",
  };
}

export function getExperienceSelectedMusicId(
  selection: ExperienceMusicSelection,
  productId: string | null | undefined,
): string {
  if (
    normalizeExperienceProductId(selection.productId) !==
    normalizeExperienceProductId(productId)
  ) {
    return "";
  }

  return normalizeExperienceMusicId(selection.musicId);
}

export function isExperienceMusicAllowed(
  musicId: string,
  availableTracks: readonly MusicTrack[],
): boolean {
  const normalizedMusicId =
    normalizeExperienceMusicId(musicId);

  if (!normalizedMusicId) {
    return false;
  }

  return availableTracks.some(
    (track) =>
      normalizeExperienceMusicId(track.id) ===
      normalizedMusicId,
  );
}

export function selectExperienceMusic(
  selection: ExperienceMusicSelection,
  productId: string | null | undefined,
  musicId: string,
  availableTracks: readonly MusicTrack[],
): ExperienceMusicSelection {
  const scopedSelection =
    syncExperienceMusicSelection(selection, productId);

  if (!scopedSelection.productId) {
    return {
      productId: "",
      musicId: "",
    };
  }

  const normalizedMusicId =
    normalizeExperienceMusicId(musicId);

  if (!normalizedMusicId) {
    return {
      productId: scopedSelection.productId,
      musicId: "",
    };
  }

  if (
    !isExperienceMusicAllowed(
      normalizedMusicId,
      availableTracks,
    )
  ) {
    return scopedSelection;
  }

  return {
    productId: scopedSelection.productId,
    musicId: normalizedMusicId,
  };
}

export function clearExperienceMusicSelection(
  productId: string | null | undefined,
): ExperienceMusicSelection {
  return {
    productId: normalizeExperienceProductId(productId),
    musicId: "",
  };
}

export function getExperienceSelectedTrack(
  selection: ExperienceMusicSelection,
  productId: string | null | undefined,
  availableTracks: readonly MusicTrack[],
): MusicTrack | null {
  const selectedMusicId =
    getExperienceSelectedMusicId(selection, productId);

  if (!selectedMusicId) {
    return null;
  }

  return (
    availableTracks.find(
      (track) =>
        normalizeExperienceMusicId(track.id) ===
        selectedMusicId,
    ) ?? null
  );
}
