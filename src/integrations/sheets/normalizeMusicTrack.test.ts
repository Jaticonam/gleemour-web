import { describe, expect, it } from "vitest";

import { normalizeMusicTrack } from "./normalizeMusicTrack";

describe("normalizeMusicTrack", () => {
  it("normaliza el contrato de music_library", () => {
    const track = normalizeMusicTrack({
      id: "MUS001",
      title: "Perfect - Ed Sheeran",
      description: "Canción romántica.",
      music_type: "Canción",
      moodmusical: "Balada romántica",
      platform: "Spotify",
      priority: "100",
      status: "Publicado",
      url: "https://open.spotify.com/track/example",
    });

    expect(track).toEqual({
      id: "MUS001",
      title: "Perfect - Ed Sheeran",
      description: "Canción romántica.",
      musicType: "Canción",
      moodMusical: "Balada romántica",
      platform: "Spotify",
      priority: 100,
      status: "Publicado",
      url: "https://open.spotify.com/track/example",
    });
  });

  it("tolera campos vacíos y normaliza el estado", () => {
    const track = normalizeMusicTrack({
      id: "MUS002",
      title: "",
      description: "",
      music_type: "",
      moodmusical: "",
      platform: "",
      priority: "",
      status: "publicada",
      url: "",
    });

    expect(track.title).toBe("");
    expect(track.priority).toBe(0);
    expect(track.status).toBe("Publicado");
    expect(track.url).toBe("");
  });
});