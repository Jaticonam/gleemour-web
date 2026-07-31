import type { MusicTrack } from "./MusicTrack";

function normalizeMusicId(value: unknown): string {
  return String(value ?? "").trim().toUpperCase();
}

export function parseMusicIds(value: unknown): string[] {
  const seen = new Set<string>();

  return String(value ?? "")
    .split(/[|,;]/)
    .map(normalizeMusicId)
    .filter((musicId) => {
      if (!musicId || seen.has(musicId)) {
        return false;
      }

      seen.add(musicId);
      return true;
    });
}

export function resolveProductMusic(
  musicIds: readonly string[],
  musicLibrary: readonly MusicTrack[],
): MusicTrack[] {
  const publishedById = new Map<string, MusicTrack>();

  for (const track of musicLibrary) {
    const musicId = normalizeMusicId(track.id);

    if (
      musicId &&
      track.status.trim().toLowerCase() === "publicado" &&
      !publishedById.has(musicId)
    ) {
      publishedById.set(musicId, track);
    }
  }

  const resolved: MusicTrack[] = [];
  const seen = new Set<string>();

  for (const rawMusicId of musicIds) {
    const musicId = normalizeMusicId(rawMusicId);

    if (!musicId || seen.has(musicId)) {
      continue;
    }

    seen.add(musicId);

    const track = publishedById.get(musicId);

    if (track) {
      resolved.push(track);
    }
  }

  return resolved;
}