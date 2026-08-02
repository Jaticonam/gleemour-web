import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { MusicTrack } from "@/domain/music";
import { resolveProductMusic } from "@/domain/music/productMusic";
import { loadMusicLibrary } from "@/integrations/sheets/fetchSheets";
import type { Product } from "@/shared/types/product";

import {
  clearExperienceMusicSelection,
  getExperienceSelectedMusicId,
  getExperienceSelectedTrack,
  selectExperienceMusic,
  syncExperienceMusicSelection,
  type ExperienceMusicSelection,
} from "../utils/music.utils";

interface UseExperienceMusicOptions {
  active: boolean;
  product: Product | null;
}

export interface ExperienceMusicState {
  availableTracks: MusicTrack[];
  selectedMusicId: string;
  selectedTrack: MusicTrack | null;
  hasConfiguredMusic: boolean;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  selectMusic: (musicId: string) => void;
  clearMusic: () => void;
  retry: () => void;
}

const EMPTY_SELECTION: ExperienceMusicSelection = {
  productId: "",
  musicId: "",
};

export function useExperienceMusic({
  active,
  product,
}: UseExperienceMusicOptions): ExperienceMusicState {
  const [musicCatalog, setMusicCatalog] = useState<
    MusicTrack[]
  >([]);

  const [selection, setSelection] =
    useState<ExperienceMusicSelection>(EMPTY_SELECTION);

  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);

  const productId = product?.id ?? "";
  const configuredMusicIds = product?.music ?? [];
  const hasConfiguredMusic = configuredMusicIds.length > 0;

  useEffect(() => {
    setSelection((current) =>
      syncExperienceMusicSelection(current, productId),
    );
  }, [productId]);

  useEffect(() => {
    if (
      !active ||
      !product ||
      !hasConfiguredMusic ||
      loaded
    ) {
      return;
    }

    let mounted = true;

    setLoading(true);
    setError(null);

    loadMusicLibrary()
      .then((tracks) => {
        if (!mounted) return;

        setMusicCatalog(tracks);
        setLoaded(true);
      })
      .catch((cause) => {
        if (!mounted) return;

        console.error(
          "Error cargando música para Experience Studio:",
          cause,
        );

        setMusicCatalog([]);
        setError(
          "No pudimos cargar la biblioteca musical. Intenta nuevamente.",
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
    hasConfiguredMusic,
    loaded,
    product,
    requestVersion,
  ]);

  const availableTracks = useMemo(() => {
    if (!product) {
      return [];
    }

    return resolveProductMusic(
      product.music ?? [],
      musicCatalog,
    );
  }, [musicCatalog, product]);

  const selectedMusicId = useMemo(
    () =>
      getExperienceSelectedMusicId(
        selection,
        productId,
      ),
    [productId, selection],
  );

  const selectedTrack = useMemo(
    () =>
      getExperienceSelectedTrack(
        selection,
        productId,
        availableTracks,
      ),
    [availableTracks, productId, selection],
  );

  const selectMusic = useCallback(
    (musicId: string) => {
      setSelection((current) =>
        selectExperienceMusic(
          current,
          productId,
          musicId,
          availableTracks,
        ),
      );
    },
    [availableTracks, productId],
  );

  const clearMusic = useCallback(() => {
    setSelection(
      clearExperienceMusicSelection(productId),
    );
  }, [productId]);

  const retry = useCallback(() => {
    if (!product || !hasConfiguredMusic) {
      return;
    }

    setLoaded(false);
    setError(null);
    setRequestVersion((current) => current + 1);
  }, [hasConfiguredMusic, product]);

  const runtimeLoading =
    active && hasConfiguredMusic ? loading : false;

  const runtimeLoaded = product
    ? !hasConfiguredMusic || loaded
    : false;

  const runtimeError =
    active && hasConfiguredMusic ? error : null;

  return {
    availableTracks,
    selectedMusicId,
    selectedTrack,
    hasConfiguredMusic,
    loading: runtimeLoading,
    loaded: runtimeLoaded,
    error: runtimeError,
    selectMusic,
    clearMusic,
    retry,
  };
}
