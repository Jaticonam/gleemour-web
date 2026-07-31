import { describe, expect, it } from "vitest";

import type { MusicTrack } from "./MusicTrack";
import { parseMusicIds, resolveProductMusic } from "./productMusic";

const musicLibrary: MusicTrack[] = [
  {
    id: "MUS001",
    title: "Perfect",
    description: "",
    musicType: "Canción",
    moodMusical: "Romántica",
    platform: "Spotify",
    priority: 100,
    status: "Publicado",
    url: "https://example.com/1",
  },
  {
    id: "MUS002",
    title: "Borrador",
    description: "",
    musicType: "Canción",
    moodMusical: "",
    platform: "Spotify",
    priority: 90,
    status: "Borrador",
    url: "https://example.com/2",
  },
  {
    id: "MUS003",
    title: "All of Me",
    description: "",
    musicType: "Canción",
    moodMusical: "Romántica",
    platform: "Spotify",
    priority: 80,
    status: "Publicado",
    url: "https://example.com/3",
  },
];

describe("parseMusicIds", () => {
  it("acepta separadores mixtos, normaliza y elimina duplicados", () => {
    expect(
      parseMusicIds(" mus001 | MUS003,mus001; MUS002 "),
    ).toEqual(["MUS001", "MUS003", "MUS002"]);
  });

  it("devuelve una lista vacía sin referencias", () => {
    expect(parseMusicIds("")).toEqual([]);
    expect(parseMusicIds(undefined)).toEqual([]);
  });
});

describe("resolveProductMusic", () => {
  it("preserva orden y devuelve solo canciones publicadas", () => {
    expect(
      resolveProductMusic(
        ["MUS003", "MUS002", "MUS001"],
        musicLibrary,
      ).map((track) => track.id),
    ).toEqual(["MUS003", "MUS001"]);
  });

  it("ignora IDs inexistentes y duplicados", () => {
    expect(
      resolveProductMusic(
        ["MUS001", "MUS999", "mus001", "MUS003"],
        musicLibrary,
      ).map((track) => track.id),
    ).toEqual(["MUS001", "MUS003"]);
  });
});