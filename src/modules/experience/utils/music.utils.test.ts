import { describe, expect, it } from "vitest";

import type { MusicTrack } from "@/domain/music";

import {
  clearExperienceMusicSelection,
  getExperienceSelectedMusicId,
  getExperienceSelectedTrack,
  isExperienceMusicAllowed,
  normalizeExperienceMusicId,
  selectExperienceMusic,
  syncExperienceMusicSelection,
  type ExperienceMusicSelection,
} from "./music.utils";

const tracks: MusicTrack[] = [
  {
    id: "MUS001",
    title: "Perfect",
    description: "Canción romántica.",
    musicType: "Canción",
    moodMusical: "Romántica",
    platform: "Spotify",
    priority: 100,
    status: "Publicado",
    url: "https://example.com/mus001",
  },
  {
    id: "MUS003",
    title: "All of Me",
    description: "Balada romántica.",
    musicType: "Canción",
    moodMusical: "Romántica",
    platform: "Spotify",
    priority: 90,
    status: "Publicado",
    url: "https://example.com/mus003",
  },
];

describe("Experience music utilities", () => {
  it("normaliza IDs musicales", () => {
    expect(normalizeExperienceMusicId(" mus001 ")).toBe(
      "MUS001",
    );
  });

  it("preserva la selección mientras el producto no cambia", () => {
    const selection: ExperienceMusicSelection = {
      productId: "glee001",
      musicId: "MUS001",
    };

    expect(
      syncExperienceMusicSelection(selection, "GLEE001"),
    ).toBe(selection);
  });

  it("limpia la canción cuando cambia el producto", () => {
    expect(
      syncExperienceMusicSelection(
        {
          productId: "glee001",
          musicId: "MUS001",
        },
        "GLEE002",
      ),
    ).toEqual({
      productId: "glee002",
      musicId: "",
    });
  });

  it("selecciona únicamente canciones disponibles", () => {
    const selection = selectExperienceMusic(
      {
        productId: "glee001",
        musicId: "",
      },
      "GLEE001",
      "mus003",
      tracks,
    );

    expect(selection).toEqual({
      productId: "glee001",
      musicId: "MUS003",
    });
  });

  it("rechaza una canción que no pertenece al producto", () => {
    const initial: ExperienceMusicSelection = {
      productId: "glee001",
      musicId: "MUS001",
    };

    expect(
      selectExperienceMusic(
        initial,
        "GLEE001",
        "MUS999",
        tracks,
      ),
    ).toBe(initial);
  });

  it("permite elegir la opción sin canción", () => {
    expect(
      selectExperienceMusic(
        {
          productId: "glee001",
          musicId: "MUS001",
        },
        "GLEE001",
        "",
        tracks,
      ),
    ).toEqual({
      productId: "glee001",
      musicId: "",
    });
  });

  it("bloquea selecciones sin producto principal", () => {
    expect(
      selectExperienceMusic(
        {
          productId: "",
          musicId: "",
        },
        null,
        "MUS001",
        tracks,
      ),
    ).toEqual({
      productId: "",
      musicId: "",
    });
  });

  it("identifica canciones permitidas normalizando el ID", () => {
    expect(
      isExperienceMusicAllowed(" mus001 ", tracks),
    ).toBe(true);

    expect(
      isExperienceMusicAllowed("MUS999", tracks),
    ).toBe(false);
  });

  it("resuelve la pista seleccionada para el producto actual", () => {
    expect(
      getExperienceSelectedTrack(
        {
          productId: "glee001",
          musicId: "mus003",
        },
        "GLEE001",
        tracks,
      )?.id,
    ).toBe("MUS003");
  });

  it("oculta la selección de otro producto", () => {
    expect(
      getExperienceSelectedMusicId(
        {
          productId: "glee001",
          musicId: "MUS001",
        },
        "GLEE002",
      ),
    ).toBe("");
  });

  it("limpia la canción conservando el producto", () => {
    expect(
      clearExperienceMusicSelection(" GLEE001 "),
    ).toEqual({
      productId: "glee001",
      musicId: "",
    });
  });
});
