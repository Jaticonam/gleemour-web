import { useEffect, useState } from "react";

import type { MusicTrack } from "@/domain/music";
import { loadMusicLibrary } from "@/integrations/sheets/fetchSheets";

export interface UseMusicLibraryResult {
  tracks: MusicTrack[];
  loading: boolean;
  error: string | null;
}

export function useMusicLibrary(): UseMusicLibraryResult {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    loadMusicLibrary()
      .then((musicTracks) => {
        if (!active) return;

        setTracks(musicTracks);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;

        setTracks([]);
        setError("No pudimos cargar la biblioteca musical.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return {
    tracks,
    loading,
    error,
  };
}