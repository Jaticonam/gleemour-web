import { useEffect, useMemo, useState } from "react";

import {
  resolveProductMusic,
  type MusicTrack,
} from "@/domain/music";
import { loadMusicLibrary } from "@/integrations/sheets/fetchSheets";

export interface UseMusicLibraryResult {
  tracks: MusicTrack[];
  loading: boolean;
  error: string | null;
}

export function useMusicLibrary(
  musicIds: readonly string[] = [],
): UseMusicLibraryResult {
  const musicKey = musicIds.join("|");

  const requestedMusicIds = useMemo(
    () => musicKey.split("|").filter(Boolean),
    [musicKey],
  );

  const [musicCatalog, setMusicCatalog] = useState<MusicTrack[]>([]);
  const [loadedKey, setLoadedKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!musicKey) {
      setMusicCatalog([]);
      setLoadedKey("");
      setError(null);
      return;
    }

    let active = true;

    setError(null);

    loadMusicLibrary()
      .then((musicTracks) => {
        if (!active) return;

        setMusicCatalog(musicTracks);
        setLoadedKey(musicKey);
      })
      .catch(() => {
        if (!active) return;

        setMusicCatalog([]);
        setLoadedKey(musicKey);
        setError("No pudimos cargar la biblioteca musical.");
      });

    return () => {
      active = false;
    };
  }, [musicKey]);

  const loading = Boolean(musicKey) && loadedKey !== musicKey;

  const tracks = useMemo(() => {
    if (loading || error) {
      return [];
    }

    return resolveProductMusic(
      requestedMusicIds,
      musicCatalog,
    );
  }, [
    error,
    loading,
    musicCatalog,
    requestedMusicIds,
  ]);

  return {
    tracks,
    loading,
    error,
  };
}